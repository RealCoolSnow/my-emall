import { Coupon, CouponValidationResult, CouponDiscountResult, OrderContext } from '../types';
export interface CouponStrategy {
    validate(coupon: Coupon, orderContext: OrderContext): CouponValidationResult;
    calculateDiscount(coupon: Coupon, orderContext: OrderContext): CouponDiscountResult;
}
export declare class FixedAmountStrategy implements CouponStrategy {
    validate(coupon: Coupon, orderContext: OrderContext): CouponValidationResult;
    calculateDiscount(coupon: Coupon, orderContext: OrderContext): CouponDiscountResult;
}
export declare class PercentageStrategy implements CouponStrategy {
    validate(coupon: Coupon, orderContext: OrderContext): CouponValidationResult;
    calculateDiscount(coupon: Coupon, orderContext: OrderContext): CouponDiscountResult;
}
export declare class FreeShippingStrategy implements CouponStrategy {
    validate(coupon: Coupon, orderContext: OrderContext): CouponValidationResult;
    calculateDiscount(coupon: Coupon, orderContext: OrderContext): CouponDiscountResult;
}
//# sourceMappingURL=index.d.ts.map