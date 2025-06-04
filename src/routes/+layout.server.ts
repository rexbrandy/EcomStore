// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { CartItem, Product } from '@prisma/client'; // Import Prisma types if available

// Define a type for your cart data to be returned by load
// This helps with type safety in your Svelte components
type CartItemWithProduct = CartItem & {
    product: Pick<Product, 'id' | 'name' | 'price' | 'imageUrl' | 'stockQuantity'>;
};

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
    // Return user data as before
    const user = locals.user;

    let cartItems: CartItemWithProduct[] = [];

    // Only fetch cart items if the user is logged in
    if (user) {
        try {
            // Call your internal /api/cart GET endpoint
            const response = await fetch('/api/cart');

            if (!response.ok) {
                // Log the error but don't block the layout from loading.
                // An unauthorized or internal server error for cart shouldn't
                // prevent the entire page from rendering.
                console.error(`Failed to fetch cart: Status ${response.status}`);
                // Optionally, you could return an empty array or a specific error indicator
                // instead of throwing a hard error if you want the page to still load.
                // throw error(response.status, 'Failed to load cart data.'); // Only if critical
            } else {
                cartItems = await response.json();
            }
        } catch (e) {
            console.error('Error fetching cart in +layout.server.ts:', e);
            // Again, decide if this error should stop page load or just result in empty cart
        }
    }

    return {
        user: user,
        cartItems: cartItems // Pass the fetched cart items
    };
};