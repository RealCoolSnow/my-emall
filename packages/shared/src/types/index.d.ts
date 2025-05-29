export interface User {
    id: string;
    email: string;
    username: string;
    role: UserRole;
    profile?: any;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum UserRole {
    CUSTOMER = "CUSTOMER",
    ADMIN = "ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN"
}
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
export declare enum ProductStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    OUT_OF_STOCK = "OUT_OF_STOCK"
}
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
export declare enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export interface CartItem {
    id: string;
    userId: string;
    productId: string;
    product?: Product;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}
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
//# sourceMappingURL=index.d.ts.map