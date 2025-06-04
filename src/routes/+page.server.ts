import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch }) => {
    try {
        // We call the internal API endpoint directly.
        // SvelteKit optimizes this to be a direct function call on the server,
        // rather than a full HTTP request.
        const response = await fetch('/api/categories'); 

        if (!response.ok) {
            // If the API call itself returns an error (e.g., 500 from your +server.ts)
            // throw an SvelteKit error that can be caught by an error.svelte page.
            throw error(response.status, 'Failed to fetch categories from API.');
        }

        const categories = await response.json();
        return {
            categories: categories // This data will be available as `data.categories` in +page.svelte
        };
    } catch (e) {
        console.error('Error in +page.server.ts fetching categories:', e);
        // Re-throw SvelteKit errors, or create a new 500 error if it's an unexpected issue
        if (e instanceof Error && 'status' in e && typeof e.status === 'number') {
            throw e; // Re-throw SvelteKit error if it's already one
        }
        throw error(500, 'Could not load categories for the homepage.');
    }
};