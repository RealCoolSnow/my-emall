import {
  Coupon,
  CouponType,
  CouponValidationResult,
  CouponDiscountResult,
  OrderContext,
} from '../types';
import {
  CouponStrategy,
  FixedAmountStrategy,
  PercentageStrategy,
  FreeShippingStrategy,
} from '../strategies';

export class CouponService {
  private strategies: Map<CouponType, CouponStrategy>;

  constructor() {
    this.strategies = new Map();
    this.strategies.set(CouponType.FIXED_AMOUNT, new FixedAmountStrategy());
    this.strategies.set(CouponType.PERCENTAGE, new PercentageStrategy());
    this.strategies.set(CouponType.FREE_SHIPPING, new FreeShippingStrategy());
  }

  validateCoupon(
    coupon: Coupon,
    orderContext: OrderContext
  ): CouponValidationResult {
    const strategy = this.strategies.get(coupon.type);
    if (!strategy) {
      return { isValid: false, error: '不支持的优惠券类型' };
    }

    return strategy.validate(coupon, orderContext);
  }

  calculateDiscount(
    coupon: Coupon,
    orderContext: OrderContext
  ): CouponDiscountResult | null {
    const validation = this.validateCoupon(coupon, orderContext);
    if (!validation.isValid) {
      return null;
    }

    const strategy = this.strategies.get(coupon.type);
    if (!strategy) {
      return null;
    }

    return strategy.calculateDiscount(coupon, orderContext);
  }

  applyCoupons(
    coupons: Coupon[],
    orderContext: OrderContext
  ): {
    totalDiscount: number;
    finalAmount: number;
    appliedCoupons: Coupon[];
    errors: string[];
  } {
    let totalDiscount = 0;
    let currentSubtotal = orderContext.subtotal;
    const appliedCoupons: Coupon[] = [];
    const errors: string[] = [];

    for (const coupon of coupons) {
      const currentContext = { ...orderContext, subtotal: currentSubtotal };
      const result = this.calculateDiscount(coupon, currentContext);

      if (result) {
        totalDiscount += result.discount;
        currentSubtotal = result.finalAmount;
        appliedCoupons.push(coupon);
      } else {
        const validation = this.validateCoupon(coupon, currentContext);
        if (validation.error) {
          errors.push(`${coupon.code}: ${validation.error}`);
        }
      }
    }

    return {
      totalDiscount,
      finalAmount: currentSubtotal,
      appliedCoupons,
      errors,
    };
  }
}
