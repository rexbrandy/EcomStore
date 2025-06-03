// src/routes/api/admin/users/[id]/+server.ts
import prisma from '$lib/server/prisma';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '@prisma/client'; 

// GET a specific user by ID (Admin only)
export const GET: RequestHandler = async ({ locals, params }) => {
  if (!locals.user?.isAdmin) {
    throw error(403, 'Forbidden: You do not have permission to view this user.');
  }

  try {
    const userId = params.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { // Exclude password
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        orders: { // Include some related data if useful for admin view
            select: { id: true, orderDate: true, totalAmount: true, status: true },
            orderBy: { orderDate: 'desc'},
            take: 5
        },
        sessions: {
            select: { id: true, expiresAt: true, createdAt: true },
            orderBy: { createdAt: 'desc'},
            take: 5
        }
      },
    });

    if (!user) {
      throw error(404, 'User not found.');
    }
    return json(user);
  } catch (e: any) {
    console.error(`Failed to fetch user ${params.id}:`, e);
    if (e.status) throw e;
    throw error(500, `Failed to fetch user ${params.id}`);
  }
};

// PUT update a user's details (Admin only - e.g., isAdmin status)
export const PUT: RequestHandler = async ({ request, locals, params }) => {
  if (!locals.user?.isAdmin) {
    throw error(403, 'Forbidden: You do not have permission to update users.');
  }

  try {
    const userIdToUpdate = params.id;
    const { name, email, isAdmin } = await request.json();

    // Basic validation
    if (typeof isAdmin !== 'boolean' && isAdmin !== undefined) {
      throw error(400, 'isAdmin must be a boolean value.');
    }
    // Add more validation for name, email if they are updatable

    const dataToUpdate: Partial<Prisma.UserUpdateInput> = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (email !== undefined) { // Ensure email uniqueness if changed
        const existingUser = await prisma.user.findFirst({where: {email: email, NOT: {id: userIdToUpdate}}});
        if (existingUser) throw error(409, "Email already in use by another account.");
        dataToUpdate.email = email;
    }
    if (isAdmin !== undefined) dataToUpdate.isAdmin = isAdmin;

    if (Object.keys(dataToUpdate).length === 0) {
        throw error(400, 'No update data provided.');
    }


    const updatedUser = await prisma.user.update({
      where: { id: userIdToUpdate },
      data: dataToUpdate,
      select: { // Exclude password from response
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return json(updatedUser);
  } catch (e: any) {
    console.error(`Failed to update user ${params.id}:`, e);
    if (e.status) throw e;
    if (e.code === 'P2025') { // Prisma: Record to update not found.
        throw error(404, 'User not found for updating.');
    }
    throw error(500, e.message || `Failed to update user ${params.id}`);
  }
};