# 电商平台前端

基于 Next.js 14、Ant Design 和 TypeScript 构建的现代化电商前端应用。

## 功能特性

### 🛍️ 核心功能

- **商品浏览**: 支持搜索、筛选、分页的商品列表
- **购物车管理**: 添加、删除、修改商品数量
- **优惠券系统**: 选择和应用优惠券
- **订单管理**: 创建订单、查看订单详情
- **用户认证**: 登录、注册、用户状态管理

### 🎨 UI/UX

- **响应式设计**: 适配桌面和移动设备
- **Ant Design**: 统一的设计语言和组件库
- **中文本地化**: 完整的中文界面
- **加载状态**: 优雅的加载和错误处理

### 🔧 技术栈

- **Next.js 14**: App Router 架构
- **React 18**: 最新的 React 特性
- **TypeScript**: 类型安全
- **Ant Design 5**: UI 组件库
- **Zustand**: 轻量级状态管理
- **Axios**: HTTP 客户端

## 项目结构

```
apps/frontend/
├── src/
│   ├── app/                 # Next.js App Router 页面
│   │   ├── page.tsx        # 首页
│   │   ├── cart/           # 购物车页面
│   │   ├── checkout/       # 结算页面
│   │   └── layout.tsx      # 根布局
│   ├── components/         # React 组件
│   │   ├── ProductList.tsx # 商品列表
│   │   ├── Cart.tsx        # 购物车
│   │   ├── CouponSelector.tsx # 优惠券选择器
│   │   └── OrderSummary.tsx   # 订单摘要
│   ├── hooks/              # 自定义 Hooks
│   │   ├── useAuth.ts      # 认证状态
│   │   ├── useCart.ts      # 购物车状态
│   │   ├── useCoupons.ts   # 优惠券管理
│   │   └── useProducts.ts  # 商品数据
│   ├── services/           # API 服务
│   │   ├── authService.ts  # 认证服务
│   │   ├── productService.ts # 商品服务
│   │   ├── cartService.ts  # 购物车服务
│   │   ├── couponService.ts # 优惠券服务
│   │   └── orderService.ts # 订单服务
│   ├── lib/                # 工具库
│   │   └── api.ts          # API 客户端配置
│   └── types/              # 类型定义
│       └── index.ts        # 前端类型
├── public/                 # 静态资源
├── .env.local             # 环境变量
├── next.config.js         # Next.js 配置
└── package.json           # 依赖配置
```

## 核心组件

### ProductList

- 商品网格展示
- 搜索和筛选功能
- 分页支持
- 加入购物车操作

### Cart

- 购物车商品列表
- 数量修改
- 商品移除
- 总价计算

### CouponSelector

- 可用优惠券展示
- 优惠券验证
- 折扣计算
- 优惠券管理

### OrderSummary

- 订单明细
- 费用计算
- 优惠券折扣显示
- 结算操作

## 状态管理

### useAuth

- 用户登录状态
- 认证令牌管理
- 用户信息存储

### useCart

- 购物车商品管理
- 本地持久化
- 数量和总价计算

### useCoupons

- 优惠券选择
- 折扣计算
- 验证逻辑

### useProducts

- 商品数据获取
- 搜索和筛选
- 分页管理

## API 集成

所有 API 调用都通过统一的 axios 实例处理：

- 自动添加认证头
- 统一错误处理
- 响应拦截器
- 类型安全的响应处理

## 开发指南

### 启动开发服务器

```bash
cd apps/frontend
pnpm install
pnpm dev
```

### 构建生产版本

```bash
pnpm build
pnpm start
```

### 环境变量

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_APP_NAME=电商平台
```

## 特性说明

### 响应式设计

- 使用 Ant Design 的栅格系统
- 移动端优先的设计理念
- 自适应布局

### 错误处理

- 全局错误边界
- API 错误统一处理
- 用户友好的错误提示

### 性能优化

- 组件懒加载
- 图片优化
- 代码分割
- 缓存策略

### 类型安全

- 完整的 TypeScript 类型定义
- 与后端 API 类型同步
- 编译时类型检查

## 下一步计划

- [ ] 添加商品详情页
- [ ] 实现用户个人中心
- [ ] 添加订单历史页面
- [ ] 实现实时通知
- [ ] 添加商品评价功能
- [ ] 优化 SEO
- [ ] 添加 PWA 支持
