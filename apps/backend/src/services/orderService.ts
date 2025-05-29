/**
 * 订单服务层
 * 处理订单相关的业务逻辑，包括订单创建、更新、查询等
 */

import { db } from '../models/database';
import { CouponService } from 'coupons/services';
import {
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderQuery,
  PaginatedResponse,
} from '../types';
import { NotFoundError, ValidationError } from '../middleware/errorHandler';
import { ProductService } from './productService';

/**
 * 订单服务类
 */
export class OrderService {
  private couponService: CouponService;
  private productService: ProductService;

  constructor() {
    this.couponService = new CouponService();
    this.productService = new ProductService();
  }

  /**
   * 创建订单
   * @param userId 用户 ID
   * @param data 订单数据
   * @returns Promise<Order> 创建的订单
   */
  async createOrder(userId: string, data: CreateOrderRequest) {
    return await db.transaction(async (prisma) => {
      // 1. 验证用户是否存在
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundError('用户');
      }

      // 2. 验证产品并计算价格
      const orderItems = [];
      let subtotal = 0;

      for (const item of data.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundError(`产品 ${item.productId}`);
        }

        if (product.status !== 'ACTIVE') {
          throw new ValidationError(`产品 ${product.name} 当前不可购买`);
        }

        if (product.stock < item.quantity) {
          throw new ValidationError(
            `产品 ${product.name} 库存不足，当前库存：${product.stock}`
          );
        }

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
          product,
        });
      }

      // 3. 应用优惠券
      let totalDiscount = 0;
      const appliedCoupons = [];

      if (data.couponCodes && data.couponCodes.length > 0) {
        // 获取优惠券信息
        const coupons = await prisma.coupon.findMany({
          where: {
            code: { in: data.couponCodes },
            isActive: true,
          },
        });

        if (coupons.length !== data.couponCodes.length) {
          throw new ValidationError('部分优惠券无效或已失效');
        }

        // 应用优惠券
        const orderContext = {
          subtotal,
          shippingCost: 0, // 暂时设为 0，可以根据实际需求计算
          userId,
          items: orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        };

        // 转换Prisma Coupon对象为packages/coupons的Coupon类型
        const convertedCoupons = coupons.map((coupon) => ({
          ...coupon,
          description: coupon.description || undefined,
          minAmount: coupon.minAmount || undefined,
          maxDiscount: coupon.maxDiscount || undefined,
          usageLimit: coupon.usageLimit || undefined,
          type: coupon.type as any, // 临时类型断言，因为Prisma使用string而packages/coupons使用枚举
        }));

        const couponResult = this.couponService.applyCoupons(
          convertedCoupons,
          orderContext
        );
        totalDiscount = couponResult.totalDiscount;

        // 创建一个映射来存储每个优惠券的折扣金额
        const discountMap = new Map<string, number>();

        // 计算每个应用的优惠券的折扣
        for (const appliedCoupon of couponResult.appliedCoupons) {
          const discountResult = this.couponService.calculateDiscount(
            appliedCoupon,
            orderContext
          );
          if (discountResult) {
            discountMap.set(appliedCoupon.id, discountResult.discount);
          }
        }

        for (const coupon of coupons) {
          if (couponResult.appliedCoupons.some((ac) => ac.id === coupon.id)) {
            appliedCoupons.push({
              couponId: coupon.id,
              discount: discountMap.get(coupon.id) || 0,
            });
          }

          // 更新优惠券使用次数
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }

      // 4. 计算最终金额
      const totalAmount = Math.max(0, subtotal - totalDiscount);

      // 5. 创建订单
      const order = await prisma.order.create({
        data: {
          userId,
          totalAmount,
          shippingAddress: JSON.stringify(data.shippingAddress),
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          orderItems: {
            create: orderItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
          coupons: {
            create: appliedCoupons,
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          coupons: {
            include: {
              coupon: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      // 6. 更新产品库存
      for (const item of orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        // 如果库存为 0，更新状态
        const updatedProduct = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (updatedProduct && updatedProduct.stock === 0) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { status: 'OUT_OF_STOCK' },
          });
        }
      }

      return this.formatOrder(order);
    });
  }

  /**
   * 获取订单列表
   * @param query 查询参数
   * @returns Promise<PaginatedResponse> 分页订单列表
   */
  async getOrders(query: OrderQuery): Promise<PaginatedResponse> {
    const {
      page = 1,
      limit = 10,
      userId,
      status,
      paymentStatus,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // 构建查询条件
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // 计算偏移量
    const skip = (page - 1) * limit;

    // 执行查询
    const [orders, total] = await Promise.all([
      db.prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          coupons: {
            include: {
              coupon: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      db.prisma.order.count({ where }),
    ]);

    // 格式化订单数据
    const formattedOrders = orders.map((order) => this.formatOrder(order));

    return {
      data: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * 根据 ID 获取订单
   * @param id 订单 ID
   * @returns Promise<Order> 订单信息
   */
  async getOrderById(id: string) {
    const order = await db.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        coupons: {
          include: {
            coupon: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('订单');
    }

    return this.formatOrder(order);
  }

  /**
   * 更新订单状态
   * @param id 订单 ID
   * @param data 更新数据
   * @returns Promise<Order> 更新后的订单
   */
  async updateOrder(id: string, data: UpdateOrderRequest) {
    // 检查订单是否存在
    const existingOrder = await db.prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      throw new NotFoundError('订单');
    }

    // 验证状态转换是否合法
    if (data.status) {
      this.validateStatusTransition(existingOrder.status, data.status);
    }

    // 更新订单
    const order = await db.prisma.order.update({
      where: { id },
      data,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        coupons: {
          include: {
            coupon: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return this.formatOrder(order);
  }

  /**
   * 取消订单
   * @param id 订单 ID
   * @param userId 用户 ID（用于权限检查）
   * @returns Promise<Order> 取消后的订单
   */
  async cancelOrder(id: string, userId?: string) {
    return await db.transaction(async (prisma) => {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          orderItems: true,
          coupons: {
            include: {
              coupon: true,
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundError('订单');
      }

      // 检查权限（如果提供了 userId）
      if (userId && order.userId !== userId) {
        throw new ValidationError('无权取消此订单');
      }

      // 检查订单状态是否可以取消
      if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
        throw new ValidationError('当前订单状态不允许取消');
      }

      // 恢复产品库存
      for (const item of order.orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            status: 'ACTIVE', // 恢复为可用状态
          },
        });
      }

      // 恢复优惠券使用次数
      for (const orderCoupon of order.coupons) {
        await prisma.coupon.update({
          where: { id: orderCoupon.couponId },
          data: { usedCount: { decrement: 1 } },
        });
      }

      // 更新订单状态
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          coupons: {
            include: {
              coupon: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      return this.formatOrder(updatedOrder);
    });
  }

  /**
   * 验证订单状态转换是否合法
   * @param currentStatus 当前状态
   * @param newStatus 新状态
   */
  private validateStatusTransition(
    currentStatus: string,
    newStatus: string
  ): void {
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: ['REFUNDED'],
      CANCELLED: [],
      REFUNDED: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new ValidationError(
        `无法从状态 ${currentStatus} 转换到 ${newStatus}`
      );
    }
  }

  /**
   * 格式化订单数据
   * @param order 原始订单数据
   * @returns 格式化后的订单数据
   */
  private formatOrder(order: any) {
    return {
      ...order,
      shippingAddress: order.shippingAddress
        ? JSON.parse(order.shippingAddress)
        : null,
      totalDiscount:
        order.coupons?.reduce((sum: number, oc: any) => sum + oc.discount, 0) ||
        0,
    };
  }
}
