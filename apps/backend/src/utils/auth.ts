/**
 * 认证和授权工具函数
 * 提供 JWT 令牌生成、验证和密码加密功能
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JwtPayload } from '../types';

/**
 * JWT 配置
 */
const JWT_SECRET: string =
  process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN: string =
  process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

/**
 * 密码加密
 * @param password 明文密码
 * @returns Promise<string> 加密后的密码
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * 验证密码
 * @param password 明文密码
 * @param hashedPassword 加密后的密码
 * @returns Promise<boolean> 密码是否匹配
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * 生成访问令牌
 * @param payload JWT 载荷
 * @returns string JWT 令牌
 */
export function generateAccessToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>
): string {
  return (jwt.sign as any)(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'ecommerce-platform',
    audience: 'ecommerce-users',
  });
}

/**
 * 生成刷新令牌
 * @param payload JWT 载荷
 * @returns string 刷新令牌
 */
export function generateRefreshToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>
): string {
  return (jwt.sign as any)(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: 'ecommerce-platform',
    audience: 'ecommerce-users',
  });
}

/**
 * 验证 JWT 令牌
 * @param token JWT 令牌
 * @returns JwtPayload | null 解码后的载荷或 null
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'ecommerce-platform',
      audience: 'ecommerce-users',
    }) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * 从请求头中提取 Bearer 令牌
 * @param authHeader Authorization 头
 * @returns string | null 提取的令牌或 null
 */
export function extractBearerToken(
  authHeader: string | undefined
): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * 检查用户角色权限
 * @param userRole 用户角色
 * @param requiredRoles 需要的角色列表
 * @returns boolean 是否有权限
 */
export function hasPermission(
  userRole: string,
  requiredRoles: string[]
): boolean {
  // 角色层级：SUPER_ADMIN > ADMIN > CUSTOMER
  const roleHierarchy: Record<string, number> = {
    CUSTOMER: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3,
  };

  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = Math.min(
    ...requiredRoles.map((role) => roleHierarchy[role] || Infinity)
  );

  return userLevel >= requiredLevel;
}

/**
 * 生成随机字符串
 * @param length 字符串长度
 * @returns string 随机字符串
 */
export function generateRandomString(length: number = 32): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns boolean 是否为有效邮箱
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证密码强度
 * @param password 密码
 * @returns object 验证结果
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('密码长度至少为 8 位');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('密码必须包含至少一个大写字母');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('密码必须包含至少一个小写字母');
  }

  if (!/\d/.test(password)) {
    errors.push('密码必须包含至少一个数字');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('密码必须包含至少一个特殊字符');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 令牌黑名单（简单实现，生产环境建议使用 Redis）
 */
const tokenBlacklist = new Set<string>();

/**
 * 将令牌加入黑名单
 * @param token JWT 令牌
 */
export function blacklistToken(token: string): void {
  tokenBlacklist.add(token);
}

/**
 * 检查令牌是否在黑名单中
 * @param token JWT 令牌
 * @returns boolean 是否在黑名单中
 */
export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token);
}
