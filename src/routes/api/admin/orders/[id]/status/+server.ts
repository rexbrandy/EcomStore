// src/routes/api/admin/orders/[id]/status/+server.ts
import prisma from '$lib/server/prisma';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { ClientOrderStatus } from '$lib/enums';

// PUT update order status (Admin only)
export const PUT: RequestHandler = async ({ request, locals, params }) => {
  if (!locals.user?.isAdmin) {
    throw error(403, 'Forbidden: You do not have permission to update order status.');
  }

  try {
    const orderId = params.id;
    const { status } = await request.json();

    if (!status || !Object.values(ClientOrderStatus).includes(status as ClientOrderStatus)) {
      throw error(400, `Invalid status value. Must be one of: ${Object.values(ClientOrderStatus).join(', ')}`);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as ClientOrderStatus },
      include: {
         user: { select: { id: true, name: true, email: true } },
         items: { include: { product: {select: {name: true}}}}
      }
    });

    // Optionally: Send notifications to the user about status change here

    return json(updatedOrder);
  } catch (e: any) {
    console.error(`Failed to update status for order ${params.id}:`, e);
    if (e.status) throw e;
    if (e.code === 'P2025') { // Prisma error code for record not found
        throw error(404, 'Order not found for status update.');
    }
    throw error(500, e.message || `Failed to update status for order ${params.id}`);
  }
};