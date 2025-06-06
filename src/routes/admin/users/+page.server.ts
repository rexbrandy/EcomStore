import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { PaginatedUsersResponse } from '$lib/types';

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';
    const searchTerm = url.searchParams.get('search') || '';

    let usersResponse: PaginatedUsersResponse = {
        users: [],
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
    };

    try {
        const usersApiUrl = `/api/admin/users?page=${page}&limit=${limit}&search=${searchTerm}`;
        
        const usersFetchResponse = await fetch(usersApiUrl);
        if (!usersFetchResponse.ok) {
            throw error(usersFetchResponse.status, 'Failed to fetch users for admin.');
        }
        usersResponse = await usersFetchResponse.json();

    } catch (e) {
        console.error('Error fetching admin users:', e);
        if (e instanceof Error && 'status' in e && typeof e.status === 'number') {
            throw e;
        }
        throw error(500, 'Could not load admin user data.');
    }

    return {
        users: usersResponse.users,
        currentPage: usersResponse.currentPage,
        totalPages: usersResponse.totalPages,
        totalUsers: usersResponse.totalUsers,
        searchTerm: searchTerm,
        user: locals.user
    };
};