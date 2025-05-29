'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.FreeShippingStrategy =
  exports.PercentageStrategy =
  exports.FixedAmountStrategy =
    void 0;
// Fixed amount discount strategy
class FixedAmountStrategy {
  validate(coupon, orderContext) {
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
  calculateDiscount(coupon, orderContext) {
    const discount = Math.min(coupon.value, orderContext.subtotal);
    const finalAmount = Math.max(0, orderContext.subtotal - discount);
    return {
      discount,
      finalAmount,
      appliedCoupon: coupon,
    };
  }
}
exports.FixedAmountStrategy = FixedAmountStrategy;
// Percentage discount strategy
class PercentageStrategy {
  validate(coupon, orderContext) {
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
  calculateDiscount(coupon, orderContext) {
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
exports.PercentageStrategy = PercentageStrategy;
// Free shipping strategy
class FreeShippingStrategy {
  validate(coupon, orderContext) {
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
  calculateDiscount(coupon, orderContext) {
    const discount = orderContext.shippingCost;
    const finalAmount = orderContext.subtotal; // Shipping is free, but subtotal remains
    return {
      discount,
      finalAmount,
      appliedCoupon: coupon,
    };
  }
}
exports.FreeShippingStrategy = FreeShippingStrategy;
//# sourceMappingURL=index.js.map
