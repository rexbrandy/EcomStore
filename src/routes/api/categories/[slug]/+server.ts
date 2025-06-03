// src/routes/api/categories/[slug]/+server.ts
import prisma from '$lib/server/prisma';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

// GET a single category by slug
export const GET: RequestHandler = async ({ params }) => {
  try {
    const categorySlug = params.slug;
    if (!categorySlug) {
      throw error(400, 'Category slug is required.');
    }

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      include: {
        products: { // Optionally include products in this category
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!category) {
      throw error(404, 'Category not found.');
    }
    return json(category);
  } catch (e: any) {
    console.error(`Failed to fetch category ${params.slug}:`, e);
    if (e.status) throw e;
    throw error(500, `Failed to fetch category ${params.slug}`);
  }
};