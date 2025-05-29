/**
 * Jest 测试设置文件
 * 配置测试环境和全局设置
 */

import { db } from '../models/database';

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-jwt-secret-key';

// 全局测试设置
beforeAll(async () => {
  // 确保数据库连接
  await db.prisma.$connect();

  // 推送数据库模式（创建表）
  try {
    await db.prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;

    // 删除所有表
    const tables = await db.prisma.$queryRaw<Array<{ name: string }>>`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations';
    `;

    for (const table of tables) {
      await db.prisma.$executeRawUnsafe(
        `DROP TABLE IF EXISTS "${table.name}";`
      );
    }

    await db.prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
  } catch (error) {
    console.warn('Warning: Could not clean database tables:', error);
  }
});

// 全局测试清理
afterAll(async () => {
  // 清理测试数据
  try {
    await db.cleanup();
  } catch (error) {
    console.warn('Warning: Could not cleanup test data:', error);
  }

  // 断开数据库连接
  await db.disconnect();
});

// 每个测试前的设置
beforeEach(async () => {
  // 可以在这里添加每个测试前的设置
});

// 每个测试后的清理
afterEach(async () => {
  // 可以在这里添加每个测试后的清理
});

// 全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// 增加测试超时时间
jest.setTimeout(30000);

// 模拟控制台输出（可选）
if (process.env.SILENT_TESTS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}
