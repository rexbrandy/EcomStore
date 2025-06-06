// src/lib/types.ts
// Changed Order to PrismaOrder here to avoid conflict
import type { CartItem, Product, User, Order as PrismaOrder, OrderItem as PrismaOrderItem, Session, Category } from '@prisma/client';
import type { ClientOrderStatus } from './enums'; // <--- NEW IMPORT

export type CartItemWithProduct = CartItem & {
  product: Pick<Product, 'id' | 'name' | 'price' | 'imageUrl' | 'stockQuantity'> & {
      category: Pick<Category, 'name'>;
  };
};

export type CategoryWithProducts = Category & {
  products: Product[];
};

export type CheckoutCartItem = Omit<CartItemWithProduct, 'product'> & {
  product: Omit<CartItemWithProduct['product'], 'price'> & {
      price: number;
  };
};

export type ClientOrderItem = Omit<PrismaOrderItem, 'priceAtPurchase'> & {
    priceAtPurchase: number;
    product: Pick<Product, 'id' | 'name' | 'imageUrl' | 'description'>;
};

export type OrderWithItems = Omit<PrismaOrder, 'totalAmount' | 'shippingAddress' | 'billingAddress' | 'status' | 'items'> & {
  totalAmount: number;
  shippingAddress: object | null;
  billingAddress: object | null;
  status: ClientOrderStatus;
  items: ClientOrderItem[];
  user: Pick<User, 'id' | 'name' | 'email'>;
};


export type AdminOrder = Omit<PrismaOrder, 'totalAmount' | 'shippingAddress' | 'billingAddress' | 'status' | 'items'> & {
    totalAmount: number;
    shippingAddress: object | null;
    billingAddress: object | null;
    status: ClientOrderStatus;
    items: Array<{ productId: string; quantity: number; priceAtPurchase: number; product: Pick<Product, 'name'>; }>;
    user: Pick<User, 'name' | 'email'>;
};


export type PaginatedOrdersResponse = {
  orders: AdminOrder[];
  currentPage: number;
  totalPages: number;
  totalOrders: number;
};

export type AdminProduct = Pick<Product, 'id' | 'name' | 'description' | 'imageUrl' | 'stockQuantity' | 'createdAt' | 'updatedAt'> & {
  price: number;
  categoryId: string;
  category: Pick<Category, 'id' | 'name'>;
};

export type PaginatedProductsResponse = {
  products: AdminProduct[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
};

export type AdminUser = Pick<User, 'id' | 'email' | 'name' | 'isAdmin' | 'createdAt' | 'updatedAt'> & {
  _count: { orders: number; sessions: number };
};

export type PaginatedUsersResponse = {
  users: AdminUser[];
  currentPage: number;
  totalPages: number;
  totalUsers: number;
};

export type AdminUserDetail = Pick<User, 'id' | 'email' | 'name' | 'isAdmin' | 'createdAt' | 'updatedAt'> & {
  orders: Array<Omit<PrismaOrder, 'totalAmount' | 'status'> & {
    totalAmount: number;
    status: ClientOrderStatus;
  }>;
  sessions: Array<Pick<Session, 'id' | 'expiresAt' | 'createdAt'>>;
};

export type AccountPageData = {
  user: Pick<User, 'id' | 'email' | 'name' | 'createdAt' | 'updatedAt'>;
  orders: OrderWithItems[];
};