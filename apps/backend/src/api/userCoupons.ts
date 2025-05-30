/**
 * 用户优惠券 API 路由
 * 提供用户优惠券的查询、领取、使用等操作接口
 */

import express from 'express';
import { z } from 'zod';
import { UserCouponService } from '../services/userCouponService';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

const router = express.Router();
const userCouponService = new UserCouponService();

/**
 * GET /api/user-coupons
 * 获取用户优惠券列表
 * 需要用户认证
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const includeUsed = req.query.includeUsed === 'true';
    const userCoupons = await userCouponService.getUserCoupons(
      req.user!.userId,
      includeUsed
    );

    const response: ApiResponse = {
      success: true,
      data: userCoupons,
      message: '获取用户优惠券成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/user-coupons/available
 * 获取用户可用的优惠券列表
 * 需要用户认证
 */
router.get(
  '/available',
  authenticate,
  asyncHandler(async (req, res) => {
    const userCoupons = await userCouponService.getAvailableUserCoupons(
      req.user!.userId
    );

    const response: ApiResponse = {
      success: true,
      data: userCoupons,
      message: '获取可用优惠券成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/user-coupons/stats
 * 获取用户优惠券统计信息
 * 需要用户认证
 */
router.get(
  '/stats',
  authenticate,
  asyncHandler(async (req, res) => {
    const stats = await userCouponService.getUserCouponStats(req.user!.userId);

    const response: ApiResponse = {
      success: true,
      data: stats,
      message: '获取优惠券统计成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/user-coupons/claim
 * 领取优惠券
 * 需要用户认证
 */
router.post(
  '/claim',
  authenticate,
  validate(
    z.object({
      couponCode: z.string().min(1, '优惠券代码不能为空'),
    })
  ),
  asyncHandler(async (req, res) => {
    const { couponCode } = req.body;
    const userCoupon = await userCouponService.claimCoupon(
      req.user!.userId,
      couponCode
    );

    const response: ApiResponse = {
      success: true,
      data: userCoupon,
      message: '领取优惠券成功',
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  })
);

/**
 * POST /api/user-coupons/:couponId/use
 * 使用优惠券
 * 需要用户认证
 */
router.post(
  '/:couponId/use',
  authenticate,
  validate(
    z.object({
      couponId: z.string().min(1, '优惠券ID不能为空'),
    }),
    'params'
  ),
  asyncHandler(async (req, res) => {
    const userCoupon = await userCouponService.useCoupon(
      req.user!.userId,
      req.params.couponId
    );

    const response: ApiResponse = {
      success: true,
      data: userCoupon,
      message: '使用优惠券成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

export default router;
