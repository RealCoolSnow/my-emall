# 管理后台开发指南

## 目录结构

```
apps/admin/
├── src/
│   ├── components/
│   │   ├── ProductManagement.tsx
│   │   ├── CouponEditor.tsx
│   ├── pages/
│   │   ├── index.tsx
│   │   ├── products.tsx
│   ├── hooks/
│   │   ├── useAdminData.ts
│   ├── styles/
│   │   ├── globals.css
├── public/
├── package.json
└── tsconfig.json
```

## 依赖安装

```bash
cd apps/admin
pnpm add react react-dom next react-admin antd
pnpm add -D typescript @types/react @types/node
pnpm add packages/coupons packages/shared
```

## 核心功能

1. **商品管理**

   - 使用 React Admin 的 `List` 组件。
   - 示例：

     ```tsx
     // src/components/ProductManagement.tsx
     import { List, Datagrid, TextField } from 'react-admin';

     export const ProductManagement = () => (
       <List>
         <Datagrid>
           <TextField source="name" />
           <TextField source="price" />
         </Datagrid>
       </List>
     );
     ```

2. **优惠券编辑**

   - 调用 `packages/coupons` 服务。
   - 示例：

     ```tsx
     // src/components/CouponEditor.tsx
     import { useState } from 'react';
     import { createCoupon } from 'packages/coupons/services';

     export const CouponEditor = () => {
       const [coupon, setCoupon] = useState({ type: '', rules: {} });
       const handleSave = async () => {
         await createCoupon(coupon);
       };
       return <div>{/* 编辑 UI */}</div>;
     };
     ```

## Cursor 使用提示

- 生成组件：`生成 React Admin 商品管理组件`。
- 优化代码：使用 `Ctrl+Shift+K`。
