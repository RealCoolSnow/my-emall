/**
 * 订单 API 路由
 * 提供订单的创建、查询、更新等操作接口
 */

import express from 'express';
import { z } from 'zod';
import { OrderService } from '../services/orderService';
import {
  authenticate,
  authorize,
  checkResourceOwnership,
} from '../middleware/auth';
import {
  validate,
  orderSchemas,
  commonSchemas,
} from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

const router = express.Router();
const orderService = new OrderService();

/**
 * GET /api/orders
 * 获取订单列表
 * 普通用户只能查看自己的订单，管理员可以查看所有订单
 */
router.get(
  '/',
  authenticate,
  validate(orderSchemas.query, 'query'),
  asyncHandler(async (req, res) => {
    // 如果不是管理员，只能查看自己的订单
    if (!req.user || !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      req.query.userId = req.user!.userId;
    }

    const result = await orderService.getOrders(req.query);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: '获取订单列表成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/orders/user
 * 获取当前用户的订单列表
 * 需要用户认证
 */
router.get(
  '/user',
  authenticate,
  validate(orderSchemas.query, 'query'),
  asyncHandler(async (req, res) => {
    const query = { ...req.query, userId: req.user!.userId };
    const result = await orderService.getOrders(query);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: '获取用户订单列表成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/orders/user/:userId
 * 获取指定用户的订单列表
 * 需要管理员权限或用户本人
 */
router.get(
  '/user/:userId',
  authenticate,
  validate(commonSchemas.userId, 'params'),
  checkResourceOwnership((req) => req.params.userId),
  validate(orderSchemas.query, 'query'),
  asyncHandler(async (req, res) => {
    const query = { ...req.query, userId: req.params.userId };
    const result = await orderService.getOrders(query);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: '获取用户订单列表成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/orders/stats/summary
 * 获取订单统计信息
 * 需要管理员权限
 */
router.get(
  '/stats/summary',
  authenticate,
  authorize(['ADMIN']),
  asyncHandler(async (req, res) => {
    // 这里可以添加订单统计逻辑
    // 例如：总订单数、今日订单数、总销售额等

    const response: ApiResponse = {
      success: true,
      data: {
        message: '订单统计功能待实现',
      },
      message: '获取订单统计成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/orders/:id
 * 根据 ID 获取订单详情
 * 用户只能查看自己的订单，管理员可以查看所有订单
 */
router.get(
  '/:id',
  authenticate,
  validate(commonSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const order = await orderService.getOrderById(req.params.id);

    // 检查权限：用户只能查看自己的订单
    if (
      req.user &&
      !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role) &&
      order.userId !== req.user.userId
    ) {
      const response: ApiResponse = {
        success: false,
        error: 'ACCESS_DENIED',
        message: '无权访问此订单',
        timestamp: new Date().toISOString(),
      };
      res.status(403).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: order,
      message: '获取订单详情成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/orders
 * 创建新订单
 * 需要用户认证
 */
router.post(
  '/',
  authenticate,
  validate(orderSchemas.create),
  asyncHandler(async (req, res) => {
    console.log('创建订单请求 - 用户ID:', req.user!.userId);
    console.log('创建订单请求 - 订单数据:', req.body);

    const order = await orderService.createOrder(req.user!.userId, req.body);

    console.log('订单创建成功 - 订单ID:', order.id);

    const response: ApiResponse = {
      success: true,
      data: order,
      message: '创建订单成功',
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  })
);

/**
 * PUT /api/orders/:id
 * 更新订单信息
 * 用户可以更新自己的订单，管理员可以更新任何订单
 */
router.put(
  '/:id',
  authenticate,
  validate(commonSchemas.id, 'params'),
  validate(orderSchemas.update),
  asyncHandler(async (req, res) => {
    // 先获取订单信息以检查权限
    const existingOrder = await orderService.getOrderById(req.params.id);

    // 检查权限：用户只能更新自己的订单
    if (
      req.user &&
      !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role) &&
      existingOrder.userId !== req.user.userId
    ) {
      const response: ApiResponse = {
        success: false,
        error: 'ACCESS_DENIED',
        message: '无权修改此订单',
        timestamp: new Date().toISOString(),
      };
      res.status(403).json(response);
      return;
    }

    const order = await orderService.updateOrder(req.params.id, req.body);

    const response: ApiResponse = {
      success: true,
      data: order,
      message: '更新订单成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/orders/:id/cancel
 * 取消订单
 * 用户可以取消自己的订单，管理员可以取消任何订单
 */
router.post(
  '/:id/cancel',
  authenticate,
  validate(commonSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    // 如果不是管理员，只能取消自己的订单
    const userId = ['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)
      ? undefined
      : req.user!.userId;

    const order = await orderService.cancelOrder(req.params.id, userId);

    const response: ApiResponse = {
      success: true,
      data: order,
      message: '取消订单成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * DELETE /api/orders/:id
 * 删除订单
 * 用户可以删除自己的订单（仅限未支付），管理员可以删除任何订单
 */
router.delete(
  '/:id',
  authenticate,
  validate(commonSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    // 先获取订单信息以检查权限和状态
    const existingOrder = await orderService.getOrderById(req.params.id);

    // 检查权限：用户只能删除自己的订单
    if (
      req.user &&
      !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role) &&
      existingOrder.userId !== req.user.userId
    ) {
      const response: ApiResponse = {
        success: false,
        error: 'ACCESS_DENIED',
        message: '无权删除此订单',
        timestamp: new Date().toISOString(),
      };
      res.status(403).json(response);
      return;
    }

    // 检查订单状态：不允许删除已支付的订单
    if (existingOrder.paymentStatus === 'PAID') {
      const response: ApiResponse = {
        success: false,
        error: 'INVALID_OPERATION',
        message: '不能删除已支付的订单',
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    // 删除订单
    await orderService.deleteOrder(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: { id: req.params.id },
      message: '删除订单成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);



export default router;
