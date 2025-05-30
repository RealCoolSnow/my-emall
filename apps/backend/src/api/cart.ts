/**
 * 购物车 API 路由
 * 提供购物车的增删改查操作接口
 */

import express from 'express';
import { CartService } from '../services/cartService';
import { authenticate } from '../middleware/auth';
import { validate, cartSchemas, commonSchemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse, AddToCartRequest, UpdateCartItemRequest } from '../types';

const router = express.Router();
const cartService = new CartService();

/**
 * GET /api/cart
 * 获取用户购物车列表
 * 需要用户认证
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const cartItems = await cartService.getCartItems(req.user!.userId);

    const response: ApiResponse = {
      success: true,
      data: cartItems,
      message: '获取购物车成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/cart
 * 添加商品到购物车
 * 需要用户认证
 */
router.post(
  '/',
  authenticate,
  validate(cartSchemas.addItem),
  asyncHandler(async (req, res) => {
    const data: AddToCartRequest = req.body;
    const cartItem = await cartService.addToCart(req.user!.userId, data);

    const response: ApiResponse = {
      success: true,
      data: cartItem,
      message: '添加到购物车成功',
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  })
);

/**
 * PUT /api/cart/:productId
 * 更新购物车商品数量
 * 需要用户认证
 */
router.put(
  '/:productId',
  authenticate,
  validate(commonSchemas.id, 'params'),
  validate(cartSchemas.updateItem),
  asyncHandler(async (req, res) => {
    const data: UpdateCartItemRequest = req.body;
    const cartItem = await cartService.updateCartItem(
      req.user!.userId,
      req.params.productId,
      data
    );

    const response: ApiResponse = {
      success: true,
      data: cartItem,
      message: '更新购物车成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * DELETE /api/cart/:productId
 * 从购物车移除商品
 * 需要用户认证
 */
router.delete(
  '/:productId',
  authenticate,
  validate(commonSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    await cartService.removeFromCart(req.user!.userId, req.params.productId);

    const response: ApiResponse = {
      success: true,
      message: '从购物车移除成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * DELETE /api/cart
 * 清空购物车
 * 需要用户认证
 */
router.delete(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    await cartService.clearCart(req.user!.userId);

    const response: ApiResponse = {
      success: true,
      message: '清空购物车成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/cart/summary
 * 获取购物车统计信息
 * 需要用户认证
 */
router.get(
  '/summary',
  authenticate,
  asyncHandler(async (req, res) => {
    const summary = await cartService.getCartSummary(req.user!.userId);

    const response: ApiResponse = {
      success: true,
      data: summary,
      message: '获取购物车统计成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

export default router;
