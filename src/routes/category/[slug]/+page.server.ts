// src/routes/category/[slug]/+page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
    const { slug } = params; // Get the slug from the URL parameters

    try {
        // Fetch the category data, which includes products, from your API endpoint
        const response = await fetch(`/api/categories/${slug}`);

        if (!response.ok) {
            // If the API returns a non-200 status, throw a SvelteKit error
            // This will typically render your src/routes/+error.svelte page if you have one
            if (response.status === 404) {
                throw error(404, `Category "${slug}" not found.`);
            }
            throw error(response.status, `Failed to load category "${slug}".`);
        }

        const categoryData = await response.json();

        // The categoryData object now contains the category details AND its products
        // We return it so it's available as `data` in +page.svelte
        return {
            category: categoryData, // This will contain name, slug, description, and products array
            user: locals.user
        };

    } catch (e) {
        console.error(`Error loading category "${slug}" in +page.server.ts:`, e);
        // Re-throw SvelteKit errors if they are already of that type
        if (e instanceof Error && 'status' in e && typeof e.status === 'number') {
            throw e;
        }
        // For any other unexpected error, throw a generic 500
        throw error(500, `An unexpected error occurred while loading category "${slug}".`);
    }
};