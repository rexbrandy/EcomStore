// src/routes/api/products/+server.ts
import prisma from '$lib/server/prisma';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '@prisma/client'; // For Decimal type

// GET all products (with filtering and pagination)
export const GET: RequestHandler = async ({ url }) => {
  try {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const categorySlug = url.searchParams.get('categorySlug');
    const searchTerm = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt'; // e.g., 'price', 'name'
    const sortOrder = url.searchParams.get('sortOrder') || 'desc'; // 'asc' or 'desc'


    const where: Prisma.ProductWhereInput = {};
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm } },
        { description: { contains: searchTerm } },
      ];
    }

    const validSortByFields: (keyof Prisma.ProductOrderByWithRelationInput)[] = ['name', 'price', 'createdAt', 'stockQuantity'];
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (validSortByFields.includes(sortBy as any)) {
        (orderBy as any)[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
        orderBy.createdAt = 'desc'; // Default sort
    }


    const products = await prisma.product.findMany({
      where,
      include: { category: true }, // Include category details
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
    });

    const totalProducts = await prisma.product.count({ where });

    return json({
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
    });
  } catch (e) {
    console.error('Failed to fetch products:', e);
    throw error(500, 'Failed to fetch products');
  }
};

// POST create a new product (Admin only)
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user?.isAdmin) {
    throw error(403, 'Forbidden: You do not have permission to create products.');
  }

  try {
    const { name, description, price, imageUrl, stockQuantity, categoryId } = await request.json();

    if (!name || typeof name !== 'string') throw error(400, 'Product name is required.');
    if (price === undefined || typeof price !== 'number' || price < 0) throw error(400, 'Valid product price is required.');
    if (stockQuantity === undefined || typeof stockQuantity !== 'number' || stockQuantity < 0) throw error(400, 'Valid stock quantity is required.');
    if (!categoryId || typeof categoryId !== 'string') throw error(400, 'Category ID is required.');

    // Validate categoryId exists
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
        throw error(400, 'Invalid Category ID: Category does not exist.');
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: new Prisma.Decimal(price),
        imageUrl,
        stockQuantity,
        categoryId,
      },
    });
    return json(newProduct, { status: 201 });
  } catch (e: any) {
    console.error('Failed to create product:', e);
    if (e.status) throw e;
    throw error(500, e.message || 'Failed to create product');
  }
};