/**
 * 优惠券 API 路由
 * 提供优惠券的创建、查询、应用等操作接口
 */

import express from 'express';
import { z } from 'zod';
import { CouponService } from 'coupons/services';
import { db } from '../models/database';
import {
  authenticate,
  authorize,
  optionalAuthenticate,
} from '../middleware/auth';
import {
  validate,
  couponSchemas,
  commonSchemas,
} from '../middleware/validation';
import {
  asyncHandler,
  NotFoundError,
  ValidationError,
} from '../middleware/errorHandler';
import { ApiResponse, CreateCouponRequest, ApplyCouponRequest } from '../types';

const router = express.Router();
const couponService = new CouponService();

/**
 * GET /api/coupons
 * 获取优惠券列表
 * 管理员可以查看所有优惠券，普通用户只能查看有效的优惠券
 */
router.get(
  '/',
  optionalAuthenticate,
  validate(commonSchemas.pagination, 'query'),
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    // 如果不是管理员，只显示有效的优惠券
    if (!req.user || !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      where.isActive = true;
      where.endDate = { gte: new Date() };
    }

    const [coupons, total] = await Promise.all([
      db.prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.prisma.coupon.count({ where }),
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        data: coupons,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
      message: '获取优惠券列表成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/coupons/:id
 * 根据 ID 获取优惠券详情
 */
router.get(
  '/:id',
  validate(z.object({ id: z.string().min(1, '优惠券ID不能为空') }), 'params'),
  optionalAuthenticate,
  asyncHandler(async (req, res) => {
    const coupon = await db.prisma.coupon.findUnique({
      where: { id: req.params.id },
    });

    if (!coupon) {
      throw new NotFoundError('优惠券');
    }

    // 如果不是管理员，检查优惠券是否有效
    if (!req.user || !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      if (!coupon.isActive || coupon.endDate < new Date()) {
        throw new NotFoundError('优惠券');
      }
    }

    const response: ApiResponse = {
      success: true,
      data: coupon,
      message: '获取优惠券详情成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/coupons/code/:code
 * 根据代码获取优惠券信息
 */
router.get(
  '/code/:code',
  authenticate,
  asyncHandler(async (req, res) => {
    const coupon = await db.prisma.coupon.findUnique({
      where: { code: req.params.code },
    });

    if (!coupon) {
      throw new NotFoundError('优惠券');
    }

    // 检查优惠券是否有效
    if (!coupon.isActive) {
      throw new ValidationError('优惠券已失效');
    }

    if (coupon.endDate < new Date()) {
      throw new ValidationError('优惠券已过期');
    }

    if (coupon.startDate > new Date()) {
      throw new ValidationError('优惠券尚未生效');
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new ValidationError('优惠券使用次数已达上限');
    }

    const response: ApiResponse = {
      success: true,
      data: coupon,
      message: '获取优惠券信息成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/coupons
 * 创建新优惠券
 * 需要管理员权限
 */
router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  validate(couponSchemas.create),
  asyncHandler(async (req, res) => {
    const data: CreateCouponRequest = req.body;

    // 检查优惠券代码是否已存在
    const existingCoupon = await db.prisma.coupon.findUnique({
      where: { code: data.code },
    });

    if (existingCoupon) {
      throw new ValidationError('优惠券代码已存在');
    }

    const coupon = await db.prisma.coupon.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        type: data.type,
        value: data.value,
        minAmount: data.minAmount,
        maxDiscount: data.maxDiscount,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        usageLimit: data.usageLimit,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: coupon,
      message: '创建优惠券成功',
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  })
);

/**
 * POST /api/coupons/validate
 * 验证优惠券是否有效
 */
router.post(
  '/validate',
  validate(z.object({
    code: z.string().min(1, '优惠券代码不能为空'),
    subtotal: z.number().min(0, '订单金额不能为负数'),
  })),
  asyncHandler(async (req, res) => {
    const { code, subtotal } = req.body;

    const coupon = await db.prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      const response: ApiResponse = {
        success: true,
        data: {
          isValid: false,
          reason: '优惠券不存在',
        },
        message: '优惠券验证完成',
        timestamp: new Date().toISOString(),
      };
      return res.json(response);
    }

    // 检查优惠券是否有效
    let isValid = true;
    let reason = '';

    if (!coupon.isActive) {
      isValid = false;
      reason = '优惠券已失效';
    } else if (coupon.endDate < new Date()) {
      isValid = false;
      reason = '优惠券已过期';
    } else if (coupon.startDate > new Date()) {
      isValid = false;
      reason = '优惠券尚未生效';
    } else if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      isValid = false;
      reason = '优惠券使用次数已达上限';
    } else if (coupon.minAmount && subtotal < coupon.minAmount) {
      isValid = false;
      reason = `订单金额不足，最低消费 ${coupon.minAmount} 元`;
    }

    const response: ApiResponse = {
      success: true,
      data: {
        isValid,
        reason: isValid ? undefined : reason,
        coupon: isValid ? coupon : undefined,
      },
      message: '优惠券验证完成',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/coupons/apply
 * 应用优惠券计算折扣
 * 需要用户认证
 */
router.post(
  '/apply',
  authenticate,
  validate(z.object({
    codes: z.array(z.string()).min(1, '至少需要一个优惠券代码'),
    subtotal: z.number().min(0, '订单金额不能为负数'),
    items: z.array(z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      price: z.number().min(0),
    })),
  })),
  asyncHandler(async (req, res) => {
    const { codes, subtotal, items } = req.body;

    // 获取优惠券信息
    const coupons = await db.prisma.coupon.findMany({
      where: {
        code: { in: codes },
        isActive: true,
      },
    });

    if (coupons.length !== codes.length) {
      throw new ValidationError('部分优惠券无效或已失效');
    }

    // 简化的折扣计算逻辑
    let totalDiscount = 0;
    const appliedCoupons = [];

    for (const coupon of coupons) {
      // 检查优惠券是否满足使用条件
      if (coupon.minAmount && subtotal < coupon.minAmount) {
        continue; // 跳过不满足条件的优惠券
      }

      let discount = 0;
      if (coupon.type === 'PERCENTAGE') {
        discount = (subtotal * coupon.value) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else if (coupon.type === 'FIXED_AMOUNT') {
        discount = coupon.value;
      }

      if (discount > 0) {
        totalDiscount += discount;
        appliedCoupons.push({
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          type: coupon.type,
          discount,
        });
      }
    }

    // 确保折扣不超过订单金额
    if (totalDiscount > subtotal) {
      totalDiscount = subtotal;
    }

    const finalAmount = subtotal - totalDiscount;

    const response: ApiResponse = {
      success: true,
      data: {
        originalAmount: subtotal,
        totalDiscount,
        finalAmount,
        appliedCoupons,
      },
      message: '应用优惠券成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * PUT /api/coupons/:id
 * 更新优惠券信息
 * 需要管理员权限
 */
router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validate(z.object({ id: z.string().min(1, '优惠券ID不能为空') }), 'params'),
  validate(couponSchemas.create),
  asyncHandler(async (req, res) => {
    const data: CreateCouponRequest = req.body;

    // 检查优惠券是否存在
    const existingCoupon = await db.prisma.coupon.findUnique({
      where: { id: req.params.id },
    });

    if (!existingCoupon) {
      throw new NotFoundError('优惠券');
    }

    // 如果更新代码，检查是否与其他优惠券冲突
    if (data.code !== existingCoupon.code) {
      const conflictCoupon = await db.prisma.coupon.findUnique({
        where: { code: data.code },
      });

      if (conflictCoupon) {
        throw new ValidationError('优惠券代码已存在');
      }
    }

    const coupon = await db.prisma.coupon.update({
      where: { id: req.params.id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        type: data.type,
        value: data.value,
        minAmount: data.minAmount,
        maxDiscount: data.maxDiscount,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        usageLimit: data.usageLimit,
        isActive: data.isActive,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: coupon,
      message: '更新优惠券成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * DELETE /api/coupons/:id
 * 删除优惠券（软删除，设置为不可用）
 * 需要管理员权限
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validate(z.object({ id: z.string().min(1, '优惠券ID不能为空') }), 'params'),
  asyncHandler(async (req, res) => {
    const coupon = await db.prisma.coupon.findUnique({
      where: { id: req.params.id },
    });

    if (!coupon) {
      throw new NotFoundError('优惠券');
    }

    // 软删除：设置为不可用
    await db.prisma.coupon.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    const response: ApiResponse = {
      success: true,
      message: '删除优惠券成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

export default router;
