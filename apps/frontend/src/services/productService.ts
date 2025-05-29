import api, { handleApiResponse, handlePaginatedResponse, FrontendPaginatedResponse } from '../lib/api';
import { Product } from 'shared/types';

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

class ProductService {
  /**
   * 获取产品列表
   */
  async getProducts(query: ProductQuery = {}): Promise<FrontendPaginatedResponse<Product>> {
    const response = await api.get('/products', { params: query });
    return handlePaginatedResponse<Product>(response);
  }

  /**
   * 获取产品详情
   */
  async getProduct(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return handleApiResponse<Product>(response);
  }

  /**
   * 获取热门产品
   */
  async getPopularProducts(limit: number = 10): Promise<Product[]> {
    const response = await api.get('/products/popular', {
      params: { limit }
    });
    return handleApiResponse<Product[]>(response);
  }

  /**
   * 搜索产品
   */
  async searchProducts(
    keyword: string,
    options: Omit<ProductQuery, 'search'> = {}
  ): Promise<FrontendPaginatedResponse<Product>> {
    const query = { ...options, search: keyword };
    return this.getProducts(query);
  }

  /**
   * 按分类获取产品
   */
  async getProductsByCategory(
    categoryId: string,
    options: Omit<ProductQuery, 'categoryId'> = {}
  ): Promise<FrontendPaginatedResponse<Product>> {
    const query = { ...options, categoryId };
    return this.getProducts(query);
  }

  /**
   * 获取产品分类
   */
  async getCategories(): Promise<any[]> {
    const response = await api.get('/categories');
    return handleApiResponse<any[]>(response);
  }
}

export const productService = new ProductService();
export default productService;
