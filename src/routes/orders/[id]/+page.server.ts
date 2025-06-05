// src/routes/orders/[id]/+page.server.ts
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import type { OrderWithItems } from '$lib/types'; // Assuming this type includes items.product.description etc.
import { OrderStatus } from '@prisma/client'; // Keep this for status enum if needed

export const load: PageServerLoad = async ({ params, locals, fetch }) => { // Add 'fetch' here
    const orderId = params.id;

    // 1. Ensure user is logged in (handled by API, but good to have client-side redirect too)
    if (!locals.user) {
        throw redirect(302, `/auth/login?redirectTo=/orders/${orderId}`);
    }

    try {
        // 2. Fetch the order details from your new API endpoint
        const response = await fetch(`/api/orders/${orderId}`); // Call your new API endpoint

        if (!response.ok) {
            // Handle specific API errors
            if (response.status === 404) {
                throw error(404, 'Order not found.');
            }
            if (response.status === 403) { // Unauthorized/Forbidden from your API
                throw error(403, 'You do not have permission to view this order.');
            }
            throw error(response.status, 'Failed to load order details.');
        }

        const order: OrderWithItems = await response.json(); // Type the response

        // 3. Convert Decimal values to numbers for client-side consumption
        // This is necessary if your API endpoint returns raw Decimal objects,
        // which it should if you haven't added conversion in the /api/orders/[id]/+server.ts
        const serializedOrder: OrderWithItems = {
            ...order,
            totalAmount: order.totalAmount,
            items: order.items.map(item => ({
                ...item,
                priceAtPurchase: item.priceAtPurchase
            })),
            // The JSON fields (shippingAddress, billingAddress) are already stringified JSON.
            // We'll parse them in the Svelte component for flexibility.
        } as OrderWithItems;


        return {
            order: serializedOrder,
            user: locals.user,
        };
    } catch (e) {
        console.error(`Error fetching order ${orderId} in +page.server.ts:`, e);
        if (e instanceof Error && 'status' in e && typeof e.status === 'number') {
            throw e;
        }
        throw error(500, 'An unexpected error occurred while loading your order.');
    }
};