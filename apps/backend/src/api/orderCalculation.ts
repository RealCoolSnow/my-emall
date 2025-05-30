/**
 * 订单计算 API 路由
 * 提供订单价格计算和优惠券推荐接口
 */

import express from 'express';
import { z } from 'zod';
import { OrderCalculationService } from '../services/orderCalculationService';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

const router = express.Router();
const orderCalculationService = new OrderCalculationService();

// 订单项验证模式
const orderItemSchema = z.object({
  productId: z.string().min(1, '商品ID不能为空'),
  quantity: z.number().int().min(1, '数量必须大于0'),
  price: z.number().min(0, '价格不能为负数'),
});

// 订单计算请求验证模式
const orderCalculationSchema = z.object({
  orderItems: z.array(orderItemSchema).min(1, '订单项不能为空'),
  subtotal: z.number().min(0, '小计不能为负数'),
  shippingCost: z.number().min(0, '运费不能为负数').optional(),
  couponIds: z.array(z.string()).optional(),
});

// 优惠券推荐请求验证模式
const couponRecommendationSchema = z.object({
  orderItems: z.array(orderItemSchema).min(1, '订单项不能为空'),
  subtotal: z.number().min(0, '小计不能为负数'),
});

/**
 * POST /api/order-calculation/calculate
 * 计算订单总价
 * 需要用户认证
 */
router.post(
  '/calculate',
  authenticate,
  validate(orderCalculationSchema),
  asyncHandler(async (req, res) => {
    const { orderItems, subtotal, shippingCost, couponIds } = req.body;
    
    const result = await orderCalculationService.calculateOrder({
      orderItems,
      subtotal,
      shippingCost,
      couponIds,
      userId: req.user!.userId,
    });

    const response: ApiResponse = {
      success: true,
      data: result,
      message: '订单计算成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/order-calculation/recommend-coupons
 * 获取优惠券推荐
 * 需要用户认证
 */
router.post(
  '/recommend-coupons',
  authenticate,
  validate(couponRecommendationSchema),
  asyncHandler(async (req, res) => {
    const { orderItems, subtotal } = req.body;
    
    const recommendedCouponIds = await orderCalculationService.getRecommendedCoupons(
      req.user!.userId,
      orderItems,
      subtotal
    );

    const response: ApiResponse = {
      success: true,
      data: { recommendedCouponIds },
      message: '获取优惠券推荐成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

export default router;
