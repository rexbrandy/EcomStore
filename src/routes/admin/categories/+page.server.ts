// src/routes/admin/categories/+page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { Category } from '@prisma/client';

export const load: PageServerLoad = async ({ fetch, locals }) => {
    let categories: Category[] = [];

    try {
        const categoriesResponse = await fetch('/api/categories'); // Calls your GET /api/categories
        if (!categoriesResponse.ok) {
            throw error(categoriesResponse.status, 'Failed to fetch categories for admin.');
        }
        categories = await categoriesResponse.json();
    } catch (e) {
        console.error('Error fetching admin categories:', e);
        if (e instanceof Error && 'status' in e && typeof e.status === 'number') {
            throw e;
        }
        throw error(500, 'Could not load admin category data.');
    }

    return {
        categories: categories,
        user: locals.user
    };
};