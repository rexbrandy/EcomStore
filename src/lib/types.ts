import type { CartItem, Product, User, Category, Order, OrderItem, Session } from '@prisma/client';

export type OrderStatusValue = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export type CartItemWithProduct = CartItem & {
  product: Pick<Product, 'id' | 'name' | 'price' | 'imageUrl' | 'stockQuantity'> & {
      category: Pick<Category, 'name'>; // Now category is always present if product is there
  };
};

export type CategoryWithProducts = Category & {
  products: Product[];
};

export type CheckoutCartItem = Omit<CartItemWithProduct, 'product'> & {
  product: Omit<CartItemWithProduct['product'], 'price'> & {
      price: number; // Price as a number, after server-side conversion
  };
};

export type OrderWithItems = Order & {
  totalAmount: number; // Override Decimal for client-side
  items: (Omit<OrderItem, 'priceAtPurchase'> & { // Omit Decimal price and override
      priceAtPurchase: number;
      product: Pick<Product, 'id' | 'name' | 'imageUrl' | 'description'>; // Include description
  })[];
  user: Pick<User, 'id' | 'name' | 'email'>; // Include user details
};

export type AdminOrder = Omit<OrderWithItems, 'items' | 'shippingAddress' | 'billingAddress'> & {
  items: Array<{ productId: string; quantity: number; priceAtPurchase: number; product: Pick<Product, 'name'>; }>; // Simplified product details for table
  user: Pick<User, 'name' | 'email'>; // Simplified user details for table
  shippingAddress: object | null; // Still include, but parse on server
  billingAddress: object | null; // Still include, but parse on server
};

export type PaginatedOrdersResponse = {
  orders: AdminOrder[]; // Use the AdminOrder type for the list
  currentPage: number;
  totalPages: number;
  totalOrders: number;
};

export type AdminProduct = Pick<Product, 'id' | 'name' | 'description' | 'imageUrl' | 'stockQuantity' | 'createdAt' | 'updatedAt'> & {
  price: number; // Converted from Decimal
  categoryId: string; // Foreign key
  category: Pick<Category, 'id' | 'name'>; // Included category details
};

export type PaginatedProductsResponse = {
  products: AdminProduct[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
};

export type AdminUser = Pick<User, 'id' | 'email' | 'name' | 'isAdmin' | 'createdAt' | 'updatedAt'> & {
  _count: { orders: number; sessions: number }; // Counts included by Prisma
};

// Paginated response type for GET /api/admin/users
export type PaginatedUsersResponse = {
  users: AdminUser[];
  currentPage: number;
  totalPages: number;
  totalUsers: number;
};

// Detailed AdminUser type for single user view (from GET /api/admin/users/[id])
export type AdminUserDetail = Pick<User, 'id' | 'email' | 'name' | 'isAdmin' | 'createdAt' | 'updatedAt'> & {
  orders: Array<Pick<Order, 'id' | 'orderDate' | 'totalAmount' | 'status'>>; // Simplified order data
  sessions: Array<Pick<Session, 'id' | 'expiresAt' | 'createdAt'>>; // Simplified session data
};

export type AccountPageData = {
  user: Pick<User, 'id' | 'email' | 'name' | 'createdAt' | 'updatedAt'>;
  orders: OrderWithItems[]; // Reuse OrderWithItems for consistency, or create a simplified one
};
