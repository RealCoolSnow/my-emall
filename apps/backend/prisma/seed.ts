import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始数据库种子数据初始化...');

  // 检查是否已存在管理员账号
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (existingAdmin) {
    console.log('✅ 管理员账号已存在，跳过创建');
    return;
  }

  // 创建默认管理员账号
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@emall.com',
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      profile: JSON.stringify({
        firstName: '管理员',
        lastName: '系统',
        phone: '13800138000',
        avatar: null,
      }),
    },
  });

  console.log('✅ 默认管理员账号创建成功:');
  console.log('   邮箱: admin@emall.com');
  console.log('   用户名: admin');
  console.log('   密码: admin123');
  console.log('   角色: ADMIN');

  // 创建一些示例分类
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: '电子产品',
        description: '手机、电脑、数码产品等',
      },
    }),
    prisma.category.create({
      data: {
        name: '服装鞋帽',
        description: '男装、女装、鞋子、配饰等',
      },
    }),
    prisma.category.create({
      data: {
        name: '家居用品',
        description: '家具、装饰、生活用品等',
      },
    }),
  ]);

  console.log('✅ 示例分类创建成功');

  // 创建一些示例产品
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'iPhone 15 Pro',
        description: '最新款苹果手机，配备A17 Pro芯片',
        price: 7999.00,
        stock: 50,
        categoryId: categories[0].id,
        status: 'ACTIVE',
        imageUrls: JSON.stringify([
          'https://example.com/iphone15pro-1.jpg',
          'https://example.com/iphone15pro-2.jpg',
        ]),
      },
    }),
    prisma.product.create({
      data: {
        name: '经典白T恤',
        description: '100%纯棉，舒适透气，经典百搭',
        price: 99.00,
        stock: 200,
        categoryId: categories[1].id,
        status: 'ACTIVE',
        imageUrls: JSON.stringify([
          'https://example.com/white-tshirt-1.jpg',
        ]),
      },
    }),
    prisma.product.create({
      data: {
        name: '北欧风台灯',
        description: '简约设计，护眼LED光源',
        price: 299.00,
        stock: 30,
        categoryId: categories[2].id,
        status: 'ACTIVE',
        imageUrls: JSON.stringify([
          'https://example.com/nordic-lamp-1.jpg',
        ]),
      },
    }),
  ]);

  console.log('✅ 示例产品创建成功');

  // 创建一些示例优惠券
  const coupons = await Promise.all([
    prisma.coupon.create({
      data: {
        code: 'WELCOME10',
        name: '新用户欢迎券',
        description: '新用户专享10%折扣',
        type: 'PERCENTAGE',
        value: 10,
        minAmount: 100,
        maxDiscount: 50,
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后过期
        usageLimit: 1000,
        usedCount: 0,
      },
    }),
    prisma.coupon.create({
      data: {
        code: 'SAVE50',
        name: '满减券',
        description: '满500减50元',
        type: 'FIXED_AMOUNT',
        value: 50,
        minAmount: 500,
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60天后过期
        usageLimit: 500,
        usedCount: 0,
      },
    }),
  ]);

  console.log('✅ 示例优惠券创建成功');

  console.log('🎉 数据库种子数据初始化完成！');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
