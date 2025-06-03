// src/routes/api/orders/[id]/+server.ts
import prisma from '$lib/server/prisma';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

// GET a specific order by ID (for the logged-in user)
export const GET: RequestHandler = async ({ locals, params }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized: You must be logged in to view this order.');
  }

  try {
    const orderId = params.id;
    const userId = locals.user.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true, description: true } },
          },
        },
        user: { // For admin, you might want to see user details. For users, it's their own order.
            select: { id: true, name: true, email: true }
        }
      },
    });

    if (!order) {
      throw error(404, 'Order not found.');
    }

    // Ensure the user owns this order OR is an admin
    if (order.userId !== userId && !locals.user.isAdmin) {
      throw error(403, 'Forbidden: You do not have permission to view this order.');
    }

    return json(order);
  } catch (e: any) {
    console.error(`Failed to fetch order ${params.id}:`, e);
    if (e.status) throw e;
    throw error(500, `Failed to fetch order ${params.id}`);
  }
};