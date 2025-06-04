// src/routes/cart/+page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch, locals }) => {
    // Ensure the user is logged in to view the cart
    if (!locals.user) {
        // Redirect to login if not authenticated
        throw error(401, 'Unauthorized: You must be logged in to view your cart.');
    }

    try {
        const response = await fetch('/api/cart'); // Call your existing GET cart endpoint

        if (!response.ok) {
            // If the API endpoint itself returns an error (e.g., 500), handle it.
            throw error(response.status, 'Failed to fetch cart items.');
        }

        const cartItems = await response.json();
        
        return {
            cartItems: cartItems,
            user: locals.user // Also pass the user data for consistent access
        };
    } catch (e) {
        console.error('Error fetching cart in +page.server.ts:', e);
        if (e instanceof Error && 'status' in e && typeof e.status === 'number') {
            throw e; // Re-throw SvelteKit errors
        }
        throw error(500, 'An unexpected error occurred while loading your cart.');
    }
};