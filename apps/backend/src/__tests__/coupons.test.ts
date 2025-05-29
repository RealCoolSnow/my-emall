/**
 * 优惠券API测试
 * 测试优惠券相关的API功能
 */

import request from 'supertest';
import { app } from '../index';
import { db } from '../models/database';
import { generateAccessToken } from '../utils/auth';

describe('Coupons API', () => {
  let userToken: string;
  let adminToken: string;
  let userId: string;
  let couponId: string;

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
    userId = testUser.id;

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
    userToken = generateAccessToken({
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role,
    });

    adminToken = generateAccessToken({
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });

    // 创建测试优惠券
    const coupon = await db.prisma.coupon.create({
      data: {
        code: 'TEST10',
        name: '测试优惠券',
        description: '测试用优惠券',
        type: 'PERCENTAGE',
        value: 10,
        minAmount: 100,
        maxDiscount: 50,
        usageLimit: 100,
        isActive: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      },
    });
    couponId = coupon.id;
  });

  afterAll(async () => {
    await db.cleanup();
    await db.disconnect();
  });

  describe('GET /api/coupons', () => {
    it('should return paginated coupon list', async () => {
      const response = await request(app)
        .get('/api/coupons?page=1&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.pagination).toHaveProperty('page');
      expect(response.body.data.pagination).toHaveProperty('total');
    });

    it('should filter active coupons', async () => {
      const response = await request(app)
        .get('/api/coupons?isActive=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.data.forEach((coupon: any) => {
        expect(coupon.isActive).toBe(true);
      });
    });

    it('should filter by coupon type', async () => {
      const response = await request(app)
        .get('/api/coupons?type=PERCENTAGE')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.data.forEach((coupon: any) => {
        expect(coupon.type).toBe('PERCENTAGE');
      });
    });
  });

  describe('GET /api/coupons/:id', () => {
    it('should return coupon details', async () => {
      const response = await request(app)
        .get(`/api/coupons/${couponId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('code');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('type');
      expect(response.body.data.id).toBe(couponId);
    });

    it('should return 404 for non-existent coupon', async () => {
      await request(app).get('/api/coupons/non-existent-id').expect(404);
    });
  });

  describe('POST /api/coupons', () => {
    it('should create new coupon for admin', async () => {
      const couponData = {
        code: 'NEWCOUPON20',
        name: '新优惠券',
        description: '新创建的优惠券',
        type: 'FIXED_AMOUNT',
        value: 20,
        minAmount: 200,
        maxDiscount: 100,
        usageLimit: 50,
        isActive: true,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      const response = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(couponData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.code).toBe(couponData.code);
      expect(response.body.data.name).toBe(couponData.name);
      expect(response.body.data.type).toBe(couponData.type);
    });

    it('should return 409 for duplicate coupon code', async () => {
      const couponData = {
        code: 'TEST10', // 已存在的优惠券代码
        name: '重复优惠券',
        type: 'PERCENTAGE',
        value: 15,
        isActive: true,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(couponData)
        .expect(409);
    });

    it('should deny access for regular users', async () => {
      const couponData = {
        code: 'USERCOUPON',
        name: '用户优惠券',
        type: 'PERCENTAGE',
        value: 10,
        isActive: true,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${userToken}`)
        .send(couponData)
        .expect(403);
    });

    it('should require authentication', async () => {
      const couponData = {
        code: 'NOCOUPON',
        name: '无认证优惠券',
        type: 'PERCENTAGE',
        value: 10,
        isActive: true,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      await request(app).post('/api/coupons').send(couponData).expect(401);
    });

    it('should validate required fields', async () => {
      const invalidCouponData = {
        code: 'INVALID',
        // 缺少必需字段
      };

      await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidCouponData)
        .expect(400);
    });
  });

  describe('PUT /api/coupons/:id', () => {
    it('should update coupon for admin', async () => {
      const updateData = {
        name: '更新的优惠券名称',
        description: '更新的描述',
        value: 15,
        isActive: false,
      };

      const response = await request(app)
        .put(`/api/coupons/${couponId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.value).toBe(updateData.value);
      expect(response.body.data.isActive).toBe(updateData.isActive);
    });

    it('should return 404 for non-existent coupon', async () => {
      await request(app)
        .put('/api/coupons/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '不存在的优惠券' })
        .expect(404);
    });

    it('should deny access for regular users', async () => {
      await request(app)
        .put(`/api/coupons/${couponId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: '用户更新' })
        .expect(403);
    });
  });

  describe('DELETE /api/coupons/:id', () => {
    it('should delete coupon for admin', async () => {
      // 创建一个用于删除的优惠券
      const couponToDelete = await db.prisma.coupon.create({
        data: {
          code: 'DELETE_ME',
          name: '待删除优惠券',
          type: 'PERCENTAGE',
          value: 10,
          isActive: true,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
        },
      });

      const response = await request(app)
        .delete(`/api/coupons/${couponToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // 验证优惠券已被删除
      const deletedCoupon = await db.prisma.coupon.findUnique({
        where: { id: couponToDelete.id },
      });
      expect(deletedCoupon).toBeNull();
    });

    it('should return 404 for non-existent coupon', async () => {
      await request(app)
        .delete('/api/coupons/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should deny access for regular users', async () => {
      await request(app)
        .delete(`/api/coupons/${couponId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('POST /api/coupons/validate', () => {
    it('should validate coupon code', async () => {
      const validationData = {
        code: 'TEST10',
        subtotal: 150,
      };

      const response = await request(app)
        .post('/api/coupons/validate')
        .send(validationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('isValid');
      expect(response.body.data).toHaveProperty('coupon');
      expect(response.body.data.isValid).toBe(true);
      expect(response.body.data.coupon.code).toBe('TEST10');
    });

    it('should return invalid for non-existent coupon', async () => {
      const validationData = {
        code: 'NONEXISTENT',
        subtotal: 150,
      };

      const response = await request(app)
        .post('/api/coupons/validate')
        .send(validationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(false);
      expect(response.body.data.reason).toBe('优惠券不存在');
    });

    it('should return invalid for insufficient amount', async () => {
      const validationData = {
        code: 'TEST10',
        subtotal: 50, // 小于最低消费金额100
      };

      const response = await request(app)
        .post('/api/coupons/validate')
        .send(validationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(false);
      expect(response.body.data.reason).toContain('最低消费');
    });
  });

  describe('POST /api/coupons/apply', () => {
    it('should apply coupons and calculate discount', async () => {
      const applyData = {
        codes: ['TEST10'],
        subtotal: 200,
        items: [
          {
            productId: 'product1',
            quantity: 2,
            price: 100,
          },
        ],
      };

      const response = await request(app)
        .post('/api/coupons/apply')
        .send(applyData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('originalAmount');
      expect(response.body.data).toHaveProperty('totalDiscount');
      expect(response.body.data).toHaveProperty('finalAmount');
      expect(response.body.data).toHaveProperty('appliedCoupons');
      expect(response.body.data.originalAmount).toBe(200);
      expect(response.body.data.totalDiscount).toBeGreaterThan(0);
      expect(response.body.data.finalAmount).toBeLessThan(200);
    });

    it('should handle multiple coupons', async () => {
      // 创建另一个优惠券
      await db.prisma.coupon.create({
        data: {
          code: 'EXTRA5',
          name: '额外优惠券',
          type: 'FIXED_AMOUNT',
          value: 5,
          isActive: true,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
        },
      });

      const applyData = {
        codes: ['TEST10', 'EXTRA5'],
        subtotal: 200,
        items: [
          {
            productId: 'product1',
            quantity: 2,
            price: 100,
          },
        ],
      };

      const response = await request(app)
        .post('/api/coupons/apply')
        .send(applyData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appliedCoupons.length).toBeGreaterThan(0);
    });

    it('should validate required fields', async () => {
      const invalidApplyData = {
        codes: ['TEST10'],
        // 缺少 subtotal 和 items
      };

      await request(app)
        .post('/api/coupons/apply')
        .send(invalidApplyData)
        .expect(400);
    });
  });
});
