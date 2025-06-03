// src/routes/api/categories/id/[id]/+server.ts
import prisma from '$lib/server/prisma';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { slugify } from '$lib/server/utils';

// PUT update a category (Admin only)
export const PUT: RequestHandler = async ({ request, locals, params }) => {
  if (!locals.user?.isAdmin) {
    throw error(403, 'Forbidden: You do not have permission to update categories.');
  }

  try {
    const categoryId = params.id;
    const { name, description } = await request.json();

    if (!name || typeof name !== 'string') {
      throw error(400, 'Category name is required.');
    }

    const newSlug = slugify(name);

    // Check if new name or slug conflicts with another category
    const conflictingCategory = await prisma.category.findFirst({
        where: {
            OR: [
                { name: name },
                { slug: newSlug }
            ],
            NOT: { id: categoryId }
        }
    });

    if (conflictingCategory) {
        if (conflictingCategory.name === name) {
            throw error(409, 'Another category with this name already exists.');
        }
        if (conflictingCategory.slug === newSlug) {
            throw error(409, 'Another category with this generated slug already exists. Please adjust the name.');
        }
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        slug: newSlug,
        description,
      },
    });
    return json(updatedCategory);
  } catch (e: any) {
    console.error(`Failed to update category ${params.id}:`, e);
    if (e.status) throw e;
    if (e.code === 'P2025') { // Prisma error code for record not found
        throw error(404, 'Category not found for updating.');
    }
    throw error(500, `Failed to update category ${params.id}`);
  }
};

// DELETE a category (Admin only)
export const DELETE: RequestHandler = async ({ locals, params }) => {
  if (!locals.user?.isAdmin) {
    throw error(403, 'Forbidden: You do not have permission to delete categories.');
  }

  try {
    const categoryId = params.id;
    // Consider what happens to products in this category.
    // Prisma schema might restrict deletion if products exist, or you might reassign them.
    // For now, assuming cascade delete or appropriate handling is set up or products are moved.
    await prisma.category.delete({
      where: { id: categoryId },
    });
    return json({ message: `Category ${categoryId} deleted successfully.` }, { status: 200 });
  } catch (e: any) {
    console.error(`Failed to delete category ${params.id}:`, e);
    if (e.code === 'P2025') {
        throw error(404, 'Category not found for deletion.');
    }
    if (e.code === 'P2003') { // Foreign key constraint failed (e.g., products still reference this category)
        throw error(409, 'Cannot delete category as it still has products associated with it.');
    }
    if (e.status) throw e;
    throw error(500, `Failed to delete category ${params.id}`);
  }
};