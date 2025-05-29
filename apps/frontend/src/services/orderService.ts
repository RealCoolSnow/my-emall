import api, {
  handleApiResponse,
  handlePaginatedResponse,
  FrontendPaginatedResponse,
} from '../lib/api';
import { Order } from 'shared/types';

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  couponCodes?: string[];
  notes?: string;
}

export interface OrderQuery {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'totalAmount';
  sortOrder?: 'asc' | 'desc';
}

class OrderService {
  /**
   * 创建订单
   */
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await api.post('/orders', data);
    return handleApiResponse<Order>(response);
  }

  /**
   * 获取订单列表
   */
  async getOrders(
    query: OrderQuery = {}
  ): Promise<FrontendPaginatedResponse<Order>> {
    const response = await api.get('/orders', { params: query });
    return handlePaginatedResponse<Order>(response);
  }

  /**
   * 获取订单详情
   */
  async getOrder(id: string): Promise<Order> {
    const response = await api.get(`/orders/${id}`);
    return handleApiResponse<Order>(response);
  }

  /**
   * 取消订单
   */
  async cancelOrder(id: string): Promise<Order> {
    const response = await api.post(`/orders/${id}/cancel`);
    return handleApiResponse<Order>(response);
  }

  /**
   * 获取用户订单
   */
  async getUserOrders(
    query: OrderQuery = {}
  ): Promise<FrontendPaginatedResponse<Order>> {
    const response = await api.get('/orders/user', { params: query });
    return handlePaginatedResponse<Order>(response);
  }

  /**
   * 订单预览（计算总价、优惠等）
   */
  async previewOrder(data: {
    items: Array<{
      productId: string;
      quantity: number;
    }>;
    couponCodes?: string[];
    shippingAddress?: any;
  }): Promise<{
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
    appliedCoupons: any[];
  }> {
    const response = await api.post('/orders/preview', data);
    return handleApiResponse(response);
  }
}

export const orderService = new OrderService();
export default orderService;
