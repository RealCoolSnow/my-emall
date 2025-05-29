# E-commerce Platform API 接口文档

## 概述

本文档描述了电商平台后端API的所有接口，包括认证、产品、订单、优惠券等功能模块。

## 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token (JWT)
- **数据格式**: JSON
- **字符编码**: UTF-8

## 通用响应格式

### 成功响应

```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 错误响应

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "错误描述",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 分页响应

```json
{
  "success": true,
  "data": {
    "data": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## 认证模块 (Auth)

### 用户注册

- **URL**: `POST /auth/register`
- **描述**: 注册新用户账户
- **认证**: 无需认证

**请求参数**:

```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "Password123!@#"
}
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "username",
      "role": "CUSTOMER"
    },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  },
  "message": "注册成功"
}
```

### 用户登录

- **URL**: `POST /auth/login`
- **描述**: 用户登录获取访问令牌
- **认证**: 无需认证

**请求参数**:

```json
{
  "email": "user@example.com",
  "password": "Password123!@#"
}
```

### 获取当前用户信息

- **URL**: `GET /auth/me`
- **描述**: 获取当前登录用户的详细信息
- **认证**: 需要Bearer Token

### 更新用户资料

- **URL**: `PUT /auth/profile`
- **描述**: 更新用户个人资料
- **认证**: 需要Bearer Token

### 修改密码

- **URL**: `POST /auth/change-password`
- **描述**: 修改用户密码
- **认证**: 需要Bearer Token

### 用户登出

- **URL**: `POST /auth/logout`
- **描述**: 用户登出，将令牌加入黑名单
- **认证**: 需要Bearer Token

## 产品模块 (Products)

### 获取产品列表

- **URL**: `GET /products`
- **描述**: 获取产品列表，支持分页、搜索、筛选和排序
- **认证**: 可选认证

**查询参数**:

- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10, 最大: 100)
- `search`: 搜索关键词
- `categoryId`: 分类ID
- `status`: 产品状态 (ACTIVE, INACTIVE, OUT_OF_STOCK)
- `minPrice`: 最低价格
- `maxPrice`: 最高价格
- `sortBy`: 排序字段 (默认: createdAt)
- `sortOrder`: 排序方向 (asc, desc, 默认: desc)

### 获取产品详情

- **URL**: `GET /products/:id`
- **描述**: 根据ID获取产品详细信息
- **认证**: 可选认证

### 创建产品

- **URL**: `POST /products`
- **描述**: 创建新产品
- **认证**: 需要管理员权限

### 更新产品

- **URL**: `PUT /products/:id`
- **描述**: 更新产品信息
- **认证**: 需要管理员权限

### 更新产品库存

- **URL**: `PATCH /products/:id/stock`
- **描述**: 更新产品库存数量
- **认证**: 需要管理员权限

### 删除产品

- **URL**: `DELETE /products/:id`
- **描述**: 删除产品
- **认证**: 需要超级管理员权限

### 获取热门产品

- **URL**: `GET /products/popular`
- **描述**: 获取热门产品列表
- **认证**: 可选认证

## 订单模块 (Orders)

### 获取订单列表

- **URL**: `GET /orders`
- **描述**: 获取订单列表，普通用户只能查看自己的订单
- **认证**: 需要认证

### 获取订单详情

- **URL**: `GET /orders/:id`
- **描述**: 根据ID获取订单详细信息
- **认证**: 需要认证

### 创建订单

- **URL**: `POST /orders`
- **描述**: 创建新订单
- **认证**: 需要认证

### 更新订单

- **URL**: `PUT /orders/:id`
- **描述**: 更新订单状态
- **认证**: 需要管理员权限

### 取消订单

- **URL**: `POST /orders/:id/cancel`
- **描述**: 取消订单
- **认证**: 需要认证

### 获取用户订单

- **URL**: `GET /orders/user/:userId`
- **描述**: 获取指定用户的订单列表
- **认证**: 需要管理员权限或用户本人

## 优惠券模块 (Coupons)

### 获取优惠券列表

- **URL**: `GET /coupons`
- **描述**: 获取优惠券列表
- **认证**: 可选认证

### 获取优惠券详情

- **URL**: `GET /coupons/:id`
- **描述**: 根据ID获取优惠券详细信息
- **认证**: 可选认证

### 创建优惠券

- **URL**: `POST /coupons`
- **描述**: 创建新优惠券
- **认证**: 需要管理员权限

### 更新优惠券

- **URL**: `PUT /coupons/:id`
- **描述**: 更新优惠券信息
- **认证**: 需要管理员权限

### 应用优惠券

- **URL**: `POST /coupons/apply`
- **描述**: 计算优惠券折扣
- **认证**: 需要认证

### 删除优惠券

- **URL**: `DELETE /coupons/:id`
- **描述**: 删除优惠券
- **认证**: 需要超级管理员权限

## 错误代码

| 错误代码         | HTTP状态码 | 描述           |
| ---------------- | ---------- | -------------- |
| VALIDATION_ERROR | 400        | 数据验证失败   |
| UNAUTHORIZED     | 401        | 未授权访问     |
| FORBIDDEN        | 403        | 权限不足       |
| NOT_FOUND        | 404        | 资源未找到     |
| CONFLICT         | 409        | 资源冲突       |
| INTERNAL_ERROR   | 500        | 服务器内部错误 |
| DATABASE_ERROR   | 500        | 数据库操作失败 |

## 权限说明

### 用户角色

- **CUSTOMER**: 普通用户
- **ADMIN**: 管理员
- **SUPER_ADMIN**: 超级管理员

### 权限层级

SUPER_ADMIN > ADMIN > CUSTOMER

## 测试状态

### 已通过的测试

✅ **认证模块测试** (8/8 通过)

- 密码加密和验证
- JWT令牌生成和验证
- 邮箱格式验证
- 密码强度验证

### 待修复的测试

❌ **产品模块测试** - 模块导入问题需要修复

## 开发环境配置

### 环境变量

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=file:./dev.db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
```

### 数据库

- **类型**: SQLite
- **ORM**: Prisma
- **文件位置**: `prisma/dev.db`

## 部署说明

1. 安装依赖: `pnpm install`
2. 生成Prisma客户端: `npx prisma generate`
3. 运行数据库迁移: `npx prisma db push`
4. 启动服务: `pnpm start`

## 联系信息

如有问题或建议，请联系开发团队。
