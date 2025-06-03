// src/routes/api/orders/+server.ts
import prisma from '$lib/server/prisma';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { Prisma, OrderStatus } from '@prisma/client'; // For Decimal and Enum

// GET current user's orders
export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized: You must be logged in to view your orders.');
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: locals.user.id },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true, description: true } }, // Added description
          },
        },
      },
      orderBy: { orderDate: 'desc' },
    });
    return json(orders);
  } catch (e) {
    console.error('Failed to fetch orders:', e);
    throw error(500, 'Failed to fetch orders');
  }
};

// POST create a new order (Checkout)
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized: You must be logged in to place an order.');
  }

  const userId = locals.user.id;

  try {
    const { shippingAddress, billingAddress, paymentIntentId } = await request.json();

    if (!shippingAddress) throw error(400, 'Shipping address is required.');
    // billingAddress might be optional or same as shipping

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      throw error(400, 'Your cart is empty. Add items before placing an order.');
    }

    let totalAmount = new Prisma.Decimal(0);
    const orderItemsData: Prisma.OrderItemCreateManyOrderInput[] = [];

    // Check stock and prepare order items
    for (const cartItem of cartItems) {
      if (cartItem.product.stockQuantity < cartItem.quantity) {
        throw error(400, `Not enough stock for ${cartItem.product.name}. Available: ${cartItem.product.stockQuantity}, Requested: ${cartItem.quantity}. Please update your cart.`);
      }
      totalAmount = totalAmount.plus(cartItem.product.price.mul(cartItem.quantity));
      orderItemsData.push({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        priceAtPurchase: cartItem.product.price,
      });
    }

    // Use Prisma transaction to ensure atomicity
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          shippingAddress, // Prisma expects JsonValue for Json type
          billingAddress,  // Prisma expects JsonValue for Json type
          paymentIntentId,
          status: OrderStatus.PENDING, // Default, or PAID if paymentIntentId implies success
          items: {
            createMany: {
              data: orderItemsData,
            },
          },
        },
        include: {
          items: {
            include: { product: { select: { id: true, name: true, imageUrl: true } } }
          }
        }
      });

      // Decrement stock for each product
      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      // Clear user's cart
      await tx.cartItem.deleteMany({
        where: { userId: userId },
      });

      return order;
    });

    return json(newOrder, { status: 201 });

  } catch (e: any) {
    console.error('Failed to create order:', e);
    if (e.status) throw e; // Re-throw SvelteKit errors
    // Handle specific Prisma transaction errors if necessary
    throw error(500, e.message || 'Failed to create order due to a server error.');
  }
};