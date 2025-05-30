/**
 * 订单计算服务
 * 处理订单价格计算，包括优惠券折扣、运费等
 */

import { db } from '../models/database';
import { CouponService, Coupon, OrderContext } from 'coupons';
import { NotFoundError, ValidationError } from '../middleware/errorHandler';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface OrderCalculationRequest {
  orderItems: OrderItem[];
  subtotal: number;
  shippingCost?: number;
  couponIds?: string[];
  userId: string;
}

export interface OrderCalculationResult {
  subtotal: number;
  shippingCost: number;
  couponDiscount: number;
  finalAmount: number;
  appliedCoupons: Array<{
    id: string;
    code: string;
    name: string;
    type: string;
    discount: number;
  }>;
}

/**
 * 订单计算服务类
 */
export class OrderCalculationService {
  private couponService: CouponService;

  constructor() {
    this.couponService = new CouponService();
  }

  /**
   * 计算订单总价
   * @param request 订单计算请求
   * @returns Promise<OrderCalculationResult> 计算结果
   */
  async calculateOrder(request: OrderCalculationRequest): Promise<OrderCalculationResult> {
    const { orderItems, subtotal, shippingCost = 10, couponIds = [], userId } = request;

    // 验证订单项
    await this.validateOrderItems(orderItems);

    // 获取用户的优惠券
    const userCoupons = await this.getUserCoupons(userId, couponIds);

    // 计算优惠券折扣
    const couponResult = await this.calculateCouponDiscount(
      orderItems,
      subtotal,
      userCoupons
    );

    // 计算最终金额
    const finalAmount = Math.max(0, subtotal + shippingCost - couponResult.totalDiscount);

    return {
      subtotal,
      shippingCost,
      couponDiscount: couponResult.totalDiscount,
      finalAmount,
      appliedCoupons: couponResult.appliedCoupons,
    };
  }

  /**
   * 验证订单项
   * @param orderItems 订单项列表
   */
  private async validateOrderItems(orderItems: OrderItem[]) {
    if (!orderItems || orderItems.length === 0) {
      throw new ValidationError('订单项不能为空');
    }

    // 验证商品是否存在且可购买
    for (const item of orderItems) {
      const product = await db.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundError(`商品 ${item.productId}`);
      }

      if (product.status !== 'ACTIVE') {
        throw new ValidationError(`商品 ${product.name} 已下架`);
      }

      if (product.stock < item.quantity) {
        throw new ValidationError(`商品 ${product.name} 库存不足`);
      }

      // 验证价格是否正确
      if (Math.abs(product.price - item.price) > 0.01) {
        throw new ValidationError(`商品 ${product.name} 价格已变更，请刷新页面`);
      }
    }
  }

  /**
   * 获取用户优惠券
   * @param userId 用户ID
   * @param couponIds 优惠券ID列表
   * @returns Promise<UserCoupon[]> 用户优惠券列表
   */
  private async getUserCoupons(userId: string, couponIds: string[]) {
    if (couponIds.length === 0) {
      return [];
    }

    const userCoupons = await db.prisma.userCoupon.findMany({
      where: {
        userId,
        couponId: { in: couponIds },
        isUsed: false,
      },
      include: {
        coupon: true,
      },
    });

    // 验证优惠券是否可用
    const now = new Date();
    const validCoupons = userCoupons.filter((uc) => {
      const coupon = uc.coupon;
      return (
        coupon.isActive &&
        coupon.startDate <= now &&
        coupon.endDate >= now &&
        (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)
      );
    });

    return validCoupons;
  }

  /**
   * 计算优惠券折扣
   * @param orderItems 订单项
   * @param subtotal 小计
   * @param userCoupons 用户优惠券
   * @returns 优惠券计算结果
   */
  private async calculateCouponDiscount(
    orderItems: OrderItem[],
    subtotal: number,
    userCoupons: any[]
  ) {
    if (userCoupons.length === 0) {
      return {
        totalDiscount: 0,
        appliedCoupons: [],
      };
    }

    // 转换为优惠券引擎需要的格式
    const coupons: Coupon[] = userCoupons.map((uc) => ({
      id: uc.coupon.id,
      code: uc.coupon.code,
      name: uc.coupon.name,
      type: uc.coupon.type as any,
      value: uc.coupon.value,
      minAmount: uc.coupon.minAmount || undefined,
      maxDiscount: uc.coupon.maxDiscount || undefined,
      isActive: uc.coupon.isActive,
      startDate: uc.coupon.startDate,
      endDate: uc.coupon.endDate,
      usedCount: uc.coupon.usedCount,
      createdAt: uc.coupon.createdAt,
      updatedAt: uc.coupon.updatedAt,
    }));

    const orderContext: OrderContext = {
      subtotal,
      shippingCost: 10, // 默认运费
      userId: userCoupons[0]?.userId || '',
      items: orderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    // 使用优惠券服务计算折扣
    const result = this.couponService.applyCoupons(coupons, orderContext);

    // 计算每个优惠券的具体折扣金额
    const appliedCouponsWithDiscount = result.appliedCoupons.map((coupon: Coupon) => {
      const individualResult = this.couponService.calculateDiscount(coupon, orderContext);
      return {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        discount: individualResult?.discount || 0,
      };
    });

    return {
      totalDiscount: result.totalDiscount,
      appliedCoupons: appliedCouponsWithDiscount,
    };
  }

  /**
   * 获取用户的最佳优惠券推荐
   * @param userId 用户ID
   * @param orderItems 订单项
   * @param subtotal 小计
   * @returns Promise<string[]> 推荐的优惠券ID列表
   */
  async getRecommendedCoupons(
    userId: string,
    orderItems: OrderItem[],
    subtotal: number
  ): Promise<string[]> {
    // 获取用户所有可用优惠券
    const userCoupons = await db.prisma.userCoupon.findMany({
      where: {
        userId,
        isUsed: false,
      },
      include: {
        coupon: true,
      },
    });

    const now = new Date();
    const availableCoupons = userCoupons.filter((uc) => {
      const coupon = uc.coupon;
      return (
        coupon.isActive &&
        coupon.startDate <= now &&
        coupon.endDate >= now &&
        (!coupon.minAmount || subtotal >= coupon.minAmount) &&
        (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)
      );
    });

    if (availableCoupons.length === 0) {
      return [];
    }

    // 计算每个优惠券的折扣金额，选择折扣最大的
    const couponDiscounts = availableCoupons.map((uc) => {
      const coupon: Coupon = {
        id: uc.coupon.id,
        code: uc.coupon.code,
        name: uc.coupon.name,
        type: uc.coupon.type as any,
        value: uc.coupon.value,
        minAmount: uc.coupon.minAmount || undefined,
        maxDiscount: uc.coupon.maxDiscount || undefined,
        isActive: uc.coupon.isActive,
        startDate: uc.coupon.startDate,
        endDate: uc.coupon.endDate,
        usedCount: uc.coupon.usedCount,
        createdAt: uc.coupon.createdAt,
        updatedAt: uc.coupon.updatedAt,
      };

      const orderContext: OrderContext = {
        subtotal,
        shippingCost: 10,
        userId,
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const result = this.couponService.calculateDiscount(coupon, orderContext);
      return {
        couponId: uc.couponId,
        discount: result?.discount || 0,
      };
    });

    // 按折扣金额降序排序，返回最优的优惠券
    couponDiscounts.sort((a, b) => b.discount - a.discount);

    // 返回折扣最大的优惠券ID（通常只推荐一个）
    return couponDiscounts.length > 0 ? [couponDiscounts[0].couponId] : [];
  }
}
