// src/routes/api/cart/+server.ts
import prisma from '$lib/server/prisma';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

// GET current user's cart
export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized: You must be logged in to view your cart.');
  }

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: locals.user.id },
      include: {
        product: { // Include product details
          select: { id: true, name: true, price: true, imageUrl: true, stockQuantity: true }
        }
      },
      orderBy: { addedAt: 'asc' },
    });
    return json(cartItems);
  } catch (e) {
    console.error('Failed to fetch cart:', e);
    throw error(500, 'Failed to fetch cart');
  }
};

// POST add an item to the cart or update its quantity
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized: You must be logged in to modify your cart.');
  }

  try {
    const { productId, quantity } = await request.json();
    const userId = locals.user.id;

    if (!productId || typeof productId !== 'string') throw error(400, 'Product ID is required.');
    if (quantity === undefined || typeof quantity !== 'number' || quantity <= 0) throw error(400, 'Valid quantity is required and must be greater than 0.');

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw error(404, 'Product not found.');
    if (product.stockQuantity < quantity) throw error(400, `Not enough stock for ${product.name}. Available: ${product.stockQuantity}`);


    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    let cartItem;
    if (existingCartItem) {
      // Update quantity if item already in cart
      const newQuantity = existingCartItem.quantity + quantity;
      if (product.stockQuantity < newQuantity) throw error(400, `Not enough stock for ${product.name} to add ${quantity}. Current in cart: ${existingCartItem.quantity}, Available: ${product.stockQuantity}`);
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: { product: {select: { name: true, price: true, imageUrl: true}}}
      });
    } else {
      // Add new item to cart
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
        },
        include: { product: {select: { name: true, price: true, imageUrl: true}}}
      });
    }
    return json(cartItem, { status: existingCartItem ? 200 : 201 });
  } catch (e: any) {
    console.error('Failed to add to cart:', e);
    if (e.status) throw e;
    throw error(500, e.message || 'Failed to add item to cart');
  }
};

// DELETE clear the entire cart for the user
export const DELETE: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized: You must be logged in to clear your cart.');
  }

  try {
    await prisma.cartItem.deleteMany({
      where: { userId: locals.user.id },
    });
    return json({ message: 'Cart cleared successfully.' }, { status: 200 });
  } catch (e) {
    console.error('Failed to clear cart:', e);
    throw error(500, 'Failed to clear cart');
  }
};