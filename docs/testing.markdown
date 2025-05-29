# 测试指南

## 测试工具
- Jest, React Testing Library（前端）
- Jest, Supertest（后端）
- Cypress（E2E）

## 安装
```bash
pnpm add -D jest @testing-library/react cypress supertest --filter frontend
pnpm add -D jest supertest --filter backend
```

## 测试用例
1. **前端**
   ```ts
   // apps/frontend/__tests__/ProductList.test.tsx
   import { render } from '@testing-library/react';
   import { ProductList } from '../src/components/ProductList';

   test('renders product list', () => {
     const { getByText } = render(<ProductList />);
     expect(getByText(/product name/i)).toBeInTheDocument();
   });
   ```

2. **后端**
   ```ts
   // apps/backend/__tests__/couponService.test.ts
   import { CouponService } from 'packages/coupons/services';

   test('applies full discount', () => {
     const service = new CouponService();
     const order = { totalAmount: 150 };
     const coupon = { type: 'full_discount', rules: { threshold: 100, discount: 20 }, priority: 1 };
     expect(service.applyCoupons(order, [coupon])).toBe(130);
   });
   ```

## Cursor 使用提示
- 生成测试：`为 CouponService 生成 Jest 测试`。