/**
 * 错误处理中间件
 * 统一处理应用程序中的错误并返回标准化的错误响应
 */

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ApiResponse, ApiError } from '../types';

/**
 * 自定义应用错误类
 */
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // 确保堆栈跟踪正确
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 验证错误类
 */
export class ValidationError extends AppError {
  public details: any;

  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

/**
 * 资源未找到错误类
 */
export class NotFoundError extends AppError {
  constructor(resource: string = '资源') {
    super(`${resource}未找到`, 404, 'NOT_FOUND');
  }
}

/**
 * 权限不足错误类
 */
export class ForbiddenError extends AppError {
  constructor(message: string = '权限不足') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * 未授权错误类
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = '未授权访问') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * 冲突错误类
 */
export class ConflictError extends AppError {
  constructor(message: string = '资源冲突') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * 处理 Prisma 错误
 * @param error Prisma 错误
 * @returns AppError 应用错误
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): AppError {
  switch (error.code) {
    case 'P2002':
      // 唯一约束违反
      const field = error.meta?.target as string[] | undefined;
      const fieldName = field ? field[0] : '字段';
      return new ConflictError(`${fieldName}已存在`);

    case 'P2025':
      // 记录未找到
      return new NotFoundError();

    case 'P2003':
      // 外键约束违反
      return new ValidationError('关联数据不存在');

    case 'P2014':
      // 关系违反
      return new ValidationError('数据关系约束违反');

    case 'P2021':
      // 表不存在
      return new AppError('数据表不存在', 500, 'DATABASE_ERROR');

    case 'P2022':
      // 列不存在
      return new AppError('数据列不存在', 500, 'DATABASE_ERROR');

    default:
      console.error('Unhandled Prisma error:', error);
      return new AppError('数据库操作失败', 500, 'DATABASE_ERROR');
  }
}

/**
 * 处理验证错误
 * @param error 验证错误
 * @returns AppError 应用错误
 */
function handleValidationError(error: any): AppError {
  if (error.details) {
    // Joi 验证错误
    const message = error.details.map((detail: any) => detail.message).join(', ');
    return new ValidationError(message, error.details);
  }

  return new ValidationError(error.message || '数据验证失败');
}

/**
 * 错误处理中间件
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let appError: AppError;

  // 处理不同类型的错误
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    appError = handlePrismaError(error);
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    appError = new ValidationError('数据验证失败');
  } else if (error.name === 'ValidationError') {
    appError = handleValidationError(error);
  } else if (error.name === 'JsonWebTokenError') {
    appError = new UnauthorizedError('无效的访问令牌');
  } else if (error.name === 'TokenExpiredError') {
    appError = new UnauthorizedError('访问令牌已过期');
  } else if (error.name === 'SyntaxError' && 'body' in error) {
    appError = new ValidationError('请求体格式错误');
  } else {
    // 未知错误
    console.error('Unhandled error:', error);
    appError = new AppError(
      process.env.NODE_ENV === 'production' ? '服务器内部错误' : error.message,
      500,
      'INTERNAL_ERROR',
      false
    );
  }

  // 构建错误响应
  const errorResponse: ApiResponse<ApiError> = {
    success: false,
    error: appError.code,
    message: appError.message,
    timestamp: new Date().toISOString(),
  };

  // 在开发环境中包含错误详情
  if (process.env.NODE_ENV === 'development') {
    errorResponse.data = {
      code: appError.code,
      message: appError.message,
      statusCode: appError.statusCode,
      details: (appError as any).details || undefined,
      stack: appError.stack,
    } as ApiError & { stack?: string };
  }

  // 记录错误日志
  if (!appError.isOperational || appError.statusCode >= 500) {
    console.error('Error occurred:', {
      error: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
      stack: appError.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.userId,
    });
  }

  res.status(appError.statusCode).json(errorResponse);
}

/**
 * 404 错误处理中间件
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse = {
    success: false,
    error: 'NOT_FOUND',
    message: `路由 ${req.method} ${req.path} 未找到`,
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(response);
}

/**
 * 异步错误包装器
 * 自动捕获异步函数中的错误并传递给错误处理中间件
 */
export function asyncHandler<T extends any[]>(
  fn: (req: Request, res: Response, next: NextFunction, ...args: T) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction, ...args: T) => {
    Promise.resolve(fn(req, res, next, ...args)).catch(next);
  };
}
