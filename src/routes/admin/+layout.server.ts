import { redirect, error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
    // 1. Check if user is logged in
    if (!locals.user) {
        // If not logged in, redirect to login page
        // Include 'redirectTo' query parameter so user is sent back after login
        throw redirect(302, `/auth/login?redirectTo=${url.pathname}`);
    }

    // 2. Check if user is an admin
    if (!locals.user.isAdmin) {
        // If logged in but not admin, throw a 403 Forbidden error
        // SvelteKit will then try to render your src/routes/+error.svelte page
        throw error(403, 'Forbidden: You do not have administrative access.');
    }

    // If logged in and is admin, return the user data
    return {
        user: locals.user // Make user data available to child admin layouts/pages
    };
};