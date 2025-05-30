# 电商平台 (E-commerce Platform)

基于 monorepo 架构的线上商品交易平台，使用 SQLite 数据库。

## 🏗️ 项目结构

```
my-emall/
├── apps/                    # 应用程序
│   ├── frontend/           # Next.js 前端应用 (端口: 3000)
│   ├── backend/            # Express 后端 API (端口: 3001)
│   └── admin/              # React Admin 管理后台 (端口: 3002)
├── packages/               # 共享包
│   ├── shared/             # 共享类型和工具
│   └── coupons/            # 优惠券系统 (策略模式)
├── docs/                   # 文档
└── .cursorrules           # Cursor AI 规则
```

## 🛠️ 技术栈

- **前端**: React, Next.js 14, TypeScript, Ant Design
- **后端**: Node.js, Express, TypeScript
- **数据库**: SQLite + Prisma ORM
- **管理后台**: React Admin
- **包管理**: pnpm (monorepo)
- **代码质量**: ESLint, Prettier, Husky

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
pnpm install
```

### 初始化数据库

```bash
cd apps/backend
pnpm prisma generate
pnpm prisma db push
cp .env.example .env
pnpm db:seed
```

### 启动开发服务器

```bash
# 启动后端 API (http://localhost:3001)
pnpm dev:backend

# 启动前端应用 (http://localhost:3000)
pnpm dev:frontend

# 启动管理后台 (http://localhost:3002)
pnpm dev:admin
```

## 📦 可用脚本

```bash
# 开发
pnpm dev:frontend    # 启动前端
pnpm dev:backend     # 启动后端
pnpm dev:admin       # 启动管理后台

# 构建
pnpm build           # 构建所有项目

# 测试
pnpm test            # 运行所有测试

# 代码质量
pnpm lint            # 代码检查
pnpm format          # 代码格式化

# 数据库
cd apps/backend
pnpm db:generate     # 生成 Prisma 客户端
pnpm db:push         # 推送 schema 到数据库
pnpm db:studio       # 打开 Prisma Studio
```

## 🗄️ 数据库模型

主要数据模型包括：

- **User**: 用户管理
- **Product**: 商品信息
- **Category**: 商品分类
- **Order**: 订单管理
- **CartItem**: 购物车
- **Review**: 商品评价
- **Coupon**: 优惠券系统

## 🎯 功能特性

- ✅ Monorepo 架构
- ✅ TypeScript 全栈
- ✅ SQLite 数据库
- ✅ Prisma ORM
- ✅ 优惠券策略模式
- ✅ 代码质量工具
- ✅ Git Hooks
- ✅ 共享类型和工具

## 📚 开发指南

详细的开发指南请查看 `docs/` 目录：

- [项目设置](docs/setup.markdown)
- [前端开发](docs/frontend.markdown)
- [后端开发](docs/backend.markdown)
- [管理后台](docs/admin.markdown)
- [优惠券系统](docs/coupons.markdown)
- [测试指南](docs/testing.markdown)
- [部署指南](docs/deployment.markdown)

## 🤖 AI 辅助开发

项目配置了 `.cursorrules` 文件，支持 Cursor AI 智能代码生成：

```
生成 Ant Design 商品列表组件
生成 Express 优惠券 API
生成 Prisma SQLite 模型
生成优惠券策略模式
```

## 📄 许可证

MIT License-full-stack
