/**
 * 数据库连接和 Prisma 客户端配置
 * 提供统一的数据库访问接口
 */

import { PrismaClient } from '@prisma/client';

/**
 * Prisma 客户端实例
 * 使用单例模式确保整个应用只有一个数据库连接
 */
class DatabaseService {
  private static instance: DatabaseService;
  public prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
      errorFormat: 'pretty',
    });

    // 连接数据库
    this.connect();
  }

  /**
   * 获取数据库服务实例
   * @returns DatabaseService 实例
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * 连接数据库
   */
  private async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }

  /**
   * 断开数据库连接
   */
  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
    }
  }

  /**
   * 健康检查
   * @returns Promise<boolean> 数据库是否健康
   */
  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }

  /**
   * 执行事务
   * @param fn 事务函数
   * @returns Promise<T> 事务结果
   */
  public async transaction<T>(
    fn: (
      prisma: Omit<
        PrismaClient,
        | '$connect'
        | '$disconnect'
        | '$on'
        | '$transaction'
        | '$use'
        | '$extends'
      >
    ) => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(fn);
  }

  /**
   * 清理数据库（仅用于测试）
   */
  public async cleanup(): Promise<void> {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Cleanup is only allowed in test environment');
    }

    try {
      // 禁用外键约束
      await this.prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;

      // 按照依赖关系的逆序删除数据
      const deleteOrder = [
        'payments',
        'order_coupons',
        'order_items',
        'orders',
        'cart_items',
        'reviews',
        'products',
        'categories',
        'coupons',
        'users',
      ];

      for (const tableName of deleteOrder) {
        try {
          await this.prisma.$executeRawUnsafe(`DELETE FROM "${tableName}";`);
        } catch (error) {
          // 忽略表不存在的错误
          console.warn(
            `Warning: Could not delete from table ${tableName}:`,
            error
          );
        }
      }

      // 重新启用外键约束
      await this.prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
    } catch (error) {
      console.warn('Warning: Could not cleanup database:', error);
      // 确保外键约束重新启用
      try {
        await this.prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
      } catch (e) {
        // 忽略错误
      }
    }
  }
}

// 导出数据库服务实例
export const db = DatabaseService.getInstance();

// 导出 Prisma 客户端类型
export type { PrismaClient } from '@prisma/client';

// 优雅关闭处理
process.on('SIGINT', async () => {
  console.log('\n🔄 Gracefully shutting down...');
  await db.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Gracefully shutting down...');
  await db.disconnect();
  process.exit(0);
});

// 未捕获异常处理
process.on('uncaughtException', async (error) => {
  console.error('❌ Uncaught Exception:', error);
  await db.disconnect();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  await db.disconnect();
  process.exit(1);
});

export default db;
