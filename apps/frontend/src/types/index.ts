// 导入共享类型
export * from 'shared/types';
export * from 'coupons/types';

// 重新定义分页响应类型以匹配后端API
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

// 前端特有的类型定义

// 购物车项目类型
export interface CartItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrls?: string[];
    stock: number;
  };
  quantity: number;
}

// 购物车状态类型
export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  loadCart: () => Promise<void>;
}

// 用户认证状态类型
export interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

// 产品查询参数类型
export interface ProductFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// 订单创建请求类型
export interface CreateOrderData {
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

// 组件 Props 类型
export interface ProductListProps {
  filters?: ProductFilters;
  pageSize?: number;
}

export interface ProductCardProps {
  product: any;
  onAddToCart?: (productId: string) => void;
}

export interface CouponSelectorProps {
  orderTotal: number;
  onCouponsChange: (coupons: any[]) => void;
  selectedCoupons?: any[];
}
