/**
 * 认证和授权中间件
 * 处理 JWT 令牌验证和用户权限检查
 */

import { Request, Response, NextFunction } from 'express';
import { 
  extractBearerToken, 
  verifyToken, 
  hasPermission, 
  isTokenBlacklisted 
} from '../utils/auth';
import { ApiResponse, JwtPayload } from '../types';

// 扩展 Express Request 类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * 认证中间件
 * 验证 JWT 令牌并将用户信息添加到请求对象中
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    const token = extractBearerToken(authHeader);

    if (!token) {
      const response: ApiResponse = {
        success: false,
        error: 'MISSING_TOKEN',
        message: '缺少访问令牌',
        timestamp: new Date().toISOString(),
      };
      res.status(401).json(response);
      return;
    }

    // 检查令牌是否在黑名单中
    if (isTokenBlacklisted(token)) {
      const response: ApiResponse = {
        success: false,
        error: 'TOKEN_BLACKLISTED',
        message: '令牌已失效',
        timestamp: new Date().toISOString(),
      };
      res.status(401).json(response);
      return;
    }

    // 验证令牌
    const payload = verifyToken(token);
    if (!payload) {
      const response: ApiResponse = {
        success: false,
        error: 'INVALID_TOKEN',
        message: '无效的访问令牌',
        timestamp: new Date().toISOString(),
      };
      res.status(401).json(response);
      return;
    }

    // 将用户信息添加到请求对象
    req.user = payload;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'AUTHENTICATION_ERROR',
      message: '认证过程中发生错误',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
}

/**
 * 可选认证中间件
 * 如果提供了令牌则验证，否则继续执行
 */
export function optionalAuthenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    const token = extractBearerToken(authHeader);

    if (token && !isTokenBlacklisted(token)) {
      const payload = verifyToken(token);
      if (payload) {
        req.user = payload;
      }
    }

    next();
  } catch (error) {
    console.error('Optional authentication middleware error:', error);
    // 可选认证失败时不阻止请求继续
    next();
  }
}

/**
 * 授权中间件工厂函数
 * 创建检查特定角色权限的中间件
 * @param requiredRoles 需要的角色列表
 * @returns Express 中间件函数
 */
export function authorize(requiredRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // 确保用户已认证
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'UNAUTHENTICATED',
          message: '请先登录',
          timestamp: new Date().toISOString(),
        };
        res.status(401).json(response);
        return;
      }

      // 检查用户权限
      if (!hasPermission(req.user.role, requiredRoles)) {
        const response: ApiResponse = {
          success: false,
          error: 'INSUFFICIENT_PERMISSIONS',
          message: '权限不足',
          timestamp: new Date().toISOString(),
        };
        res.status(403).json(response);
        return;
      }

      next();
    } catch (error) {
      console.error('Authorization middleware error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'AUTHORIZATION_ERROR',
        message: '授权过程中发生错误',
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  };
}

/**
 * 资源所有者检查中间件
 * 确保用户只能访问自己的资源
 * @param getUserIdFromParams 从请求参数中获取用户 ID 的函数
 * @returns Express 中间件函数
 */
export function checkResourceOwnership(
  getUserIdFromParams: (req: Request) => string
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // 确保用户已认证
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'UNAUTHENTICATED',
          message: '请先登录',
          timestamp: new Date().toISOString(),
        };
        res.status(401).json(response);
        return;
      }

      const resourceUserId = getUserIdFromParams(req);
      const currentUserId = req.user.userId;

      // 管理员可以访问所有资源
      if (hasPermission(req.user.role, ['ADMIN'])) {
        next();
        return;
      }

      // 检查是否为资源所有者
      if (resourceUserId !== currentUserId) {
        const response: ApiResponse = {
          success: false,
          error: 'ACCESS_DENIED',
          message: '无权访问此资源',
          timestamp: new Date().toISOString(),
        };
        res.status(403).json(response);
        return;
      }

      next();
    } catch (error) {
      console.error('Resource ownership middleware error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'OWNERSHIP_CHECK_ERROR',
        message: '资源所有权检查过程中发生错误',
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  };
}
