/**
 * 分类 API 路由
 * 提供分类的 CRUD 操作接口
 */

import express from 'express';
import { db } from '../models/database';
import {
  authenticate,
  authorize,
  optionalAuthenticate,
} from '../middleware/auth';
import {
  validate,
  categorySchemas,
  commonSchemas,
} from '../middleware/validation';
import {
  asyncHandler,
  NotFoundError,
  ValidationError,
} from '../middleware/errorHandler';
import { ApiResponse } from '../types';

const router = express.Router();

/**
 * GET /api/categories
 * 获取分类列表
 */
router.get(
  '/',
  optionalAuthenticate,
  asyncHandler(async (req, res) => {
    const categories = await db.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: categories,
      message: '获取分类列表成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/categories/:id
 * 根据 ID 获取分类详情
 */
router.get(
  '/:id',
  validate(commonSchemas.id, 'params'),
  optionalAuthenticate,
  asyncHandler(async (req, res) => {
    const category = await db.prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        parent: true,
        children: true,
        products: {
          where: { status: 'ACTIVE' },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundError('分类');
    }

    const response: ApiResponse = {
      success: true,
      data: category,
      message: '获取分类详情成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/categories
 * 创建新分类
 * 需要管理员权限
 */
router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  validate(categorySchemas.create),
  asyncHandler(async (req, res) => {
    // 检查分类名称是否已存在
    const existingCategory = await db.prisma.category.findUnique({
      where: { name: req.body.name },
    });

    if (existingCategory) {
      throw new ValidationError('分类名称已存在');
    }

    // 如果指定了父分类，验证父分类是否存在
    if (req.body.parentId) {
      const parentCategory = await db.prisma.category.findUnique({
        where: { id: req.body.parentId },
      });

      if (!parentCategory) {
        throw new ValidationError('指定的父分类不存在');
      }
    }

    const category = await db.prisma.category.create({
      data: req.body,
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: category,
      message: '创建分类成功',
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  })
);

/**
 * PUT /api/categories/:id
 * 更新分类信息
 * 需要管理员权限
 */
router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validate(commonSchemas.id, 'params'),
  validate(categorySchemas.update),
  asyncHandler(async (req, res) => {
    // 检查分类是否存在
    const existingCategory = await db.prisma.category.findUnique({
      where: { id: req.params.id },
    });

    if (!existingCategory) {
      throw new NotFoundError('分类');
    }

    // 如果更新名称，检查是否与其他分类重复
    if (req.body.name && req.body.name !== existingCategory.name) {
      const duplicateCategory = await db.prisma.category.findUnique({
        where: { name: req.body.name },
      });

      if (duplicateCategory) {
        throw new ValidationError('分类名称已存在');
      }
    }

    // 如果指定了父分类，验证父分类是否存在且不是自己
    if (req.body.parentId) {
      if (req.body.parentId === req.params.id) {
        throw new ValidationError('分类不能设置自己为父分类');
      }

      const parentCategory = await db.prisma.category.findUnique({
        where: { id: req.body.parentId },
      });

      if (!parentCategory) {
        throw new ValidationError('指定的父分类不存在');
      }
    }

    const category = await db.prisma.category.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: category,
      message: '更新分类成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * DELETE /api/categories/:id
 * 删除分类
 * 需要管理员权限
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validate(commonSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    // 检查分类是否存在
    const category = await db.prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        children: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundError('分类');
    }

    // 检查是否有子分类
    if (category.children.length > 0) {
      throw new ValidationError(
        '无法删除包含子分类的分类，请先删除或移动子分类'
      );
    }

    // 检查是否有关联的产品
    if (category._count.products > 0) {
      throw new ValidationError(
        '无法删除包含产品的分类，请先移动或删除相关产品'
      );
    }

    // 删除分类
    await db.prisma.category.delete({
      where: { id: req.params.id },
    });

    const response: ApiResponse = {
      success: true,
      message: '删除分类成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

export default router;
