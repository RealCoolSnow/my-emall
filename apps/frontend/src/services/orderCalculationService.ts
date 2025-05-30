import api, { handleApiResponse } from '../lib/api';

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

export interface CouponRecommendationRequest {
  orderItems: OrderItem[];
  subtotal: number;
}

export interface CouponRecommendationResult {
  recommendedCouponIds: string[];
}

class OrderCalculationService {
  /**
   * 计算订单总价
   */
  async calculateOrder(
    request: OrderCalculationRequest
  ): Promise<OrderCalculationResult> {
    const response = await api.post('/order-calculation/calculate', request);
    return handleApiResponse<OrderCalculationResult>(response);
  }

  /**
   * 获取优惠券推荐
   */
  async getRecommendedCoupons(
    request: CouponRecommendationRequest
  ): Promise<CouponRecommendationResult> {
    const response = await api.post(
      '/order-calculation/recommend-coupons',
      request
    );
    return handleApiResponse<CouponRecommendationResult>(response);
  }
}

export const orderCalculationService = new OrderCalculationService();
export default orderCalculationService;
