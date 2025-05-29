# 后端开发指南

## 目录结构

```
apps/backend/
├── src/
│   ├── api/
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   ├── coupons.ts
│   ├── services/
│   │   ├── orderService.ts
│   ├── models/
│   │   ├── product.ts
│   ├── utils/
│   │   ├── auth.ts
│   ├── types/
│   │   ├── index.ts
├── prisma/
│   └── schema.prisma
├── package.json
└── tsconfig.json
```

## 依赖安装

```bash
cd apps/backend
pnpm add express @prisma/client jsonwebtoken
pnpm add -D typescript ts-node nodemon @types/express @types/jsonwebtoken
pnpm add packages/coupons packages/shared
```

## 核心功能

1. **Prisma 配置**

   - `prisma/schema.prisma`：
     ```prisma
     datasource db {
       provider = "sqlite"
       url      = "file:./dev.db"
     }
     model Product {
       id          Int      @id @default(autoincrement())
       name        String
       price       Float
       stock       Int
       category    String
       description String?
     }
     model Coupon {
       id            Int      @id @default(autoincrement())
       type          String
       rules         Json
       validFrom     DateTime
       validTo       DateTime
       priority      Int
       stackableRules Json
     }
     ```

2. **API 实现**

   - 示例：优惠券应用 API

     ```ts
     // src/api/coupons.ts
     import express from 'express';
     import { CouponService } from 'packages/coupons/services';

     const router = express.Router();
     const couponService = new CouponService();

     router.post('/apply', async (req, res) => {
       const { order, coupons } = req.body;
       const finalAmount = await couponService.applyCoupons(order, coupons);
       res.json({ finalAmount });
     });

     export default router;
     ```

## Cursor 使用提示

- 生成 API：`生成 Express 路由处理优惠券应用`。
- 生成 Prisma 模型：`生成 SQLite Prisma 模型`。
- 优化服务逻辑：使用 `Ctrl+K`。
