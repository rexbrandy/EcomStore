// src/routes/api/admin/users/+server.ts
import prisma from '$lib/server/prisma';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '@prisma/client'; // For Decimal type

// GET all users (Admin only)
export const GET: RequestHandler = async ({ locals, url }) => {
  if (!locals.user?.isAdmin) {
    throw error(403, 'Forbidden: You do not have permission to access user data.');
  }

  try {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const searchTerm = url.searchParams.get('search');

    const where: Prisma.UserWhereInput = {};
    if (searchTerm) {
      where.OR = [
        { email: { contains: searchTerm } },
        { name: { contains: searchTerm } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: { // Explicitly select fields to exclude password
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { orders: true, sessions: true }} // Example of counting relations
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const totalUsers = await prisma.user.count({ where });

    return json({
      users,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    });
  } catch (e) {
    console.error('Failed to fetch users for admin:', e);
    throw error(500, 'Failed to fetch users');
  }
};