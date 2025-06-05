// src/routes/account/+page.server.ts
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import type { AccountPageData } from '$lib/types'; // Import the new type

export const load: PageServerLoad = async ({ fetch, locals }) => {
    // Ensure the user is logged in
    if (!locals.user) {
        throw redirect(302, '/auth/login?redirectTo=/account'); // Redirect to login
    }

    let accountData: AccountPageData = {
        user: {} as AccountPageData['user'], // Initialize with a dummy type
        orders: [],
    };

    try {
        // Fetch account data (user details and orders) from your new API endpoint
        const response = await fetch('/api/account');

        if (!response.ok) {
            throw error(response.status, 'Failed to load account data.');
        }

        accountData = await response.json();

    } catch (e) {
        console.error('Error fetching account data in +page.server.ts:', e);
        if (e instanceof Error && 'status' in e && typeof e.status === 'number') {
            throw e;
        }
        throw error(500, 'An unexpected error occurred while loading your account data.');
    }

    return {
        user: locals.user, 
        accountUser: accountData.user,
        orders: accountData.orders,
    };
};