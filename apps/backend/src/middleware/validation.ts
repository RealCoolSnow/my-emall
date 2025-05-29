/**
 * 数据验证中间件
 * 使用 Zod 进行请求数据验证
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from './errorHandler';

/**
 * 验证中间件工厂函数
 * @param schema Zod 验证模式
 * @param target 验证目标 ('body' | 'query' | 'params')
 * @returns Express 中间件函数
 */
export function validate(
  schema: z.ZodSchema,
  target: 'body' | 'query' | 'params' = 'body'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[target];
      const result = schema.safeParse(data);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        throw new ValidationError('数据验证失败', errors);
      }

      // 将验证后的数据替换原始数据
      req[target] = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

// 通用验证模式
export const commonSchemas = {
  // ID 验证
  id: z.string().min(1, 'ID 不能为空'),

  // 分页验证基础对象
  paginationBase: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10)),
  }),

  // 分页验证
  pagination: z
    .object({
      page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1)),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10)),
    })
    .refine((data) => data.page >= 1, { message: '页码必须大于 0' })
    .refine((data) => data.limit >= 1 && data.limit <= 100, {
      message: '每页数量必须在 1-100 之间',
    }),

  // 排序验证基础对象
  sortBase: z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),

  // 排序验证
  sort: z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
};

// 用户相关验证模式
export const userSchemas = {
  // 注册验证
  register: z.object({
    email: z.string().email('邮箱格式不正确'),
    username: z
      .string()
      .min(3, '用户名至少 3 个字符')
      .max(20, '用户名最多 20 个字符'),
    password: z
      .string()
      .min(8, '密码至少 8 个字符')
      .max(100, '密码最多 100 个字符'),
  }),

  // 登录验证
  login: z.object({
    email: z.string().email('邮箱格式不正确'),
    password: z.string().min(1, '密码不能为空'),
  }),

  // 更新用户信息验证
  updateProfile: z.object({
    username: z
      .string()
      .min(3, '用户名至少 3 个字符')
      .max(20, '用户名最多 20 个字符')
      .optional(),
    profile: z.record(z.any()).optional(),
  }),
};

// 产品相关验证模式
export const productSchemas = {
  // 创建产品验证
  create: z.object({
    name: z
      .string()
      .min(1, '产品名称不能为空')
      .max(100, '产品名称最多 100 个字符'),
    description: z.string().max(1000, '产品描述最多 1000 个字符').optional(),
    price: z.number().positive('价格必须大于 0'),
    stock: z.number().int().min(0, '库存不能为负数'),
    categoryId: z.string().min(1, '分类 ID 不能为空'),
    imageUrls: z.array(z.string().url('图片 URL 格式不正确')).optional(),
    attributes: z.record(z.any()).optional(),
  }),

  // 更新产品验证
  update: z.object({
    name: z
      .string()
      .min(1, '产品名称不能为空')
      .max(100, '产品名称最多 100 个字符')
      .optional(),
    description: z.string().max(1000, '产品描述最多 1000 个字符').optional(),
    price: z.number().positive('价格必须大于 0').optional(),
    stock: z.number().int().min(0, '库存不能为负数').optional(),
    categoryId: z.string().min(1, '分类 ID 不能为空').optional(),
    imageUrls: z.array(z.string().url('图片 URL 格式不正确')).optional(),
    attributes: z.record(z.any()).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']).optional(),
  }),

  // 产品查询验证
  query: z.object({
    ...commonSchemas.paginationBase.shape,
    ...commonSchemas.sortBase.shape,
    categoryId: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']).optional(),
    search: z.string().optional(),
    minPrice: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined)),
    maxPrice: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined)),
  }),
};

