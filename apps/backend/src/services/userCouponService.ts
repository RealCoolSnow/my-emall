/**
 * 用户优惠券服务层
 * 处理用户优惠券相关的业务逻辑，包括获取、使用、领取优惠券等
 */

import { db } from '../models/database';
import { NotFoundError, ValidationError } from '../middleware/errorHandler';

/**
 * 用户优惠券服务类
 */
export class UserCouponService {
  /**
   * 获取用户的优惠券列表
   * @param userId 用户ID
   * @param includeUsed 是否包含已使用的优惠券
   * @returns Promise<UserCoupon[]> 用户优惠券列表
   */
  async getUserCoupons(userId: string, includeUsed: boolean = false) {
    const userCoupons = await db.prisma.userCoupon.findMany({
      where: {
        userId,
        ...(includeUsed ? {} : { isUsed: false }),
      },
      include: {
        coupon: true,
      },
      orderBy: {
        obtainedAt: 'desc',
      },
    });

    return userCoupons.map(this.formatUserCoupon);
  }

  /**
   * 获取用户可用的优惠券（未使用且未过期）
   * @param userId 用户ID
   * @returns Promise<UserCoupon[]> 可用优惠券列表
   */
  async getAvailableUserCoupons(userId: string) {
    const now = new Date();
    const userCoupons = await db.prisma.userCoupon.findMany({
      where: {
        userId,
        isUsed: false,
        coupon: {
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      },
      include: {
        coupon: true,
      },
      orderBy: {
        obtainedAt: 'desc',
      },
    });

    return userCoupons.map(this.formatUserCoupon);
  }

  /**
   * 为用户领取优惠券
   * @param userId 用户ID
   * @param couponCode 优惠券代码
   * @returns Promise<UserCoupon> 领取的用户优惠券
   */
  async claimCoupon(userId: string, couponCode: string) {
    // 查找优惠券
    const coupon = await db.prisma.coupon.findUnique({
      where: { code: couponCode },
    });

    if (!coupon) {
      throw new NotFoundError('优惠券');
    }

    // 检查优惠券是否可用
    const now = new Date();
    if (!coupon.isActive) {
      throw new ValidationError('优惠券已停用');
    }

    if (coupon.startDate > now) {
      throw new ValidationError('优惠券尚未生效');
    }

    if (coupon.endDate < now) {
      throw new ValidationError('优惠券已过期');
    }

    // 检查使用限制
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new ValidationError('优惠券已达到使用上限');
    }

    // 检查用户是否已经领取过
    const existingUserCoupon = await db.prisma.userCoupon.findUnique({
      where: {
        userId_couponId: {
          userId,
          couponId: coupon.id,
        },
      },
    });

    if (existingUserCoupon) {
      throw new ValidationError('您已经领取过此优惠券');
    }

    // 创建用户优惠券
    const userCoupon = await db.prisma.userCoupon.create({
      data: {
        userId,
        couponId: coupon.id,
      },
      include: {
        coupon: true,
      },
    });

    return this.formatUserCoupon(userCoupon);
  }

  /**
   * 使用优惠券（标记为已使用）
   * @param userId 用户ID
   * @param couponId 优惠券ID
   * @returns Promise<UserCoupon> 使用后的用户优惠券
   */
  async useCoupon(userId: string, couponId: string) {
    const userCoupon = await db.prisma.userCoupon.findUnique({
      where: {
        userId_couponId: {
          userId,
          couponId,
        },
      },
      include: {
        coupon: true,
      },
    });

    if (!userCoupon) {
      throw new NotFoundError('用户优惠券');
    }

    if (userCoupon.isUsed) {
      throw new ValidationError('优惠券已使用');
    }

    // 检查优惠券是否过期
    const now = new Date();
    if (userCoupon.coupon.endDate < now) {
      throw new ValidationError('优惠券已过期');
    }

    // 标记为已使用
    const updatedUserCoupon = await db.prisma.userCoupon.update({
      where: { id: userCoupon.id },
      data: {
        isUsed: true,
        usedAt: now,
      },
      include: {
        coupon: true,
      },
    });

    return this.formatUserCoupon(updatedUserCoupon);
  }

  /**
   * 获取用户优惠券统计信息
   * @param userId 用户ID
   * @returns Promise<{total: number, available: number, used: number, expired: number}> 统计信息
   */
  async getUserCouponStats(userId: string) {
    const now = new Date();

    const [total, used, expired] = await Promise.all([
      // 总数
      db.prisma.userCoupon.count({
        where: { userId },
      }),
      // 已使用
      db.prisma.userCoupon.count({
        where: {
          userId,
          isUsed: true,
        },
      }),
      // 已过期（未使用但过期）
      db.prisma.userCoupon.count({
        where: {
          userId,
          isUsed: false,
          coupon: {
            endDate: { lt: now },
          },
        },
      }),
    ]);

    const available = total - used - expired;

    return {
      total,
      available,
      used,
      expired,
    };
  }

  /**
   * 格式化用户优惠券数据
   * @param userCoupon 原始用户优惠券数据
   * @returns 格式化后的用户优惠券
   */
  private formatUserCoupon(userCoupon: any) {
    return {
      id: userCoupon.id,
      userId: userCoupon.userId,
      couponId: userCoupon.couponId,
      isUsed: userCoupon.isUsed,
      usedAt: userCoupon.usedAt,
      obtainedAt: userCoupon.obtainedAt,
      createdAt: userCoupon.createdAt,
      updatedAt: userCoupon.updatedAt,
      coupon: {
        id: userCoupon.coupon.id,
        code: userCoupon.coupon.code,
        name: userCoupon.coupon.name,
        description: userCoupon.coupon.description,
        type: userCoupon.coupon.type,
        value: userCoupon.coupon.value,
        minAmount: userCoupon.coupon.minAmount,
        maxDiscount: userCoupon.coupon.maxDiscount,
        startDate: userCoupon.coupon.startDate,
        endDate: userCoupon.coupon.endDate,
        usageLimit: userCoupon.coupon.usageLimit,
        usedCount: userCoupon.coupon.usedCount,
        isActive: userCoupon.coupon.isActive,
        createdAt: userCoupon.coupon.createdAt,
        updatedAt: userCoupon.coupon.updatedAt,
      },
    };
  }
}
