# 项目初始化与环境设置

## 概述

基于 monorepo 的线上商品交易平台，使用 SQLite 数据库。应用（前端、后端、管理后台）在 `apps/`，公用模块在 `packages/`。

## 技术栈

- **前端** (`apps/frontend`): React, Next.js, TypeScript, Ant Design
- **后端** (`apps/backend`): Node.js, Express, Prisma, SQLite
- **管理后台** (`apps/admin`): React Admin
- **公用模块** (`packages/`): shared（类型/工具），coupons（优惠券逻辑）
- **工具**: pnpm, Cursor, ESLint, Prettier, Husky

## 环境要求

- Node.js: v18+
- pnpm: v8+
- SQLite: v3.38+（支持 JSON）
- Cursor: 最新版本

## 初始化步骤

1. **克隆仓库**

   ```bash
   git clone <repository-url>
   cd project-root
   ```

2. **安装 pnpm**

   ```bash
   npm install -g pnpm
   ```

3. **初始化 monorepo**

   - 创建 `pnpm-workspace.yaml`：
     ```yaml
     packages:
       - 'apps/*'
       - 'packages/*'
     ```
   - 初始化根 `package.json`：
     ```json
     {
       "name": "ecommerce-platform",
       "private": true,
       "workspaces": ["apps/*", "packages/*"],
       "scripts": {
         "dev:frontend": "pnpm --filter frontend dev",
         "dev:backend": "pnpm --filter backend dev",
         "dev:admin": "pnpm --filter admin dev",
         "build": "pnpm --recursive build",
         "test": "pnpm --recursive test"
       }
     }
     ```

4. **安装依赖**

   ```bash
   pnpm install
   ```

5. **配置 SQLite 和 Prisma**

   ```bash
   cd apps/backend
   pnpm add -D prisma
   pnpm add @prisma/client
   npx prisma init
   ```

   - 配置 `prisma/schema.prisma`（见 backend.md）。

6. **配置 ESLint 和 Prettier**

   - `eslint.config.js`：
     ```javascript
     module.exports = {
       env: { browser: true, node: true, es2021: true },
       extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
       parser: '@typescript-eslint/parser',
       plugins: ['@typescript-eslint'],
     };
     ```
   - `prettier.config.js`：
     ```javascript
     module.exports = {
       semi: true,
       trailingComma: 'es5',
       singleQuote: true,
     };
     ```

7. **配置 Husky**

   ```bash
   pnpm add -D husky
   npx husky install
   npx husky add .husky/pre-commit "pnpm lint && pnpm format"
   ```

8. **启动开发**
   ```bash
   pnpm dev:frontend
   pnpm dev:backend
   pnpm dev:admin
   ```

## Cursor 使用提示

- 在 Cursor 中打开项目，加载 `.cursorrules`。
- 使用 `Ctrl+K` 生成代码，`Ctrl+Shift+K` 优化代码。
- 示例提示：`初始化 Next.js 页面` 或 `配置 Prisma SQLite 模型`。
