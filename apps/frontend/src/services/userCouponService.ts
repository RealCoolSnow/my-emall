import api, { handleApiResponse } from '../lib/api';

export interface UserCoupon {
  id: string;
  userId: string;
  couponId: string;
  isUsed: boolean;
  usedAt: string | null;
  obtainedAt: string;
  createdAt: string;
  updatedAt: string;
  coupon: {
    id: string;
    code: string;
    name: string;
    description: string;
    type: 'FIXED_AMOUNT' | 'PERCENTAGE' | 'FREE_SHIPPING';
    value: number;
    minAmount: number | null;
    maxDiscount: number | null;
    startDate: string;
    endDate: string;
    usageLimit: number | null;
    usedCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface UserCouponStats {
  total: number;
  available: number;
  used: number;
  expired: number;
}

export interface ClaimCouponRequest {
  couponCode: string;
}

class UserCouponService {
  /**
   * 获取用户优惠券列表
   */
  async getUserCoupons(includeUsed: boolean = false): Promise<UserCoupon[]> {
    const response = await api.get('/user-coupons', {
      params: { includeUsed },
    });
    return handleApiResponse<UserCoupon[]>(response);
  }

  /**
   * 获取用户可用的优惠券列表
   */
  async getAvailableUserCoupons(): Promise<UserCoupon[]> {
    const response = await api.get('/user-coupons/available');
    return handleApiResponse<UserCoupon[]>(response);
  }

  /**
   * 获取用户优惠券统计信息
   */
  async getUserCouponStats(): Promise<UserCouponStats> {
    const response = await api.get('/user-coupons/stats');
    return handleApiResponse<UserCouponStats>(response);
  }

  /**
   * 领取优惠券
   */
  async claimCoupon(couponCode: string): Promise<UserCoupon> {
    const response = await api.post('/user-coupons/claim', { couponCode });
    return handleApiResponse<UserCoupon>(response);
  }

  /**
   * 使用优惠券
   */
  async useCoupon(couponId: string): Promise<UserCoupon> {
    const response = await api.post(`/user-coupons/${couponId}/use`);
    return handleApiResponse<UserCoupon>(response);
  }
}

export const userCouponService = new UserCouponService();
export default userCouponService;
