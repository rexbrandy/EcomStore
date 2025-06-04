import type { CartItem, Product, User, Category, Order, OrderItem, OrderStatus } from '@prisma/client';

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

// Type for the full Order with its items for display (e.g., in an order history)
export type OrderWithItems = Order & {
  items: (OrderItem & {
      product: Pick<Product, 'id' | 'name' | 'imageUrl'>; // Details of the product at time of order
  })[];
};
