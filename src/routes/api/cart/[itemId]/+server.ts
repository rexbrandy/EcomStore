import prisma from '$lib/server/prisma';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// PUT update quantity of a specific cart item
export const PUT: RequestHandler = async ({ request, locals, params }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized: You must be logged in to update your cart.');
  }

  try {
    const cartItemId = params.itemId;
    const { quantity } = await request.json();
    const userId = locals.user.id;

    if (quantity === undefined || typeof quantity !== 'number' || quantity <= 0) {
      throw error(400, 'Valid quantity is required and must be greater than 0.');
    }

    const cartItemToUpdate = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true }
    });

    if (!cartItemToUpdate || cartItemToUpdate.userId !== userId) {
      throw error(404, 'Cart item not found or you do not own this item.');
    }

    if (cartItemToUpdate.product.stockQuantity < quantity) {
        throw error(400, `Not enough stock for ${cartItemToUpdate.product.name}. Available: ${cartItemToUpdate.product.stockQuantity}`);
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: { product: {select: { name: true, price: true, imageUrl: true}}}
    });
    return json(updatedCartItem);
  } catch (e: any) {
    console.error(`Failed to update cart item ${params.itemId}:`, e);
    if (e.status) throw e;
    if (e.code === 'P2025') {
        throw error(404, 'Cart item not found for updating.');
    }
    throw error(500, e.message || `Failed to update cart item ${params.itemId}`);
  }
};

// DELETE remove a specific item from the cart
export const DELETE: RequestHandler = async ({ locals, params }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized: You must be logged in to modify your cart.');
  }

  try {
    const cartItemId = params.itemId;
    const userId = locals.user.id;

    const cartItemToDelete = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItemToDelete || cartItemToDelete.userId !== userId) {
      throw error(404, 'Cart item not found or you do not own this item.');
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });
    return json({ message: `Cart item ${cartItemId} removed successfully.` }, { status: 200 });
  } catch (e: any) {
    console.error(`Failed to remove cart item ${params.itemId}:`, e);
    if (e.code === 'P2025') {
        throw error(404, 'Cart item not found for deletion.');
    }
    if (e.status) throw e;
    throw error(500, `Failed to remove cart item ${params.itemId}`);
  }
};