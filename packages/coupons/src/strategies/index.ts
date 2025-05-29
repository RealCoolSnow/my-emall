import {
  Coupon,
  CouponValidationResult,
  CouponDiscountResult,
  OrderContext,
} from '../types';

// Strategy interface
export interface CouponStrategy {
  validate(coupon: Coupon, orderContext: OrderContext): CouponValidationResult;
  calculateDiscount(
    coupon: Coupon,
    orderContext: OrderContext
  ): CouponDiscountResult;
}

// Fixed amount discount strategy
export class FixedAmountStrategy implements CouponStrategy {
  validate(coupon: Coupon, orderContext: OrderContext): CouponValidationResult {
    if (!coupon.isActive) {
      return { isValid: false, error: '优惠券已失效' };
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return { isValid: false, error: '优惠券不在有效期内' };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { isValid: false, error: '优惠券使用次数已达上限' };
    }

    if (coupon.minAmount && orderContext.subtotal < coupon.minAmount) {
      return { isValid: false, error: `订单金额需满${coupon.minAmount}元` };
    }

    return { isValid: true };
  }

  calculateDiscount(
    coupon: Coupon,
    orderContext: OrderContext
  ): CouponDiscountResult {
    const discount = Math.min(coupon.value, orderContext.subtotal);
    const finalAmount = Math.max(0, orderContext.subtotal - discount);

    return {
      discount,
      finalAmount,
      appliedCoupon: coupon,
    };
  }
}

// Percentage discount strategy
export class PercentageStrategy implements CouponStrategy {
  validate(coupon: Coupon, orderContext: OrderContext): CouponValidationResult {
    if (!coupon.isActive) {
      return { isValid: false, error: '优惠券已失效' };
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return { isValid: false, error: '优惠券不在有效期内' };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { isValid: false, error: '优惠券使用次数已达上限' };
    }

    if (coupon.minAmount && orderContext.subtotal < coupon.minAmount) {
      return { isValid: false, error: `订单金额需满${coupon.minAmount}元` };
    }

    return { isValid: true };
  }

  calculateDiscount(
    coupon: Coupon,
    orderContext: OrderContext
  ): CouponDiscountResult {
    let discount = (orderContext.subtotal * coupon.value) / 100;

    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }

    const finalAmount = Math.max(0, orderContext.subtotal - discount);

    return {
      discount,
      finalAmount,
      appliedCoupon: coupon,
    };
  }
}

// Free shipping strategy
export class FreeShippingStrategy implements CouponStrategy {
  validate(coupon: Coupon, orderContext: OrderContext): CouponValidationResult {
    if (!coupon.isActive) {
      return { isValid: false, error: '优惠券已失效' };
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return { isValid: false, error: '优惠券不在有效期内' };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { isValid: false, error: '优惠券使用次数已达上限' };
    }

    if (coupon.minAmount && orderContext.subtotal < coupon.minAmount) {
      return { isValid: false, error: `订单金额需满${coupon.minAmount}元` };
    }

    return { isValid: true };
  }

  calculateDiscount(
    coupon: Coupon,
    orderContext: OrderContext
  ): CouponDiscountResult {
    const discount = orderContext.shippingCost;
    const finalAmount = orderContext.subtotal; // Shipping is free, but subtotal remains

    return {
      discount,
      finalAmount,
      appliedCoupon: coupon,
    };
  }
}
