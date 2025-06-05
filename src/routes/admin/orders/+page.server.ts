// src/routes/admin/orders/+page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { PaginatedOrdersResponse } from '$lib/types'; // Import the new type
import { OrderStatus } from '@prisma/client'; // Import OrderStatus enum for filters

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
    // Authorization is handled by src/routes/admin/+layout.server.ts

    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';
    const statusFilter = url.searchParams.get('status') || '';
    const searchTerm = url.searchParams.get('search') || '';

    let ordersResponse: PaginatedOrdersResponse = {
        orders: [],
        currentPage: 1,
        totalPages: 1,
        totalOrders: 0,
    };

    try {
        // Construct the URL for fetching orders with all admin query parameters
        const ordersApiUrl = `/api/orders?page=${page}&limit=${limit}&status=${statusFilter}&search=${searchTerm}`;
        
        // Fetch orders using the enhanced GET /api/orders endpoint
        const ordersFetchResponse = await fetch(ordersApiUrl);
        if (!ordersFetchResponse.ok) {
            throw error(ordersFetchResponse.status, 'Failed to fetch orders for admin.');
        }
        ordersResponse = await ordersFetchResponse.json();

    } catch (e) {
        console.error('Error fetching admin orders:', e);
        if (e instanceof Error && 'status' in e && typeof e.status === 'number') {
            throw e;
        }
        throw error(500, 'Could not load admin order data.');
    }

    return {
        // Pass all fetched data and current query parameters back to the page
        orders: ordersResponse.orders,
        currentPage: ordersResponse.currentPage,
        totalPages: ordersResponse.totalPages,
        totalOrders: ordersResponse.totalOrders,
        statusFilter: statusFilter,
        searchTerm: searchTerm,
        // Make OrderStatus enum available to the client for the filter dropdown
        orderStatuses: Object.values(OrderStatus), 
        user: locals.user // Pass user data from layout load if needed
    };
};