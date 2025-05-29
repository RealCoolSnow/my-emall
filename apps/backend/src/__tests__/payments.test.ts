/**
 * 支付API测试
 * 测试支付相关的API功能
 */

import request from 'supertest';
import { app } from '../index';
import { db } from '../models/database';
import { generateAccessToken } from '../utils/auth';

describe('Payments API', () => {
  let userToken: string;
  let userId: string;
  let orderId: string;
  let productId: string;

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

    // 生成测试令牌
    userToken = generateAccessToken({
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role,
    });

    // 创建测试分类
    const category = await db.prisma.category.create({
      data: {
        name: '测试分类',
        description: '测试分类描述',
      },
    });

    // 创建测试产品
    const product = await db.prisma.product.create({
      data: {
        name: '测试产品',
        description: '测试产品描述',
        price: 99.99,
        stock: 100,
        categoryId: category.id,
        status: 'ACTIVE',
      },
    });
    productId = product.id;

    // 创建测试订单
    const order = await db.prisma.order.create({
      data: {
        userId: userId,
        totalAmount: 199.98,
        paymentStatus: 'PENDING',
        status: 'PENDING',
        shippingAddress: '测试地址',
        paymentMethod: 'alipay',
        orderItems: {
          create: [
            {
              productId: productId,
              quantity: 2,
              price: 99.99,
            },
          ],
        },
      },
    });
    orderId = order.id;
  });

  afterAll(async () => {
    await db.cleanup();
    await db.disconnect();
  });

  // 辅助函数：创建测试订单
  const createTestOrder = async (amount: number, status = 'PENDING') => {
    return await db.prisma.order.create({
      data: {
        userId: userId,
        totalAmount: amount,
        paymentStatus: status,
        status: 'PENDING',
        shippingAddress: '测试地址',
        paymentMethod: 'alipay',
        orderItems: {
          create: [
            {
              productId: productId,
              quantity: 1,
              price: amount,
            },
          ],
        },
      },
    });
  };

  describe('POST /api/payments/process', () => {
    it('should process payment successfully', async () => {
      const paymentData = {
        orderId: orderId,
        paymentMethod: 'alipay',
        amount: 199.98,
        mockResult: 'success', // 确保测试成功
      };

      const response = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('payment');
      expect(response.body.data).toHaveProperty('order');
      expect(response.body.data.payment.status).toBe('SUCCESS');
      expect(response.body.data.order.paymentStatus).toBe('PAID');
      expect(response.body.data.order.status).toBe('CONFIRMED');
    });

    it('should return 404 for non-existent order', async () => {
      const paymentData = {
        orderId: 'non-existent-order',
        paymentMethod: 'alipay',
        amount: 199.98,
      };

      await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData)
        .expect(404);
    });

    it('should return 400 for already paid order', async () => {
      const paymentData = {
        orderId: orderId,
        paymentMethod: 'wechat',
        amount: 199.98,
      };

      await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData)
        .expect(400);
    });

    it('should return 400 for amount mismatch', async () => {
      // 创建新订单用于测试
      const newOrder = await createTestOrder(99.99);

      const paymentData = {
        orderId: newOrder.id,
        paymentMethod: 'alipay',
        amount: 199.98, // 错误的金额
      };

      await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData)
        .expect(400);
    });

    it('should require authentication', async () => {
      const paymentData = {
        orderId: orderId,
        paymentMethod: 'alipay',
        amount: 199.98,
      };

      await request(app)
        .post('/api/payments/process')
        .send(paymentData)
        .expect(401);
    });

    it('should validate required fields', async () => {
      const invalidPaymentData = {
        orderId: orderId,
        // 缺少 paymentMethod 和 amount
      };

      await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidPaymentData)
        .expect(400);
    });

    it('should validate payment method', async () => {
      // 创建新订单用于测试
      const newOrder = await createTestOrder(99.99);

      const paymentData = {
        orderId: newOrder.id,
        paymentMethod: 'INVALID_METHOD',
        amount: 99.99,
      };

      await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData)
        .expect(400);
    });
  });

  describe('GET /api/payments/order/:orderId', () => {
    it('should return payment records for order', async () => {
      const response = await request(app)
        .get(`/api/payments/order/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`);

      if (response.status !== 200) {
        console.log('Error response:', response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('orderId');
      expect(response.body.data[0]).toHaveProperty('amount');
      expect(response.body.data[0]).toHaveProperty('method');
      expect(response.body.data[0]).toHaveProperty('status');
    });

    it('should return empty array for order without payments', async () => {
      // 创建没有支付记录的订单
      const newOrder = await createTestOrder(99.99);

      const response = await request(app)
        .get(`/api/payments/order/${newOrder.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('should require authentication', async () => {
      await request(app).get(`/api/payments/order/${orderId}`).expect(401);
    });
  });

  describe('POST /api/payments/refund', () => {
    it('should process refund successfully', async () => {
      // 首先创建一个已支付的订单
      const paidOrder = await createTestOrder(199.98, 'PAID');

      const refundData = {
        orderId: paidOrder.id,
        amount: 199.98,
        reason: '用户申请退款',
      };

      const response = await request(app)
        .post('/api/payments/refund')
        .set('Authorization', `Bearer ${userToken}`)
        .send(refundData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('orderId');
      expect(response.body.data.amount).toBe(-199.98); // 负数表示退款
      expect(response.body.data.method).toBe('refund');
      expect(response.body.data.status).toBe('SUCCESS');
    });

    it('should return 404 for non-existent order', async () => {
      const refundData = {
        orderId: 'non-existent-order',
        amount: 199.98,
        reason: '测试退款',
      };

      await request(app)
        .post('/api/payments/refund')
        .set('Authorization', `Bearer ${userToken}`)
        .send(refundData)
        .expect(404);
    });

    it('should return 404 for unpaid order', async () => {
      // 创建一个未支付的订单
      const unpaidOrder = await createTestOrder(199.98, 'PENDING');

      const refundData = {
        orderId: unpaidOrder.id,
        amount: 199.98,
        reason: '测试退款',
      };

      await request(app)
        .post('/api/payments/refund')
        .set('Authorization', `Bearer ${userToken}`)
        .send(refundData)
        .expect(404);
    });

    it('should require authentication', async () => {
      const paidOrder = await createTestOrder(199.98, 'PAID');

      const refundData = {
        orderId: paidOrder.id,
        amount: 199.98,
        reason: '测试退款',
      };

      await request(app)
        .post('/api/payments/refund')
        .send(refundData)
        .expect(401);
    });

    it('should validate required fields', async () => {
      const paidOrder = await createTestOrder(199.98, 'PAID');

      const invalidRefundData = {
        orderId: paidOrder.id,
        // 缺少 amount
      };

      await request(app)
        .post('/api/payments/refund')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidRefundData)
        .expect(400);
    });
  });
});
