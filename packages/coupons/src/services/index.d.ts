import { Coupon, CouponValidationResult, CouponDiscountResult, OrderContext } from '../types';
export declare class CouponService {
    private strategies;
    constructor();
    validateCoupon(coupon: Coupon, orderContext: OrderContext): CouponValidationResult;
    calculateDiscount(coupon: Coupon, orderContext: OrderContext): CouponDiscountResult | null;
    applyCoupons(coupons: Coupon[], orderContext: OrderContext): {
        totalDiscount: number;
        finalAmount: number;
        appliedCoupons: Coupon[];
        errors: string[];
    };
}
//# sourceMappingURL=index.d.ts.map