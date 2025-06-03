// src/routes/api/products/[id]/+server.ts
import prisma from '$lib/server/prisma';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '@prisma/client';

// GET a single product by ID
export const GET: RequestHandler = async ({ params }) => {
  try {
    const productId = params.id;
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) {
      throw error(404, 'Product not found.');
    }
    return json(product);
  } catch (e: any) {
    console.error(`Failed to fetch product ${params.id}:`, e);
    if (e.status) throw e;
    throw error(500, `Failed to fetch product ${params.id}`);
  }
};

// PUT update a product (Admin only)
export const PUT: RequestHandler = async ({ request, locals, params }) => {
  if (!locals.user?.isAdmin) {
    throw error(403, 'Forbidden: You do not have permission to update products.');
  }

  try {
    const productId = params.id;
    const { name, description, price, imageUrl, stockQuantity, categoryId } = await request.json();

    // Basic validation
    if (!name || typeof name !== 'string') throw error(400, 'Product name is required.');
    if (price === undefined || typeof price !== 'number' || price < 0) throw error(400, 'Valid product price is required.');
    if (stockQuantity === undefined || typeof stockQuantity !== 'number' || stockQuantity < 0) throw error(400, 'Valid stock quantity is required.');
    if (!categoryId || typeof categoryId !== 'string') throw error(400, 'Category ID is required.');

    // Validate categoryId exists if it's being changed or provided
    if (categoryId) {
        const category = await prisma.category.findUnique({ where: { id: categoryId } });
        if (!category) {
            throw error(400, 'Invalid Category ID: Category does not exist.');
        }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price: new Prisma.Decimal(price),
        imageUrl,
        stockQuantity,
        categoryId,
      },
    });
    return json(updatedProduct);
  } catch (e: any) {
    console.error(`Failed to update product ${params.id}:`, e);
    if (e.status) throw e;
    if (e.code === 'P2025') {
        throw error(404, 'Product not found for updating.');
    }
    throw error(500, e.message ||`Failed to update product ${params.id}`);
  }
};

// DELETE a product (Admin only)
export const DELETE: RequestHandler = async ({ locals, params }) => {
  if (!locals.user?.isAdmin) {
    throw error(403, 'Forbidden: You do not have permission to delete products.');
  }

  try {
    const productId = params.id;
    // Note: onDelete: Restrict for OrderItem.product in your schema.
    // This means Prisma will prevent deleting a product if it's part of any order.
    // You might need to handle this (e.g., by "soft deleting" or archiving products).
    await prisma.product.delete({
      where: { id: productId },
    });
    return json({ message: `Product ${productId} deleted successfully.` }, { status: 200 });
  } catch (e: any) {
    console.error(`Failed to delete product ${params.id}:`, e);
     if (e.code === 'P2025') {
        throw error(404, 'Product not found for deletion.');
    }
    if (e.code === 'P2003') { // Foreign key constraint failed
        throw error(409, 'Cannot delete product as it is referenced in existing orders or cart items.');
    }
    if (e.status) throw e;
    throw error(500, `Failed to delete product ${params.id}`);
  }
};