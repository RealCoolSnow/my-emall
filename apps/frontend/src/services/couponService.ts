import api, { handleApiResponse } from '../lib/api';
import { Coupon } from 'coupons/types';

export interface ApplyCouponRequest {
  orderItems: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shippingCost: number;
  couponCodes: string[];
  userId: string;
}

export interface CouponDiscountResult {
  discount: number;
  finalAmount: number;
  appliedCoupons: Coupon[];
}

class CouponService {
  /**
   * 获取可用优惠券列表
   */
  async getAvailableCoupons(): Promise<Coupon[]> {
    const response = await api.get('/coupons');
    return handleApiResponse<Coupon[]>(response);
  }

  /**
   * 根据ID获取优惠券详情
   */
  async getCoupon(id: string): Promise<Coupon> {
    const response = await api.get(`/coupons/${id}`);
    return handleApiResponse<Coupon>(response);
  }

  /**
   * 根据代码获取优惠券
   */
  async getCouponByCode(code: string): Promise<Coupon> {
    const response = await api.get(`/coupons/code/${code}`);
    return handleApiResponse<Coupon>(response);
  }

  /**
   * 应用优惠券计算折扣
   */
  async applyCoupons(data: ApplyCouponRequest): Promise<CouponDiscountResult> {
    const response = await api.post('/coupons/apply', data);
    return handleApiResponse<CouponDiscountResult>(response);
  }

  /**
   * 验证优惠券是否可用
   */
  async validateCoupon(
    code: string,
    orderData: {
      subtotal: number;
      items: Array<{
        productId: string;
        quantity: number;
        price: number;
      }>;
    }
  ): Promise<{
    isValid: boolean;
    error?: string;
    coupon?: Coupon;
  }> {
    const response = await api.post('/coupons/validate', {
      code,
      ...orderData,
    });
    return handleApiResponse(response);
  }

  /**
   * 获取用户可用的优惠券
   */
  async getUserCoupons(): Promise<Coupon[]> {
    const response = await api.get('/coupons/user');
    return handleApiResponse<Coupon[]>(response);
  }
}

export const couponService = new CouponService();
export default couponService;
