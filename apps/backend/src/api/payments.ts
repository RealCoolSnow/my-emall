/**
 * 支付 API 路由
 * 提供模拟支付功能
 */

import express from 'express';
import { db } from '../models/database';
import { authenticate } from '../middleware/auth';
import { validate, commonSchemas } from '../middleware/validation';
import { asyncHandler, NotFoundError, ValidationError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';
import { z } from 'zod';

const router = express.Router();

// 支付请求验证模式
const paymentSchemas = {
  processPayment: z.object({
    orderId: z.string().min(1, '订单ID不能为空'),
    paymentMethod: z.enum(['alipay', 'wechat', 'credit_card', 'bank_card'], {
      errorMap: () => ({ message: '无效的支付方式' }),
    }),
    amount: z.number().positive('支付金额必须大于0'),
    // 模拟支付的额外参数
    mockResult: z.enum(['success', 'failed']).optional(),
  }),
};

/**
 * POST /api/payments/process
 * 处理支付请求（模拟）
 */
router.post(
  '/process',
  authenticate,
  validate(paymentSchemas.processPayment),
  asyncHandler(async (req, res) => {
    const { orderId, paymentMethod, amount, mockResult } = req.body;
    const userId = req.user!.userId;

    // 验证订单存在且属于当前用户
    const order = await db.prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId,
      },
    });

    if (!order) {
      throw new NotFoundError('订单');
    }

    // 检查订单状态
    if (order.paymentStatus === 'PAID') {
      const response: ApiResponse = {
        success: false,
        error: 'ORDER_ALREADY_PAID',
        message: '订单已支付',
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    if (order.status === 'CANCELLED') {
      const response: ApiResponse = {
        success: false,
        error: 'ORDER_CANCELLED',
        message: '订单已取消，无法支付',
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    // 验证支付金额
    if (Math.abs(amount - order.totalAmount) > 0.01) {
      throw new ValidationError('支付金额与订单金额不符');
    }

    // 模拟支付处理
    const paymentSuccess = mockResult === 'success' ||
                          (mockResult !== 'failed' && Math.random() > 0.1); // 90%成功率

    // 模拟支付延迟
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (paymentSuccess) {
      // 支付成功，更新订单状态
      const updatedOrder = await db.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          paymentMethod: paymentMethod,
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      // 创建支付记录
      const payment = await db.prisma.payment.create({
        data: {
          orderId: orderId,
          amount: amount,
          method: paymentMethod,
          status: 'SUCCESS',
          transactionId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          processedAt: new Date(),
        },
      });

      const response: ApiResponse = {
        success: true,
        data: {
          order: updatedOrder,
          payment: payment,
          message: '支付成功',
        },
        message: '支付处理成功',
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } else {
      // 支付失败
      const payment = await db.prisma.payment.create({
        data: {
          orderId: orderId,
          amount: amount,
          method: paymentMethod,
          status: 'FAILED',
          transactionId: `mock_failed_${Date.now()}`,
          processedAt: new Date(),
          failureReason: '模拟支付失败',
        },
      });

      const response: ApiResponse = {
        success: false,
        error: 'PAYMENT_FAILED',
        message: '支付失败，请重试',
        data: {
          payment: payment,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(400).json(response);
    }
  })
);

/**
 * GET /api/payments/order/:orderId
 * 获取订单的支付记录
 */
router.get(
  '/order/:orderId',
  authenticate,
  validate(commonSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user!.userId;

    // 验证订单存在且属于当前用户（或管理员）
    const order = await db.prisma.order.findFirst({
      where: {
        id: orderId,
        ...(req.user!.role === 'CUSTOMER' ? { userId: userId } : {}),
      },
    });

    if (!order) {
      throw new NotFoundError('订单');
    }

    // 获取支付记录
    const payments = await db.prisma.payment.findMany({
      where: { orderId: orderId },
      orderBy: { createdAt: 'desc' },
    });

    const response: ApiResponse = {
      success: true,
      data: payments,
      message: '获取支付记录成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/payments/refund
 * 处理退款请求（模拟）
 */
router.post(
  '/refund',
  authenticate,
  validate(z.object({
    orderId: z.string().min(1, '订单ID不能为空'),
    amount: z.number().positive('退款金额必须大于0'),
    reason: z.string().optional(),
  })),
  asyncHandler(async (req, res) => {
    const { orderId, amount, reason } = req.body;
    const userId = req.user!.userId;

    // 验证订单存在且属于当前用户
    const order = await db.prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId,
        paymentStatus: 'PAID',
      },
    });

    if (!order) {
      throw new NotFoundError('已支付的订单');
    }

    // 检查退款金额
    if (amount > order.totalAmount) {
      throw new ValidationError('退款金额不能超过订单金额');
    }

    // 模拟退款处理
    const refundSuccess = Math.random() > 0.05; // 95%成功率

    if (refundSuccess) {
      // 更新订单状态
      await db.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'REFUNDED',
          status: 'CANCELLED',
        },
      });

      // 创建退款记录
      const refund = await db.prisma.payment.create({
        data: {
          orderId: orderId,
          amount: -amount, // 负数表示退款
          method: 'refund',
          status: 'SUCCESS',
          transactionId: `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          processedAt: new Date(),
          failureReason: reason,
        },
      });

      const response: ApiResponse = {
        success: true,
        data: refund,
        message: '退款处理成功',
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        error: 'REFUND_FAILED',
        message: '退款处理失败，请联系客服',
        timestamp: new Date().toISOString(),
      };

      res.status(400).json(response);
    }
  })
);

export default router;
