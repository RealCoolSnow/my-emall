/**
 * 订单API测试
 * 测试订单相关的API功能
 */

import request from 'supertest';
import { app } from '../index';
import { db } from '../models/database';
import { generateAccessToken } from '../utils/auth';

describe('Orders API', () => {
  let userToken: string;
  let otherUserToken: string;
  let userId: string;
  let otherUserId: string;
  let productId: string;
  let orderId: string;

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

    // 创建另一个测试用户
    const otherUser = await db.prisma.user.create({
      data: {
        email: 'other@test.com',
        username: 'otheruser',
        password: 'hashedpassword',
        role: 'CUSTOMER',
      },
    });
    otherUserId = otherUser.id;

    // 生成测试令牌
    userToken = generateAccessToken({
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role,
    });

    otherUserToken = generateAccessToken({
      userId: otherUser.id,
      email: otherUser.email,
      role: otherUser.role,
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

  describe('POST /api/orders', () => {
    it('should create new order', async () => {
      const orderData = {
        items: [
          {
            productId: productId,
            quantity: 1,
          },
        ],
        shippingAddress: {
          street: '测试街道123号',
          city: '测试城市',
          state: '测试省份',
          zipCode: '100000',
          country: '中国',
        },
        paymentMethod: 'alipay',
        notes: '测试订单',
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('totalAmount');
      expect(response.body.data).toHaveProperty('orderItems');
      expect(response.body.data.userId).toBe(userId);
      expect(response.body.data.status).toBe('PENDING');
      expect(response.body.data.paymentStatus).toBe('PENDING');
      expect(response.body.data.orderItems).toHaveLength(1);
    });

    it('should calculate total amount correctly', async () => {
      const orderData = {
        items: [
          {
            productId: productId,
            quantity: 3,
          },
        ],
        shippingAddress: {
          street: '测试街道123号',
          city: '测试城市',
          state: '测试省份',
          zipCode: '100000',
          country: '中国',
        },
        paymentMethod: 'alipay',
        notes: '测试订单',
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.data.totalAmount).toBe(299.97); // 3 * 99.99
    });

    it('should require authentication', async () => {
      const orderData = {
        items: [
          {
            productId: productId,
            quantity: 1,
          },
        ],
        shippingAddress: {
          street: '测试街道123号',
          city: '测试城市',
          state: '测试省份',
          zipCode: '100000',
          country: '中国',
        },
        paymentMethod: 'alipay',
        notes: '测试订单',
      };

      await request(app).post('/api/orders').send(orderData).expect(401);
    });

    it('should validate required fields', async () => {
      const invalidOrderData = {
        items: [], // 空的商品列表
        shippingAddress: {
          street: '测试街道123号',
          city: '测试城市',
          state: '测试省份',
          zipCode: '100000',
          country: '中国',
        },
        paymentMethod: 'alipay',
      };

      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidOrderData)
        .expect(400);
    });

    it('should validate product existence', async () => {
      const orderData = {
        items: [
          {
            productId: 'non-existent-product',
            quantity: 1,
          },
        ],
        shippingAddress: {
          street: '测试街道123号',
          city: '测试城市',
          state: '测试省份',
          zipCode: '100000',
          country: '中国',
        },
        paymentMethod: 'alipay',
        notes: '测试订单',
      };

      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(404);
    });
  });

  describe('GET /api/orders', () => {
    it('should return user orders with pagination', async () => {
      const response = await request(app)
        .get('/api/orders?page=1&limit=10')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.pagination).toHaveProperty('page');
      expect(response.body.data.pagination).toHaveProperty('total');

      // 验证只返回当前用户的订单
      response.body.data.data.forEach((order: any) => {
        expect(order.userId).toBe(userId);
      });
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/orders?status=PENDING')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.data.forEach((order: any) => {
        expect(order.status).toBe('PENDING');
      });
    });

    it('should filter orders by payment status', async () => {
      const response = await request(app)
        .get('/api/orders?paymentStatus=PENDING')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.data.forEach((order: any) => {
        expect(order.paymentStatus).toBe('PENDING');
      });
    });

    it('should require authentication', async () => {
      await request(app).get('/api/orders').expect(401);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return order details for owner', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('orderItems');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.id).toBe(orderId);
      expect(response.body.data.userId).toBe(userId);
      expect(Array.isArray(response.body.data.orderItems)).toBe(true);
    });

    it('should deny access to other users orders', async () => {
      await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent order', async () => {
      await request(app)
        .get('/api/orders/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should require authentication', async () => {
      await request(app).get(`/api/orders/${orderId}`).expect(401);
    });
  });

  describe('PUT /api/orders/:id', () => {
    it('should update order status for owner', async () => {
      const updateData = {
        status: 'CANCELLED',
        shippingAddress: '更新的地址',
        notes: '订单已取消',
      };

      const response = await request(app)
        .put(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(updateData.status);
      expect(response.body.data.shippingAddress).toBe(
        updateData.shippingAddress
      );
      expect(response.body.data.notes).toBe(updateData.notes);
    });

    it('should deny access to other users orders', async () => {
      await request(app)
        .put(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ status: 'CANCELLED' })
        .expect(403);
    });

    it('should return 404 for non-existent order', async () => {
      await request(app)
        .put('/api/orders/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'CANCELLED' })
        .expect(404);
    });

    it('should require authentication', async () => {
      await request(app)
        .put(`/api/orders/${orderId}`)
        .send({ status: 'CANCELLED' })
        .expect(401);
    });

    it('should validate status values', async () => {
      const updateData = {
        status: 'INVALID_STATUS',
      };

      await request(app)
        .put(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(400);
    });
  });

  describe('DELETE /api/orders/:id', () => {
    let orderToDelete: string;

    beforeEach(async () => {
      // 创建一个用于删除的订单
      const order = await db.prisma.order.create({
        data: {
          userId: userId,
          totalAmount: 99.99,
          paymentStatus: 'PENDING',
          status: 'PENDING',
          shippingAddress: '测试地址',
          paymentMethod: 'alipay',
          orderItems: {
            create: [
              {
                productId: productId,
                quantity: 1,
                price: 99.99,
              },
            ],
          },
        },
      });
      orderToDelete = order.id;
    });

    it('should delete order for owner', async () => {
      const response = await request(app)
        .delete(`/api/orders/${orderToDelete}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // 验证订单已被删除
      const deletedOrder = await db.prisma.order.findUnique({
        where: { id: orderToDelete },
      });
      expect(deletedOrder).toBeNull();
    });

    it('should deny access to other users orders', async () => {
      await request(app)
        .delete(`/api/orders/${orderToDelete}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent order', async () => {
      await request(app)
        .delete('/api/orders/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should require authentication', async () => {
      await request(app).delete(`/api/orders/${orderToDelete}`).expect(401);
    });

    it('should not allow deletion of paid orders', async () => {
      // 更新订单为已支付状态
      await db.prisma.order.update({
        where: { id: orderToDelete },
        data: { paymentStatus: 'PAID' },
      });

      await request(app)
        .delete(`/api/orders/${orderToDelete}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });
  });
});
