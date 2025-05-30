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
    console.log('✅ 管理员账号已存在，跳过用户创建');
  } else {

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
  }

  // 创建普通用户
  const existingUsers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
  });

  if (existingUsers.length === 0) {
    const userPassword = await bcrypt.hash('user123', 10);

    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'zhang.wei@example.com',
          username: 'zhangwei',
          password: userPassword,
          role: 'CUSTOMER',
          isActive: true,
          profile: JSON.stringify({
            firstName: '张',
            lastName: '伟',
            phone: '13812345678',
            avatar: null,
          }),
        },
      }),
      prisma.user.create({
        data: {
          email: 'li.ming@example.com',
          username: 'liming',
          password: userPassword,
          role: 'CUSTOMER',
          isActive: true,
          profile: JSON.stringify({
            firstName: '李',
            lastName: '明',
            phone: '13987654321',
            avatar: null,
          }),
        },
      }),
      prisma.user.create({
        data: {
          email: 'wang.fang@example.com',
          username: 'wangfang',
          password: userPassword,
          role: 'CUSTOMER',
          isActive: true,
          profile: JSON.stringify({
            firstName: '王',
            lastName: '芳',
            phone: '13765432109',
            avatar: null,
          }),
        },
      }),
      prisma.user.create({
        data: {
          email: 'chen.jie@example.com',
          username: 'chenjie',
          password: userPassword,
          role: 'CUSTOMER',
          isActive: true,
          profile: JSON.stringify({
            firstName: '陈',
            lastName: '杰',
            phone: '13654321098',
            avatar: null,
          }),
        },
      }),
    ]);

    console.log('✅ 普通用户创建成功:');
    users.forEach(user => {
      console.log(`   用户名: ${user.username}, 邮箱: ${user.email}, 密码: user123`);
    });
  } else {
    console.log('✅ 普通用户已存在，跳过创建');
  }

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
        price: 7999.0,
        stock: 50,
        categoryId: categories[0].id,
        status: 'ACTIVE',
        imageUrls: JSON.stringify([
          'https://m.media-amazon.com/images/I/81CgtwSII3L._AC_SX679_.jpg',
          'https://mineo.jp/_mg/_uploads/files/099d9582bc590af1_iPhone15_black_front_380x600_rev01.png',
        ]),
      },
    }),
    prisma.product.create({
      data: {
        name: '经典白T恤',
        description: '100%纯棉，舒适透气，经典百搭',
        price: 99.0,
        stock: 200,
        categoryId: categories[1].id,
        status: 'ACTIVE',
        imageUrls: JSON.stringify([
          'https://ydot-official.com/cdn/shop/files/YS25-13_2_1024x1024.jpg',
        ]),
      },
    }),
    prisma.product.create({
      data: {
        name: '北欧风台灯',
        description: '简约设计，护眼LED光源',
        price: 299.0,
        stock: 30,
        categoryId: categories[2].id,
        status: 'ACTIVE',
        imageUrls: JSON.stringify([
          'https://www.nikki-tr.co.jp/shop/html/html/upload/save_image/02151530_58a3f58f7dc7e.jpg',
        ]),
      },
    }),
  ]);

  console.log('✅ 示例产品创建成功');

  // 创建一些示例优惠券
  const existingCoupons = await prisma.coupon.findMany();

  if (existingCoupons.length === 0) {
    await Promise.all([
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
          endDate: new Date('2026-12-31T23:59:59.999Z'), // 2026年12月31日过期
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
          endDate: new Date('2026-12-31T23:59:59.999Z'), // 2026年12月31日过期
          usageLimit: 500,
          usedCount: 0,
        },
      }),
      prisma.coupon.create({
        data: {
          code: 'FREESHIP',
          name: '免运费券',
          description: '满200免运费',
          type: 'FREE_SHIPPING',
          value: 0,
          minAmount: 200,
          isActive: true,
          startDate: new Date(),
          endDate: new Date('2026-12-31T23:59:59.999Z'), // 2026年12月31日过期
          usageLimit: 2000,
          usedCount: 0,
        },
      }),
      prisma.coupon.create({
        data: {
          code: 'SUMMER20',
          name: '夏季大促券',
          description: '夏季专享20%折扣，最高优惠100元',
          type: 'PERCENTAGE',
          value: 20,
          minAmount: 300,
          maxDiscount: 100,
          isActive: true,
          startDate: new Date(),
          endDate: new Date('2026-08-31T23:59:59.999Z'), // 2026年8月31日过期
          usageLimit: 800,
          usedCount: 0,
        },
      }),
    ]);

    console.log('✅ 示例优惠券创建成功:');
    console.log('   WELCOME10 - 新用户欢迎券 (10%折扣)');
    console.log('   SAVE50 - 满减券 (满500减50)');
    console.log('   FREESHIP - 免运费券 (满200免运费)');
    console.log('   SUMMER20 - 夏季大促券 (20%折扣)');
    console.log('   所有优惠券有效期至2026年');
  } else {
    console.log('✅ 优惠券已存在，跳过创建');
  }

  // 为每个用户分配优惠券
  const allUsers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
  });

  const allCoupons = await prisma.coupon.findMany({
    where: { isActive: true },
  });

  if (allUsers.length > 0 && allCoupons.length > 0) {
    console.log('🎫 开始为用户分配优惠券...');

    for (const user of allUsers) {
      // 检查用户是否已经有优惠券
      const existingUserCoupons = await prisma.userCoupon.findMany({
        where: { userId: user.id },
      });

      if (existingUserCoupons.length === 0) {
        // 为每个用户分配前3张优惠券
        const couponsToAssign = allCoupons.slice(0, 3);

        for (const coupon of couponsToAssign) {
          await prisma.userCoupon.create({
            data: {
              userId: user.id,
              couponId: coupon.id,
              isUsed: false,
              obtainedAt: new Date(),
            },
          });
        }

        console.log(`   ✅ 已为用户 ${user.username} 分配 ${couponsToAssign.length} 张优惠券`);
      }
    }

    console.log('🎫 用户优惠券分配完成！');
  }

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
