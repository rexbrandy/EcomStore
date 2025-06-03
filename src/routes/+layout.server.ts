import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    // locals.user is populated by your hooks.server.ts after a successful login
    // and cookie validation.
    
    // Returning it here makes it available as $page.data.user 
    // (or however your specific page store exposes it, e.g., page.data.user)
    // in all your Svelte components.
    return {
        user: locals.user 
    };
};