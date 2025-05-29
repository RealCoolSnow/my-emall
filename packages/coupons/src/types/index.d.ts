export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export declare enum CouponType {
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  PERCENTAGE = 'PERCENTAGE',
  FREE_SHIPPING = 'FREE_SHIPPING',
}
export interface CouponValidationResult {
  isValid: boolean;
  error?: string;
}
export interface CouponDiscountResult {
  discount: number;
  finalAmount: number;
  appliedCoupon: Coupon;
}
export interface OrderContext {
  subtotal: number;
  shippingCost: number;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}
//# sourceMappingURL=index.d.ts.map
