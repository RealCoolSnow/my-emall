/**
 * 管理后台API测试
 * 测试管理员专用的API功能
 */

import request from 'supertest';
import { app } from '../index';
import { db } from '../models/database';
import { generateAccessToken } from '../utils/auth';

describe('Admin API', () => {
  let adminToken: string;
  let userToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // 清理测试数据库
    await db.cleanup();

    // 创建测试用户
    const testUser = await db.prisma.user.create({
      data: {
        email: 'user@test.com',
        username: 'testuser',
        password: 'hashedpassword',
        role: 'CUSTOMER',
      },
    });
    testUserId = testUser.id;

    // 创建管理员用户
    const adminUser = await db.prisma.user.create({
      data: {
        email: 'admin@test.com',
        username: 'admin',
        password: 'hashedpassword',
        role: 'ADMIN',
      },
    });

    // 生成测试令牌
    adminToken = generateAccessToken({
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });

    userToken = generateAccessToken({
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role,
    });

    // 创建测试数据
    await createTestData();
  });

  afterAll(async () => {
    await db.cleanup();
    await db.disconnect();
  });

  async function createTestData() {
    // 创建测试产品
    const product = await db.prisma.product.create({
      data: {
        name: '测试产品',
        description: '测试产品描述',
        price: 99.99,
        stock: 5, // 低库存
        status: 'ACTIVE',
      },
    });

    // 创建测试订单
    await db.prisma.order.create({
      data: {
        userId: testUserId,
        totalAmount: 199.98,
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        shippingAddress: '测试地址',
        paymentMethod: 'ALIPAY',
        orderItems: {
          create: [
            {
              productId: product.id,
              quantity: 2,
              price: 99.99,
            },
          ],
        },
      },
    });

    // 创建测试优惠券
    await db.prisma.coupon.create({
      data: {
        code: 'EXPIRED10',
        name: '过期优惠券',
        type: 'PERCENTAGE',
        value: 10,
        isActive: true,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'), // 已过期
      },
    });
  }

  describe('GET /api/admin/stats', () => {
    it('should return admin statistics for admin user', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalUsers');
      expect(response.body.data).toHaveProperty('totalProducts');
      expect(response.body.data).toHaveProperty('totalOrders');
      expect(response.body.data).toHaveProperty('totalCoupons');
      expect(response.body.data).toHaveProperty('todayOrders');
      expect(response.body.data).toHaveProperty('activeUsers');
      expect(response.body.data).toHaveProperty('lowStockProducts');
      expect(response.body.data).toHaveProperty('expiredCoupons');
      expect(response.body.data).toHaveProperty('totalRevenue');
      expect(response.body.data).toHaveProperty('todayRevenue');

      // 验证数据类型
      expect(typeof response.body.data.totalUsers).toBe('number');
      expect(typeof response.body.data.totalProducts).toBe('number');
      expect(typeof response.body.data.lowStockProducts).toBe('number');
      expect(response.body.data.lowStockProducts).toBeGreaterThan(0); // 应该检测到低库存产品
    });

    it('should deny access for regular users', async () => {
      await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should deny access without authentication', async () => {
      await request(app).get('/api/admin/stats').expect(401);
    });
  });

  describe('GET /api/admin/order-trends', () => {
    it('should return order trends data', async () => {
      const response = await request(app)
        .get('/api/admin/order-trends?days=7')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should use default days parameter', async () => {
      const response = await request(app)
        .get('/api/admin/order-trends')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/admin/popular-products', () => {
    it('should return popular products data', async () => {
      const response = await request(app)
        .get('/api/admin/popular-products?limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/admin/user-growth', () => {
    it('should return user growth data', async () => {
      const response = await request(app)
        .get('/api/admin/user-growth?days=30')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/admin/users', () => {
    it('should return paginated user list for admin', async () => {
      const response = await request(app)
        .get('/api/admin/users?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.pagination).toHaveProperty('page');
      expect(response.body.data.pagination).toHaveProperty('total');
    });

    it('should deny access for regular users', async () => {
      await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /api/admin/users/:id', () => {
    it('should return user details for admin', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('username');
      expect(response.body.data).toHaveProperty('totalSpent');
      expect(response.body.data).toHaveProperty('orders');
      expect(response.body.data.id).toBe(testUserId);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/admin/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/admin/users/:id', () => {
    it('should update user information for admin', async () => {
      const updateData = {
        username: 'updateduser',
        role: 'ADMIN',
        isActive: false,
      };

      const response = await request(app)
        .put(`/api/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(updateData.username);
      expect(response.body.data.role).toBe(updateData.role);
      expect(response.body.data.isActive).toBe(updateData.isActive);
    });

    it('should return 409 for duplicate username', async () => {
      const updateData = {
        username: 'admin', // 已存在的用户名
      };

      await request(app)
        .put(`/api/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(409);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .put('/api/admin/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: 'newname' })
        .expect(404);
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    it('should require SUPER_ADMIN role', async () => {
      await request(app)
        .delete(`/api/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`) // ADMIN role, not SUPER_ADMIN
        .expect(403);
    });

    it('should deny access for regular users', async () => {
      await request(app)
        .delete(`/api/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});
