// src/routes/admin/products/+page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { PaginatedProductsResponse } from '$lib/types'; // Import the new type

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
    // Authorization is handled by src/routes/admin/+layout.server.ts

    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';
    const searchTerm = url.searchParams.get('search') || '';
    const categorySlug = url.searchParams.get('categorySlug') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    let productsResponse: PaginatedProductsResponse = {
        products: [],
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
    };
    let categories: Array<{ id: string; name: string; slug: string }> = []; // Categories will have slug for filtering


    try {
        // Construct the URL for fetching products with all query parameters
        const productsApiUrl = `/api/products?page=${page}&limit=${limit}&search=${searchTerm}&categorySlug=${categorySlug}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
        
        // Fetch products
        const productsFetchResponse = await fetch(productsApiUrl);
        if (!productsFetchResponse.ok) {
            throw error(productsFetchResponse.status, 'Failed to fetch products for admin.');
        }

        productsResponse = await productsFetchResponse.json();

        // Fetch categories (for dropdowns in create/edit forms and filtering)
        const categoriesResponse = await fetch('/api/categories'); // Calls your existing GET /api/categories
        if (!categoriesResponse.ok) {
            throw error(categoriesResponse.status, 'Failed to fetch categories for admin.');
        }
        categories = await categoriesResponse.json();

    } catch (e) {
        console.error('Error fetching admin products/categories:', e);
        if (e instanceof Error && 'status' in e && typeof e.status === 'number') {
            throw e;
        }
        throw error(500, 'Could not load admin product data.');
    }

    return {
        // Pass all fetched data and current query parameters back to the page
        products: productsResponse.products,
        currentPage: productsResponse.currentPage,
        totalPages: productsResponse.totalPages,
        totalProducts: productsResponse.totalProducts,
        categories: categories,
        searchTerm: searchTerm,
        selectedCategorySlug: categorySlug,
        sortBy: sortBy,
        sortOrder: sortOrder,
        user: locals.user // Pass user data from layout load if needed
    };
};