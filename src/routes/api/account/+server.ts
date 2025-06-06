// src/routes/api/account/+server.ts
import prisma from '$lib/server/prisma';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { PWORD_SALT_ROUNDS } from '$lib/common';

// Helper to convert Decimal to number and parse JSON (reusable from previous work)
function serializeOrderForUser(order: any) {
  return {
    ...order,
    totalAmount: order.totalAmount.toNumber(),
    shippingAddress: order.shippingAddress ? JSON.parse(JSON.stringify(order.shippingAddress)) : null,
    billingAddress: order.billingAddress ? JSON.parse(JSON.stringify(order.billingAddress)) : null,
    items: order.items.map((item: any) => ({
      ...item,
      priceAtPurchase: item.priceAtPurchase.toNumber(),
    })),
  };
}

// GET /api/account - Get current user's details and their past orders
export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized: You must be logged in to view your account.');
  }

  const userId = locals.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      // This case should ideally not happen if locals.user is set, but good for safety
      throw error(404, 'User not found.');
    }

    const orders = await prisma.order.findMany({
      where: { userId: userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true, description: true }
            },
          },
        },
      },
      orderBy: { orderDate: 'desc' },
      take: 10, // Limit to recent 10 orders for account page overview
    });

    const serializedOrders = orders.map(serializeOrderForUser);

    return json({ user, orders: serializedOrders });

  } catch (e: any) {
    console.error('Failed to fetch account data:', e);
    throw error(500, 'Failed to fetch account data.');
  }
};

// PUT /api/account - Update current user's details
export const PUT: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized: You must be logged in to update your account.');
  }

  const userId = locals.user.id;

  try {
    const { name, email, password } = await request.json();

    // Basic validation
    if (name !== undefined && typeof name !== 'string') throw error(400, 'Name must be a string.');
    if (email !== undefined && (typeof email !== 'string' || !email.includes('@'))) throw error(400, 'Valid email is required.');
    if (password !== undefined && typeof password !== 'string') throw error(400, 'Valid password is required.');

    const dataToUpdate: { name?: string; email?: string; password?: string; } = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (email !== undefined) {
      // Check if new email is already in use by another user
      const existingUserWithEmail = await prisma.user.findFirst({
        where: { email: email, NOT: { id: userId } },
      });
      if (existingUserWithEmail) {
        throw error(409, 'This email is already registered to another account.');
      }
      dataToUpdate.email = email;
    }
    if (password !== undefined) {
      dataToUpdate.password = await bcrypt.hash(password, PWORD_SALT_ROUNDS);
    }

    if (Object.keys(dataToUpdate).length === 0) {
      throw error(400, 'No update data provided.');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { // Select fields to return
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return json(updatedUser, { status: 200 });

  } catch (e: any) {
    console.error('Failed to update account data:', e);
    if (e.status) throw e;
    if (e.code === 'P2025') { // Prisma error code for record not found
        throw error(404, 'User not found for updating.');
    }
    throw error(500, e.message || 'Failed to update account data.');
  }
};