// User types
export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  profile?: any;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

// Product types
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrls?: string[];
  categoryId: string;
  category?: Category;
  status: ProductStatus;
  attributes?: any;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

// Category types
export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  createdAt: Date;
  updatedAt: Date;
}

// Order types
export interface Order {
  id: string;
  userId: string;
  user?: User;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: any;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  notes?: string;
  orderItems?: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  createdAt: Date;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

// Cart types
export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

// Review types
export interface Review {
  id: string;
  userId: string;
  user?: User;
  productId: string;
  product?: Product;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
