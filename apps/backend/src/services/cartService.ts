/**
 * 购物车服务层
 * 处理购物车相关的业务逻辑，包括添加、更新、删除购物车项等
 */

import { db } from '../models/database';
import { AddToCartRequest, UpdateCartItemRequest } from '../types';
import { NotFoundError, ValidationError } from '../middleware/errorHandler';

/**
 * 购物车服务类
 */
export class CartService {
  /**
   * 获取用户购物车列表
   * @param userId 用户ID
   * @returns Promise<CartItem[]> 购物车项列表
   */
  async getCartItems(userId: string) {
    const cartItems = await db.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return cartItems.map(this.formatCartItem);
  }

  /**
   * 添加商品到购物车
   * @param userId 用户ID
   * @param data 添加到购物车的数据
   * @returns Promise<CartItem> 购物车项
   */
  async addToCart(userId: string, data: AddToCartRequest) {
    // 验证商品是否存在且可购买
    const product = await db.prisma.product.findUnique({
      where: { id: data.productId },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundError('商品');
    }

    if (product.status !== 'ACTIVE') {
      throw new ValidationError('商品已下架，无法添加到购物车');
    }

    if (product.stock < data.quantity) {
      throw new ValidationError(`库存不足，当前库存：${product.stock}`);
    }

    // 检查购物车中是否已存在该商品
    const existingCartItem = await db.prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: data.productId,
        },
      },
    });

    let cartItem;
    if (existingCartItem) {
      // 更新数量
      const newQuantity = existingCartItem.quantity + data.quantity;
      
      if (newQuantity > product.stock) {
        throw new ValidationError(`库存不足，当前库存：${product.stock}，购物车中已有：${existingCartItem.quantity}`);
      }

      cartItem = await db.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      });
    } else {
      // 创建新的购物车项
      cartItem = await db.prisma.cartItem.create({
        data: {
          userId,
          productId: data.productId,
          quantity: data.quantity,
        },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      });
    }

    return this.formatCartItem(cartItem);
  }

  /**
   * 更新购物车商品数量
   * @param userId 用户ID
   * @param productId 商品ID
   * @param data 更新数据
   * @returns Promise<CartItem> 更新后的购物车项
   */
  async updateCartItem(userId: string, productId: string, data: UpdateCartItemRequest) {
    // 检查购物车项是否存在
    const existingCartItem = await db.prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      include: {
        product: true,
      },
    });

    if (!existingCartItem) {
      throw new NotFoundError('购物车项');
    }

    // 验证库存
    if (data.quantity > existingCartItem.product.stock) {
      throw new ValidationError(`库存不足，当前库存：${existingCartItem.product.stock}`);
    }

    // 更新数量
    const cartItem = await db.prisma.cartItem.update({
      where: { id: existingCartItem.id },
      data: { quantity: data.quantity },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    return this.formatCartItem(cartItem);
  }

  /**
   * 从购物车移除商品
   * @param userId 用户ID
   * @param productId 商品ID
   */
  async removeFromCart(userId: string, productId: string) {
    const cartItem = await db.prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundError('购物车项');
    }

    await db.prisma.cartItem.delete({
      where: { id: cartItem.id },
    });
  }

  /**
   * 清空用户购物车
   * @param userId 用户ID
   */
  async clearCart(userId: string) {
    await db.prisma.cartItem.deleteMany({
      where: { userId },
    });
  }

  /**
   * 获取购物车统计信息
   * @param userId 用户ID
   * @returns Promise<{itemCount: number, totalAmount: number}> 统计信息
   */
  async getCartSummary(userId: string) {
    const cartItems = await db.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
    });

    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    return {
      itemCount,
      totalAmount,
    };
  }

  /**
   * 格式化购物车项数据
   * @param cartItem 原始购物车项数据
   * @returns 格式化后的购物车项
   */
  private formatCartItem(cartItem: any) {
    return {
      id: cartItem.id,
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      createdAt: cartItem.createdAt,
      updatedAt: cartItem.updatedAt,
      product: {
        id: cartItem.product.id,
        name: cartItem.product.name,
        description: cartItem.product.description,
        price: cartItem.product.price,
        stock: cartItem.product.stock,
        status: cartItem.product.status,
        imageUrls: cartItem.product.imageUrls 
          ? JSON.parse(cartItem.product.imageUrls) 
          : [],
        category: cartItem.product.category,
        attributes: cartItem.product.attributes 
          ? JSON.parse(cartItem.product.attributes) 
          : null,
        createdAt: cartItem.product.createdAt,
        updatedAt: cartItem.product.updatedAt,
      },
    };
  }
}
