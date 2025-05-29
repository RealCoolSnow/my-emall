/**
 * 产品 API 测试
 * 测试产品的 CRUD 操作
 */

import request from 'supertest';
import { app } from '../index';
import { db } from '../models/database';

describe('Products API', () => {
  let adminToken: string;
  let userToken: string;
  let categoryId: string;
  let productId: string;

  beforeAll(async () => {
    // 清理测试数据库
    await db.cleanup();

    // 创建管理员用户
    const adminResponse = await request(app).post('/api/auth/register').send({
      email: 'admin@example.com',
      username: 'admin',
      password: 'Admin123!@#',
    });

    // 手动设置管理员角色
    await db.prisma.user.update({
      where: { id: adminResponse.body.data.user.id },
      data: { role: 'ADMIN' },
    });

    // 重新登录获取管理员令牌
    const adminLoginResponse = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'Admin123!@#',
    });

    adminToken = adminLoginResponse.body.data.token;

    // 创建普通用户
    const userResponse = await request(app).post('/api/auth/register').send({
      email: 'user@example.com',
      username: 'user',
      password: 'User123!@#',
    });

    userToken = userResponse.body.data.token;

    // 创建测试分类
    const category = await db.prisma.category.create({
      data: {
        name: '测试分类',
        description: '用于测试的分类',
      },
    });

    categoryId = category.id;
  });

  afterAll(async () => {
    // 清理测试数据库
    await db.cleanup();
    await db.disconnect();
  });

  describe('POST /api/products', () => {
    it('should create a product successfully with admin token', async () => {
      const productData = {
        name: '测试产品',
        description: '这是一个测试产品',
        price: 99.99,
        stock: 100,
        categoryId,
        imageUrls: ['https://example.com/image1.jpg'],
        attributes: { color: 'red', size: 'M' },
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(productData.name);
      expect(response.body.data.price).toBe(productData.price);
      expect(response.body.data.stock).toBe(productData.stock);
      expect(response.body.data.imageUrls).toEqual(productData.imageUrls);
      expect(response.body.data.attributes).toEqual(productData.attributes);

      productId = response.body.data.id;
    });

    it('should fail without admin permission', async () => {
      const productData = {
        name: '测试产品2',
        description: '这是另一个测试产品',
        price: 199.99,
        stock: 50,
        categoryId,
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(productData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should fail with invalid category', async () => {
      const productData = {
        name: '测试产品3',
        description: '这是另一个测试产品',
        price: 299.99,
        stock: 25,
        categoryId: 'invalid-category-id',
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/products', () => {
    it('should get products list without authentication', async () => {
      const response = await request(app).get('/api/products').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.data.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/products?page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });

    it('should support search', async () => {
      const response = await request(app)
        .get('/api/products?search=测试')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThan(0);
      expect(response.body.data.data[0].name).toContain('测试');
    });

    it('should support category filter', async () => {
      const response = await request(app)
        .get(`/api/products?categoryId=${categoryId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThan(0);
      expect(response.body.data.data[0].categoryId).toBe(categoryId);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get product details', async () => {
      const response = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(productId);
      expect(response.body.data.name).toBe('测试产品');
      expect(response.body.data.category).toBeDefined();
    });

    it('should fail with invalid product ID', async () => {
      const response = await request(app)
        .get('/api/products/invalid-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('NOT_FOUND');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update product with admin token', async () => {
      const updateData = {
        name: '更新的测试产品',
        price: 149.99,
        stock: 80,
      };

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.price).toBe(updateData.price);
      expect(response.body.data.stock).toBe(updateData.stock);
    });

    it('should fail without admin permission', async () => {
      const updateData = {
        name: '用户尝试更新',
        price: 999.99,
      };

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('GET /api/products/popular', () => {
    it('should get popular products', async () => {
      const response = await request(app)
        .get('/api/products/popular?limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('PATCH /api/products/:id/stock', () => {
    it('should update product stock with admin token', async () => {
      const stockUpdate = { quantity: -10 }; // 减少 10 个库存

      const response = await request(app)
        .patch(`/api/products/${productId}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(stockUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stock).toBe(70); // 80 - 10 = 70
    });

    it('should fail with insufficient stock', async () => {
      const stockUpdate = { quantity: -100 }; // 尝试减少超过现有库存

      const response = await request(app)
        .patch(`/api/products/${productId}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(stockUpdate)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });
  });
});
