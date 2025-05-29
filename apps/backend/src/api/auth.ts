/**
 * 认证 API 路由
 * 提供用户注册、登录、登出等认证相关接口
 */

import express from 'express';
import { z } from 'zod';
import { db } from '../models/database';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  blacklistToken,
  isValidEmail,
  validatePassword
} from '../utils/auth';
import { authenticate } from '../middleware/auth';
import { validate, userSchemas } from '../middleware/validation';
import { asyncHandler, ValidationError, UnauthorizedError, ConflictError } from '../middleware/errorHandler';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '../types';

const router = express.Router();

/**
 * POST /api/auth/register
 * 用户注册
 */
router.post(
  '/register',
  validate(userSchemas.register),
  asyncHandler(async (req, res) => {
    const data: RegisterRequest = req.body;

    // 验证邮箱格式
    if (!isValidEmail(data.email)) {
      throw new ValidationError('邮箱格式不正确');
    }

    // 验证密码强度
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      throw new ValidationError('密码强度不足', passwordValidation.errors);
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = await db.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUserByEmail) {
      throw new ConflictError('邮箱已被注册');
    }

    // 检查用户名是否已存在
    const existingUserByUsername = await db.prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUserByUsername) {
      throw new ConflictError('用户名已被使用');
    }

    // 加密密码
    const hashedPassword = await hashPassword(data.password);

    // 创建用户
    const user = await db.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    // 生成令牌
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const authResponse: AuthResponse = {
      user,
      token: accessToken,
      refreshToken,
    };

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: authResponse,
      message: '注册成功',
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  })
);

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post(
  '/login',
  validate(userSchemas.login),
  asyncHandler(async (req, res) => {
    const data: LoginRequest = req.body;

    // 查找用户
    const user = await db.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError('邮箱或密码错误');
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('邮箱或密码错误');
    }

    // 生成令牌
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const authResponse: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      token: accessToken,
      refreshToken,
    };

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: authResponse,
      message: '登录成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/auth/logout
 * 用户登出
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req, res) => {
    // 获取当前令牌
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (token) {
      // 将令牌加入黑名单
      blacklistToken(token);
    }

    const response: ApiResponse = {
      success: true,
      message: '登出成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/auth/me
 * 获取当前用户信息
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await db.prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        profile: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('用户不存在');
    }

    // 解析 profile JSON
    const formattedUser = {
      ...user,
      profile: user.profile ? JSON.parse(user.profile) : null,
    };

    const response: ApiResponse = {
      success: true,
      data: formattedUser,
      message: '获取用户信息成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * PUT /api/auth/profile
 * 更新用户资料
 */
router.put(
  '/profile',
  authenticate,
  validate(userSchemas.updateProfile),
  asyncHandler(async (req, res) => {
    const { username, profile } = req.body;

    // 如果更新用户名，检查是否已存在
    if (username) {
      const existingUser = await db.prisma.user.findFirst({
        where: {
          username,
          id: { not: req.user!.userId },
        },
      });

      if (existingUser) {
        throw new ConflictError('用户名已被使用');
      }
    }

    // 更新用户信息
    const user = await db.prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        username,
        profile: profile ? JSON.stringify(profile) : undefined,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        profile: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 解析 profile JSON
    const formattedUser = {
      ...user,
      profile: user.profile ? JSON.parse(user.profile) : null,
    };

    const response: ApiResponse = {
      success: true,
      data: formattedUser,
      message: '更新用户资料成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/auth/change-password
 * 修改密码
 */
router.post(
  '/change-password',
  authenticate,
  validate(z.object({
    currentPassword: z.string().min(1, '当前密码不能为空'),
    newPassword: z.string().min(8, '新密码至少 8 个字符').max(100, '新密码最多 100 个字符'),
  })),
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // 获取用户当前密码
    const user = await db.prisma.user.findUnique({
      where: { id: req.user!.userId },
    });

    if (!user) {
      throw new UnauthorizedError('用户不存在');
    }

    // 验证当前密码
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('当前密码错误');
    }

    // 验证新密码强度
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new ValidationError('新密码强度不足', passwordValidation.errors);
    }

    // 加密新密码
    const hashedNewPassword = await hashPassword(newPassword);

    // 更新密码
    await db.prisma.user.update({
      where: { id: req.user!.userId },
      data: { password: hashedNewPassword },
    });

    const response: ApiResponse = {
      success: true,
      message: '修改密码成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

export default router;
