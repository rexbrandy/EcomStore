// src/routes/api/categories/+server.ts
import prisma from '$lib/server/prisma';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { slugify } from '$lib/server/utils';

// GET all categories
export const GET: RequestHandler = async () => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return json(categories);
  } catch (e) {
    console.error('Failed to fetch categories:', e);
    throw error(500, 'Failed to fetch categories');
  }
};

// POST create a new category (Admin only)
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user?.isAdmin) {
    throw error(403, 'Forbidden: You do not have permission to create categories.');
  }

  try {
    const { name, description } = await request.json();

    if (!name || typeof name !== 'string') {
      throw error(400, 'Category name is required and must be a string.');
    }

    const categorySlug = slugify(name);

    const existingCategoryByName = await prisma.category.findUnique({ where: { name } });
    if (existingCategoryByName) {
      throw error(409, 'A category with this name already exists.');
    }
    const existingCategoryBySlug = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (existingCategoryBySlug) {
      throw error(409, 'A category with this generated slug already exists. Please choose a different name.');
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        slug: categorySlug,
        description,
      },
    });
    return json(newCategory, { status: 201 });
  } catch (e: any) {
    console.error('Failed to create category:', e);
    if (e.status) throw e; // Re-throw SvelteKit errors
    throw error(500, e.message || 'Failed to create category');
  }
};