/**
 * 后端 API 类型定义
 * 定义了所有 API 请求和响应的类型接口
 */

// 导入共享类型
export * from 'shared/types';

// API 响应基础类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// 分页响应类型
export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 认证相关类型
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
  token: string;
  refreshToken: string;
}

// 产品相关类型
export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrls?: string[];
  attributes?: Record<string, any>;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  status?: string;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  status?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// 订单相关类型
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

export interface UpdateOrderRequest {
  status?: string;
  paymentStatus?: string;
  notes?: string;
}

export interface OrderQuery {
  page?: number;
  limit?: number;
  userId?: string;
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'totalAmount';
  sortOrder?: 'asc' | 'desc';
}

// 优惠券相关类型
export interface CreateCouponRequest {
  code: string;
  name: string;
  description?: string;
  type: 'FIXED_AMOUNT' | 'PERCENTAGE' | 'FREE_SHIPPING';
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
}

export interface ApplyCouponRequest {
  orderItems: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shippingCost: number;
  couponCodes: string[];
  userId: string;
}

// 购物车相关类型
export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// 评价相关类型
export interface CreateReviewRequest {
  productId: string;
  rating: number;
  comment?: string;
}

// 分类相关类型
export interface CreateCategoryRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
}

// JWT 载荷类型
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// 错误类型
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
}

// 数据库查询选项
export interface QueryOptions {
  include?: Record<string, boolean | QueryOptions>;
  select?: Record<string, boolean>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  where?: Record<string, any>;
  skip?: number;
  take?: number;
}
