/**
 * 产品 API 路由
 * 提供产品的 CRUD 操作接口
 */

import express from 'express';
import { z } from 'zod';
import { ProductService } from '../services/productService';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';
import { validate, productSchemas, commonSchemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

const router = express.Router();
const productService = new ProductService();

/**
 * GET /api/products
 * 获取产品列表
 * 支持分页、搜索、筛选和排序
 */
router.get(
  '/',
  validate(productSchemas.query, 'query'),
  optionalAuthenticate,
  asyncHandler(async (req, res) => {
    const result = await productService.getProducts(req.query);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: '获取产品列表成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/products/popular
 * 获取热门产品列表
 */
router.get(
  '/popular',
  optionalAuthenticate,
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const products = await productService.getPopularProducts(limit);

    const response: ApiResponse = {
      success: true,
      data: products,
      message: '获取热门产品成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/products/:id
 * 根据 ID 获取产品详情
 */
router.get(
  '/:id',
  validate(commonSchemas.id, 'params'),
  optionalAuthenticate,
  asyncHandler(async (req, res) => {
    const product = await productService.getProductById(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: product,
      message: '获取产品详情成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/products
 * 创建新产品
 * 需要管理员权限
 */
router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  validate(productSchemas.create),
  asyncHandler(async (req, res) => {
    const product = await productService.createProduct(req.body);

    const response: ApiResponse = {
      success: true,
      data: product,
      message: '创建产品成功',
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  })
);

/**
 * PUT /api/products/:id
 * 更新产品信息
 * 需要管理员权限
 */
router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validate(commonSchemas.id, 'params'),
  validate(productSchemas.update),
  asyncHandler(async (req, res) => {
    const product = await productService.updateProduct(req.params.id, req.body);

    const response: ApiResponse = {
      success: true,
      data: product,
      message: '更新产品成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * PATCH /api/products/:id/stock
 * 更新产品库存
 * 需要管理员权限
 */
router.patch(
  '/:id/stock',
  authenticate,
  authorize(['ADMIN']),
  validate(commonSchemas.id, 'params'),
  validate(z.object({
    quantity: z.number().int('库存变化量必须为整数'),
  })),
  asyncHandler(async (req, res) => {
    const product = await productService.updateStock(req.params.id, req.body.quantity);

    const response: ApiResponse = {
      success: true,
      data: product,
      message: '更新库存成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * DELETE /api/products/:id
 * 删除产品
 * 需要超级管理员权限
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN']),
  validate(commonSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    await productService.deleteProduct(req.params.id);

    const response: ApiResponse = {
      success: true,
      message: '删除产品成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

export default router;
