# 前端开发指南

## 目录结构

```
apps/frontend/
├── src/
│   ├── components/
│   │   ├── ProductList.tsx
│   │   ├── Cart.tsx
│   │   ├── CouponSelector.tsx
│   ├── pages/
│   │   ├── index.tsx
│   │   ├── cart.tsx
│   │   ├── order.tsx
│   ├── hooks/
│   │   ├── useCart.ts
│   │   ├── useCoupons.ts
│   ├── styles/
│   │   ├── globals.css
│   ├── types/
│   │   ├── index.ts
├── public/
├── package.json
└── tsconfig.json
```

## 依赖安装

```bash
cd apps/frontend
pnpm add react react-dom next antd axios zustand
pnpm add -D typescript @types/react @types/node
```

## 核心功能

1. **商品浏览与搜索**

   - 使用 Next.js 动态路由和 Ant Design 组件。
   - 示例：

     ```tsx
     // src/components/ProductList.tsx
     import { useEffect, useState } from 'react';
     import { Card } from 'antd';
     import { fetchProducts } from '../utils/api';

     export const ProductList = () => {
       const [products, setProducts] = useState([]);
       useEffect(() => {
         fetchProducts().then(setProducts);
       }, []);
       return (
         <div className="grid grid-cols-3 gap-4">
           {products.map((product) => (
             <Card key={product.id} title={product.name}>
               <p>价格: {product.price}</p>
             </Card>
           ))}
         </div>
       );
     };
     ```

2. **优惠券选择**

   - 使用 `packages/coupons` 的类型和工具函数。
   - 示例：

     ```tsx
     // src/components/CouponSelector.tsx
     import { useState } from 'react';
     import { applyCoupon } from 'packages/coupons/services';
     import { Coupon } from 'packages/shared/types';

     export const CouponSelector = ({ orderTotal }: { orderTotal: number }) => {
       const [selectedCoupons, setSelectedCoupons] = useState<Coupon[]>([]);
       const handleApply = async (coupon: Coupon) => {
         const result = await applyCoupon({ orderTotal, coupon });
         console.log('优惠后金额:', result.finalAmount);
       };
       return <div>{/* 优惠券选择 UI */}</div>;
     };
     ```

## Cursor 使用提示

- 生成组件：`生成 Ant Design 商品列表组件`。
- 优化代码：使用 `Ctrl+Shift+K` 确保符合 `.cursorrules`。
- 引用共享类型：从 `packages/shared/types` 导入。
