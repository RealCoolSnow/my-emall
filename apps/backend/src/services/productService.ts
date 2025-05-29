/**
 * 产品服务层
 * 处理产品相关的业务逻辑
 */

import { db } from '../models/database';
import { 
  CreateProductRequest, 
  UpdateProductRequest, 
  ProductQuery, 
  PaginatedResponse 
} from '../types';
import { NotFoundError, ValidationError } from '../middleware/errorHandler';

/**
 * 产品服务类
 */
export class ProductService {
  /**
   * 创建产品
   * @param data 产品数据
   * @returns Promise<Product> 创建的产品
   */
  async createProduct(data: CreateProductRequest) {
    // 验证分类是否存在
    const category = await db.prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new ValidationError('指定的分类不存在');
    }

    // 创建产品
    const product = await db.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        categoryId: data.categoryId,
        imageUrls: data.imageUrls ? JSON.stringify(data.imageUrls) : null,
        attributes: data.attributes ? JSON.stringify(data.attributes) : null,
      },
      include: {
        category: true,
      },
    });

    return this.formatProduct(product);
  }

  /**
   * 获取产品列表
   * @param query 查询参数
   * @returns Promise<PaginatedResponse> 分页产品列表
   */
  async getProducts(query: ProductQuery): Promise<PaginatedResponse> {
    const {
      page = 1,
      limit = 10,
      categoryId,
      status,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // 构建查询条件
    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    // 计算偏移量
    const skip = (page - 1) * limit;

    // 执行查询
    const [products, total] = await Promise.all([
      db.prisma.product.findMany({
        where,
        include: {
          category: true,
          _count: {
            select: {
              reviews: true,
              orderItems: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      db.prisma.product.count({ where }),
    ]);

    // 格式化产品数据
    const formattedProducts = products.map(product => this.formatProduct(product));

    return {
      data: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * 根据 ID 获取产品
   * @param id 产品 ID
   * @returns Promise<Product> 产品信息
   */
  async getProductById(id: string) {
    const product = await db.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            reviews: true,
            orderItems: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError('产品');
    }

    return this.formatProduct(product);
  }

  /**
   * 更新产品
   * @param id 产品 ID
   * @param data 更新数据
   * @returns Promise<Product> 更新后的产品
   */
  async updateProduct(id: string, data: UpdateProductRequest) {
    // 检查产品是否存在
    const existingProduct = await db.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundError('产品');
    }

    // 如果更新分类，验证分类是否存在
    if (data.categoryId) {
      const category = await db.prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new ValidationError('指定的分类不存在');
      }
    }

    // 更新产品
    const product = await db.prisma.product.update({
      where: { id },
      data: {
        ...data,
        imageUrls: data.imageUrls ? JSON.stringify(data.imageUrls) : undefined,
        attributes: data.attributes ? JSON.stringify(data.attributes) : undefined,
      },
      include: {
        category: true,
      },
    });

    return this.formatProduct(product);
  }

  /**
   * 删除产品
   * @param id 产品 ID
   * @returns Promise<void>
   */
  async deleteProduct(id: string): Promise<void> {
    // 检查产品是否存在
    const product = await db.prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError('产品');
    }

    // 检查是否有关联的订单项
    if (product._count.orderItems > 0) {
      throw new ValidationError('无法删除已有订单的产品，请先将产品状态设为停用');
    }

    // 删除产品
    await db.prisma.product.delete({
      where: { id },
    });
  }

  /**
   * 更新产品库存
   * @param id 产品 ID
   * @param quantity 库存变化量（正数增加，负数减少）
   * @returns Promise<Product> 更新后的产品
   */
  async updateStock(id: string, quantity: number) {
    const product = await db.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundError('产品');
    }

    const newStock = product.stock + quantity;
    if (newStock < 0) {
      throw new ValidationError('库存不足');
    }

    const updatedProduct = await db.prisma.product.update({
      where: { id },
      data: {
        stock: newStock,
        status: newStock === 0 ? 'OUT_OF_STOCK' : product.status,
      },
      include: {
        category: true,
      },
    });

    return this.formatProduct(updatedProduct);
  }

  /**
   * 获取热门产品
   * @param limit 数量限制
   * @returns Promise<Product[]> 热门产品列表
   */
  async getPopularProducts(limit: number = 10) {
    const products = await db.prisma.product.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        category: true,
        _count: {
          select: {
            orderItems: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        orderItems: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return products.map(product => this.formatProduct(product));
  }

  /**
   * 格式化产品数据
   * @param product 原始产品数据
   * @returns 格式化后的产品数据
   */
  private formatProduct(product: any) {
    return {
      ...product,
      imageUrls: product.imageUrls ? JSON.parse(product.imageUrls) : [],
      attributes: product.attributes ? JSON.parse(product.attributes) : {},
      averageRating: product.reviews?.length > 0 
        ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
        : 0,
    };
  }
}
