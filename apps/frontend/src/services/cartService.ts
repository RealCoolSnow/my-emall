import api, { handleApiResponse } from '../lib/api';
import { CartItem } from '../types';

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

class CartService {
  /**
   * 获取购物车列表
   */
  async getCartItems(): Promise<CartItem[]> {
    const response = await api.get('/cart');
    return handleApiResponse<CartItem[]>(response);
  }

  /**
   * 添加商品到购物车
   */
  async addToCart(data: AddToCartRequest): Promise<CartItem> {
    const response = await api.post('/cart', data);
    return handleApiResponse<CartItem>(response);
  }

  /**
   * 更新购物车商品数量
   */
  async updateCartItem(productId: string, data: UpdateCartItemRequest): Promise<CartItem> {
    const response = await api.put(`/cart/${productId}`, data);
    return handleApiResponse<CartItem>(response);
  }

  /**
   * 从购物车移除商品
   */
  async removeFromCart(productId: string): Promise<void> {
    const response = await api.delete(`/cart/${productId}`);
    return handleApiResponse(response);
  }

  /**
   * 清空购物车
   */
  async clearCart(): Promise<void> {
    const response = await api.delete('/cart');
    return handleApiResponse(response);
  }

  /**
   * 获取购物车统计信息
   */
  async getCartSummary(): Promise<{
    itemCount: number;
    totalAmount: number;
  }> {
    const response = await api.get('/cart/summary');
    return handleApiResponse(response);
  }
}

export const cartService = new CartService();
export default cartService;