// 订单相关验证模式
export const orderSchemas = {
  // 创建订单验证
  create: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().min(1, '产品 ID 不能为空'),
          quantity: z.number().int().positive('数量必须大于 0'),
        })
      )
      .min(1, '订单至少包含一个商品'),
    shippingAddress: z.object({
      street: z.string().min(1, '街道地址不能为空'),
      city: z.string().min(1, '城市不能为空'),
      state: z.string().min(1, '省份不能为空'),
      zipCode: z.string().min(1, '邮编不能为空'),
      country: z.string().min(1, '国家不能为空'),
    }),
    paymentMethod: z.string().min(1, '支付方式不能为空'),
    couponCodes: z.array(z.string()).optional(),
    notes: z.string().max(500, '备注最多 500 个字符').optional(),
  }),

  // 更新订单验证
  update: z.object({
    status: z
      .enum([
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'REFUNDED',
      ])
      .optional(),
    paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
    shippingAddress: z.string().optional(),
    notes: z.string().max(500, '备注最多 500 个字符').optional(),
  }),

  // 订单查询验证
  query: z.object({
    ...commonSchemas.paginationBase.shape,
    ...commonSchemas.sortBase.shape,
    userId: z.string().optional(),
    status: z
      .enum([
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'REFUNDED',
      ])
      .optional(),
    paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
};

// 优惠券相关验证模式
export const couponSchemas = {
  // 创建优惠券验证
  create: z
    .object({
      code: z
        .string()
        .min(1, '优惠券代码不能为空')
        .max(20, '优惠券代码最多 20 个字符'),
      name: z
        .string()
        .min(1, '优惠券名称不能为空')
        .max(100, '优惠券名称最多 100 个字符'),
      description: z.string().max(500, '优惠券描述最多 500 个字符').optional(),
      type: z.enum(['FIXED_AMOUNT', 'PERCENTAGE', 'FREE_SHIPPING']),
      value: z.number().positive('优惠值必须大于 0'),
      minAmount: z.number().min(0, '最小金额不能为负数').optional(),
      maxDiscount: z.number().positive('最大折扣必须大于 0').optional(),
      startDate: z.string().datetime('开始时间格式不正确'),
      endDate: z.string().datetime('结束时间格式不正确'),
      usageLimit: z.number().int().positive('使用限制必须大于 0').optional(),
      isActive: z.boolean().optional(),
    })
    .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
      message: '结束时间必须晚于开始时间',
    }),

  // 应用优惠券验证
  apply: z.object({
    orderItems: z
      .array(
        z.object({
          productId: z.string().min(1, '产品 ID 不能为空'),
          quantity: z.number().int().positive('数量必须大于 0'),
          price: z.number().positive('价格必须大于 0'),
        })
      )
      .min(1, '订单至少包含一个商品'),
    subtotal: z.number().min(0, '小计不能为负数'),
    shippingCost: z.number().min(0, '运费不能为负数'),
    couponCodes: z
      .array(z.string().min(1, '优惠券代码不能为空'))
      .min(1, '至少提供一个优惠券代码'),
    userId: z.string().min(1, '用户 ID 不能为空'),
  }),
};

// 购物车相关验证模式
export const cartSchemas = {
  // 添加到购物车验证
  addItem: z.object({
    productId: z.string().min(1, '产品 ID 不能为空'),
    quantity: z.number().int().positive('数量必须大于 0'),
  }),

  // 更新购物车项验证
  updateItem: z.object({
    quantity: z.number().int().positive('数量必须大于 0'),
  }),
};

// 评价相关验证模式
export const reviewSchemas = {
  // 创建评价验证
  create: z.object({
    productId: z.string().min(1, '产品 ID 不能为空'),
    rating: z.number().int().min(1, '评分最低 1 分').max(5, '评分最高 5 分'),
    comment: z.string().max(1000, '评价内容最多 1000 个字符').optional(),
  }),
};

// 分类相关验证模式
export const categorySchemas = {
  // 创建分类验证
  create: z.object({
    name: z
      .string()
      .min(1, '分类名称不能为空')
      .max(50, '分类名称最多 50 个字符'),
    description: z.string().max(500, '分类描述最多 500 个字符').optional(),
    imageUrl: z.string().url('图片 URL 格式不正确').optional(),
    parentId: z.string().optional(),
  }),

  // 更新分类验证
  update: z.object({
    name: z
      .string()
      .min(1, '分类名称不能为空')
      .max(50, '分类名称最多 50 个字符')
      .optional(),
    description: z.string().max(500, '分类描述最多 500 个字符').optional(),
    imageUrl: z.string().url('图片 URL 格式不正确').optional(),
    parentId: z.string().optional(),
  }),
};
