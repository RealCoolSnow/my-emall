/**
 * 管理后台 API 路由
 * 提供管理员专用的统计数据和管理功能
 */

import express from 'express';
import { db } from '../models/database';
import { authenticate, authorize } from '../middleware/auth';
import { validate, commonSchemas } from '../middleware/validation';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';
import { z } from 'zod';

const router = express.Router();

/**
 * GET /api/admin/stats
 * 获取管理后台统计数据
 */
router.get(
  '/stats',
  authenticate,
  authorize(['ADMIN', 'SUPER_ADMIN']),
  asyncHandler(async (req, res) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // 并行查询所有统计数据
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalCoupons,
      todayOrders,
      activeUsers,
      lowStockProducts,
      expiredCoupons,
      totalRevenue,
      todayRevenue,
    ] = await Promise.all([
      // 总用户数
      db.prisma.user.count(),

      // 总产品数
      db.prisma.product.count(),

      // 总订单数
      db.prisma.order.count(),

      // 总优惠券数
      db.prisma.coupon.count(),

      // 今日订单数
      db.prisma.order.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      // 活跃用户数（最近30天有订单的用户）
      db.prisma.user.count({
        where: {
          orders: {
            some: {
              createdAt: {
                gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      }),

      // 低库存产品数（库存小于10）
      db.prisma.product.count({
        where: {
          stock: {
            lt: 10,
          },
        },
      }),

      // 已过期但仍激活的优惠券数
      db.prisma.coupon.count({
        where: {
          endDate: {
            lt: now,
          },
          isActive: true,
        },
      }),

      // 总收入
      db.prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          paymentStatus: 'PAID',
        },
      }),

      // 今日收入
      db.prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          paymentStatus: 'PAID',
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
    ]);

    const stats = {
      totalUsers,
      totalProducts,
      totalOrders,
      totalCoupons,
      todayOrders,
      activeUsers,
      lowStockProducts,
      expiredCoupons,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      todayRevenue: todayRevenue._sum.totalAmount || 0,
    };

    const response: ApiResponse = {
      success: true,
      data: stats,
      message: '获取管理后台统计数据成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/admin/order-trends
 * 获取订单趋势数据
 */
router.get(
  '/order-trends',
  authenticate,
  authorize(['ADMIN', 'SUPER_ADMIN']),
  validate(z.object({
    days: z.string().optional().transform(val => parseInt(val || '30')),
  }), 'query'),
  asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days as string) || 30;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // 按日期分组查询订单数据
    const orderTrends = await db.prisma.$queryRaw`
      SELECT
        DATE(createdAt) as date,
        COUNT(*) as orders,
        COALESCE(SUM(CASE WHEN paymentStatus = 'PAID' THEN totalAmount ELSE 0 END), 0) as revenue
      FROM orders
      WHERE createdAt >= ${startDate} AND createdAt <= ${endDate}
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `;

    const response: ApiResponse = {
      success: true,
      data: orderTrends,
      message: '获取订单趋势数据成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/admin/popular-products
 * 获取热门产品数据
 */
router.get(
  '/popular-products',
  authenticate,
  authorize(['ADMIN', 'SUPER_ADMIN']),
  validate(z.object({
    limit: z.string().optional().transform(val => parseInt(val || '10')),
  }), 'query'),
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;

    // 查询热门产品（按销量排序）
    const popularProducts = await db.prisma.$queryRaw`
      SELECT
        p.id,
        p.name,
        COALESCE(SUM(oi.quantity), 0) as sales,
        COALESCE(SUM(oi.quantity * oi.price), 0) as revenue
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.productId
      LEFT JOIN orders o ON oi.orderId = o.id AND o.paymentStatus = 'PAID'
      GROUP BY p.id, p.name
      ORDER BY sales DESC
      LIMIT ${limit}
    `;

    const response: ApiResponse = {
      success: true,
      data: popularProducts,
      message: '获取热门产品数据成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/admin/user-growth
 * 获取用户增长数据
 */
router.get(
  '/user-growth',
  authenticate,
  authorize(['ADMIN', 'SUPER_ADMIN']),
  validate(z.object({
    days: z.string().optional().transform(val => parseInt(val || '30')),
  }), 'query'),
  asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days as string) || 30;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // 按日期分组查询用户增长数据
    const userGrowth = await db.prisma.$queryRaw`
      SELECT
        DATE(createdAt) as date,
        COUNT(*) as newUsers,
        (SELECT COUNT(*) FROM users WHERE createdAt <= DATE(u.createdAt)) as totalUsers
      FROM users u
      WHERE createdAt >= ${startDate} AND createdAt <= ${endDate}
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `;

    const response: ApiResponse = {
      success: true,
      data: userGrowth,
      message: '获取用户增长数据成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/admin/users
 * 获取所有用户列表（管理员专用）
 */
router.get(
  '/users',
  authenticate,
  authorize(['ADMIN', 'SUPER_ADMIN']),
  validate(commonSchemas.pagination, 'query'),
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      db.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          profile: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      db.prisma.user.count(),
    ]);

    // 解析 profile JSON
    const formattedUsers = users.map(user => ({
      ...user,
      profile: user.profile ? JSON.parse(user.profile) : null,
    }));

    const response: ApiResponse = {
      success: true,
      data: {
        data: formattedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
      message: '获取用户列表成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * PUT /api/admin/users/:id
 * 更新用户信息（管理员专用）
 */
router.put(
  '/users/:id',
  authenticate,
  authorize(['ADMIN', 'SUPER_ADMIN']),
  validate(commonSchemas.id, 'params'),
  validate(z.object({
    username: z.string().min(1).optional(),
    email: z.string().email().optional(),
    role: z.enum(['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']).optional(),
    isActive: z.boolean().optional(),
    profile: z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    }).optional(),
  })),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { username, email, role, isActive, profile } = req.body;

    // 检查用户是否存在
    const existingUser = await db.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError('用户');
    }

    // 检查用户名和邮箱唯一性
    if (username && username !== existingUser.username) {
      const usernameExists = await db.prisma.user.findFirst({
        where: { username, id: { not: id } },
      });
      if (usernameExists) {
        const response: ApiResponse = {
          success: false,
          error: 'CONFLICT',
          message: '用户名已存在',
          timestamp: new Date().toISOString(),
        };
        res.status(409).json(response);
        return;
      }
    }

    if (email && email !== existingUser.email) {
      const emailExists = await db.prisma.user.findFirst({
        where: { email, id: { not: id } },
      });
      if (emailExists) {
        const response: ApiResponse = {
          success: false,
          error: 'CONFLICT',
          message: '邮箱已存在',
          timestamp: new Date().toISOString(),
        };
        res.status(409).json(response);
        return;
      }
    }

    // 更新用户
    const updatedUser = await db.prisma.user.update({
      where: { id },
      data: {
        username,
        email,
        role,
        isActive,
        profile: profile ? JSON.stringify(profile) : undefined,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        profile: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 解析 profile JSON
    const formattedUser = {
      ...updatedUser,
      profile: updatedUser.profile ? JSON.parse(updatedUser.profile) : null,
    };

    const response: ApiResponse = {
      success: true,
      data: formattedUser,
      message: '更新用户信息成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * DELETE /api/admin/users/:id
 * 删除用户（管理员专用）
 */
router.delete(
  '/users/:id',
  authenticate,
  authorize(['SUPER_ADMIN']), // 只有超级管理员可以删除用户
  validate(commonSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 检查用户是否存在
    const existingUser = await db.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError('用户');
    }

    // 不能删除自己
    if (id === req.user!.userId) {
      const response: ApiResponse = {
        success: false,
        error: 'FORBIDDEN',
        message: '不能删除自己的账户',
        timestamp: new Date().toISOString(),
      };
      res.status(403).json(response);
      return;
    }

    // 软删除：设置为不活跃状态
    await db.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    const response: ApiResponse = {
      success: true,
      message: '删除用户成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/admin/users/:id
 * 获取用户详情（管理员专用）
 */
router.get(
  '/users/:id',
  authenticate,
  authorize(['ADMIN', 'SUPER_ADMIN']),
  validate(commonSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await db.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        profile: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // 最近10个订单
        },
      },
    });

    if (!user) {
      throw new NotFoundError('用户');
    }

    // 计算用户统计信息
    const totalSpent = await db.prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        userId: id,
        paymentStatus: 'PAID',
      },
    });

    // 解析 profile JSON
    const formattedUser = {
      ...user,
      profile: user.profile ? JSON.parse(user.profile) : null,
      totalSpent: totalSpent._sum.totalAmount || 0,
    };

    const response: ApiResponse = {
      success: true,
      data: formattedUser,
      message: '获取用户详情成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

export default router;
