// src/routes/checkout/+page.server.ts
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import type { CheckoutCartItem } from '$lib/types'; // Import the new type

export const load: PageServerLoad = async ({ fetch, locals }) => {
    // 1. Ensure user is logged in
    if (!locals.user) {
        throw redirect(302, '/auth/login?redirectTo=/checkout'); // Redirect to login if not logged in
    }

    let cartItems: CheckoutCartItem[] = [];

    try {
        // 2. Fetch the current cart items using your existing API endpoint
        const response = await fetch('/api/cart');

        if (!response.ok) {
            // Log error, but don't stop the page load; display an empty cart or error message
            console.error(`Failed to fetch cart for checkout: Status ${response.status}`);
            throw error(response.status, 'Failed to load cart for checkout. Please try again.');
        }

        cartItems = await response.json();

        // 3. Check if cart is empty
        if (cartItems.length === 0) {
            // Redirect to cart page or homepage if cart is empty
            throw redirect(302, '/cart?message=Your cart is empty. Please add items before checking out.');
        }

    } catch (e) {
        console.error('Error in +page.server.ts for checkout:', e);
        // Re-throw SvelteKit errors, otherwise throw a generic 500
        if (e instanceof Error && 'status' in e && typeof e.status === 'number') {
            throw e;
        }
        throw error(500, 'An unexpected error occurred while preparing checkout.');
    }

    return {
        checkoutCartItems: cartItems, // Pass cart items for review
        user: locals.user // Pass user data for potential pre-filling forms
    };
};