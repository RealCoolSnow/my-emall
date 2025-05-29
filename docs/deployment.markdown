# 部署指南

## 部署环境

- **前端/管理后台**：Vercel
- **后端**：Render
- **数据库**：SQLite

## 部署步骤

1. **前端/管理后台**

   - 导入 `apps/frontend` 和 `apps/admin` 到 Vercel。
   - 配置环境变量：
     ```env
     NEXT_PUBLIC_API_URL=http://backend-url
     ```

2. **后端**

   - 创建 `apps/backend/Dockerfile`：
     ```dockerfile
     FROM node:18
     WORKDIR /app
     COPY apps/backend/package.json .
     RUN npm install -g pnpm && pnpm install
     COPY apps/backend .
     COPY packages/* ../packages/
     CMD ["pnpm", "start"]
     ```
   - 部署到 Render。

3. **数据库**
   - SQLite 文件存储在 Render 磁盘，定期备份。

## Cursor 使用提示

- 生成 Dockerfile：`生成 Node.js Dockerfile`。
