"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponService = void 0;
const types_1 = require("../types");
const strategies_1 = require("../strategies");
class CouponService {
    constructor() {
        this.strategies = new Map();
        this.strategies.set(types_1.CouponType.FIXED_AMOUNT, new strategies_1.FixedAmountStrategy());
        this.strategies.set(types_1.CouponType.PERCENTAGE, new strategies_1.PercentageStrategy());
        this.strategies.set(types_1.CouponType.FREE_SHIPPING, new strategies_1.FreeShippingStrategy());
    }
    validateCoupon(coupon, orderContext) {
        const strategy = this.strategies.get(coupon.type);
        if (!strategy) {
            return { isValid: false, error: '不支持的优惠券类型' };
        }
        return strategy.validate(coupon, orderContext);
    }
    calculateDiscount(coupon, orderContext) {
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
    applyCoupons(coupons, orderContext) {
        let totalDiscount = 0;
        let currentSubtotal = orderContext.subtotal;
        const appliedCoupons = [];
        const errors = [];
        for (const coupon of coupons) {
            const currentContext = { ...orderContext, subtotal: currentSubtotal };
            const result = this.calculateDiscount(coupon, currentContext);
            if (result) {
                totalDiscount += result.discount;
                currentSubtotal = result.finalAmount;
                appliedCoupons.push(coupon);
            }
            else {
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
exports.CouponService = CouponService;
//# sourceMappingURL=index.js.map