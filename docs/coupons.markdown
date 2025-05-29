# 优惠券模块开发指南

## 目录结构
```
packages/coupons/
├── src/
│   ├── strategies/
│   │   ├── fullDiscount.ts
│   │   ├── productCoupon.ts
│   ├── services/
│   │   ├── couponService.ts
│   ├── types/
│   │   ├── index.ts
├── package.json
```

## 依赖安装
```bash
cd packages/coupons
pnpm add packages/shared
pnpm add -D typescript
```

## 核心功能
1. **规则引擎**
   - 示例：
     ```ts
     // src/services/couponService.ts
     import { Coupon } from 'packages/shared/types';

     interface CouponStrategy {
       apply(order: any, coupon: Coupon): number;
     }

     class FullDiscountCoupon implements CouponStrategy {
       apply(order: any, coupon: Coupon): number {
         const { threshold, discount } = coupon.rules;
         return order.totalAmount >= threshold ? order.totalAmount - discount : order.totalAmount;
       }
     }

     export class CouponService {
       private strategies: Record<string, CouponStrategy> = {
         full_discount: new FullDiscountCoupon(),
       };

       applyCoupons(order: any, coupons: Coupon[]): number {
         let finalAmount = order.totalAmount;
         coupons.sort((a, b) => a.priority - b.priority);
         for (const coupon of coupons) {
           if (this.strategies[coupon.type]) {
             finalAmount = this.strategies[coupon.type].apply(order, coupon);
           }
         }
         return finalAmount;
       }
     }
     ```

## Cursor 使用提示
- 生成策略：`生成 TypeScript 优惠券策略模式`。
- 生成服务：`生成优惠券服务逻辑，支持 JSON 规则`。