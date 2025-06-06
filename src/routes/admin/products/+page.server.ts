import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { PaginatedProductsResponse } from '$lib/types';

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
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
    let categories: Array<{ id: string; name: string; slug: string }> = [];


    try {
        const productsApiUrl = `/api/products?page=${page}&limit=${limit}&search=${searchTerm}&categorySlug=${categorySlug}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
        
        const productsFetchResponse = await fetch(productsApiUrl);
        if (!productsFetchResponse.ok) {
            throw error(productsFetchResponse.status, 'Failed to fetch products for admin.');
        }

        productsResponse = await productsFetchResponse.json();

        const categoriesResponse = await fetch('/api/categories');
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
        products: productsResponse.products,
        currentPage: productsResponse.currentPage,
        totalPages: productsResponse.totalPages,
        totalProducts: productsResponse.totalProducts,
        categories: categories,
        searchTerm: searchTerm,
        selectedCategorySlug: categorySlug,
        sortBy: sortBy,
        sortOrder: sortOrder,
        user: locals.user
    };
};