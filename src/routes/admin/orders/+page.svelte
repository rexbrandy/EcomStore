<script lang="ts">
  import { invalidate, goto } from '$app/navigation';
  import Button from '$lib/layout/Button.svelte';
  import type { AdminOrder } from '$lib/types';
  import { page } from '$app/state';
  import { OrderStatus } from '@prisma/client';
	import { getStatusColor, formatOrderStatus, viewOrderDetails } from '$lib/common.js';

  let { data } = $props();

  let orders = $state<AdminOrder[]>(data.orders);
  let currentPage = $state(data.currentPage);
  let totalPages = $state(data.totalPages);
  let totalOrders = $state(data.totalOrders);
  let statusFilter = $state(data.statusFilter);
  let searchTerm = $state(data.searchTerm);
  let orderStatuses = $state(data.orderStatuses);

  let showUpdateStatusModal = $state(false);
  let selectedOrderIdForStatus: string | null = $state(null);
  let selectedOrderCurrentStatus: OrderStatus | null = $state(null);
  let newOrderStatus: OrderStatus | null = $state(null);
  let isUpdatingStatus = $state(false);


  $effect(() => {
    orders = data.orders;
    currentPage = data.currentPage;
    totalPages = data.totalPages;
    totalOrders = data.totalOrders;
    statusFilter = data.statusFilter;
    searchTerm = data.searchTerm;
    orderStatuses = data.orderStatuses;
  });


  function applyFiltersAndPagination(pageToLoad: number = 1) {
    const searchParams = new URLSearchParams(page.url.searchParams);
    searchParams.set('page', pageToLoad.toString());
    if (searchTerm) searchParams.set('search', searchTerm); else searchParams.delete('search');
    if (statusFilter) searchParams.set('status', statusFilter); else searchParams.delete('status');
    
    goto(`/admin/orders?${searchParams.toString()}`);
  }

  function goToPage(pageNumber: number) {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      applyFiltersAndPagination(pageNumber);
    }
  }

  function handleSearchKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      applyFiltersAndPagination();
    }
  }

  function openUpdateStatusModal(orderId: string, currentStatus: OrderStatus) {
    selectedOrderIdForStatus = orderId;
    selectedOrderCurrentStatus = currentStatus;
    newOrderStatus = currentStatus;
    showUpdateStatusModal = true;
  }

  function closeUpdateStatusModal() {
    showUpdateStatusModal = false;
    selectedOrderIdForStatus = null;
    selectedOrderCurrentStatus = null;
    newOrderStatus = null;
  }

  async function handleSubmitUpdateStatus() {
    if (!selectedOrderIdForStatus || !newOrderStatus || isUpdatingStatus) return;

    isUpdatingStatus = true;
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrderIdForStatus}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newOrderStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order status.');
      }

      alert('Order status updated successfully!');
      closeUpdateStatusModal();
      await invalidate('/api/orders');
    } catch (error: any) {
      console.error('Error updating order status:', error);
      alert(`Error: ${error.message}`);
    } finally {
      isUpdatingStatus = false;
    }
  }
</script>

<div class="p-6 bg-white rounded-lg shadow-md">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Manage Orders ({totalOrders} total)</h1>
  </div>

  <div class="mb-6 bg-gray-50 p-4 rounded-lg flex flex-wrap gap-4 items-end">
    <div class="flex-1 min-w-[200px]">
      <label for="search" class="block text-sm font-medium text-gray-700">Search Orders</label>
      <input
        type="text"
        id="search"
        bind:value={searchTerm}
        onkeydown={handleSearchKeyDown}
        placeholder="Order ID, Customer Email/Name"
        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
      />
    </div>
    <div class="flex-1 min-w-[150px]">
      <label for="statusFilter" class="block text-sm font-medium text-gray-700">Filter by Status</label>
      <select id="statusFilter" bind:value={statusFilter} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
        <option value="">All Statuses</option>
        {#each orderStatuses as status}
          <option value={status}>{formatOrderStatus(status)}</option>
        {/each}
      </select>
    </div>
    <div>
      <Button style="submit" onClick={() => applyFiltersAndPagination()}>Apply Filters</Button>
    </div>
    <div>
      <Button style="secondary" onClick={() => {
        searchTerm = '';
        statusFilter = '';
        applyFiltersAndPagination();
      }}>Reset Filters</Button>
    </div>
  </div>

  <div class="overflow-x-auto">
    <table class="min-w-full bg-white border border-gray-200 rounded-lg">
      <thead>
        <tr class="bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
          <th class="py-3 px-4 border-b">Order ID</th>
          <th class="py-3 px-4 border-b">Customer</th>
          <th class="py-3 px-4 border-b">Date</th>
          <th class="py-3 px-4 border-b">Total</th>
          <th class="py-3 px-4 border-b">Status</th>
          <th class="py-3 px-4 border-b">Items</th>
          <th class="py-3 px-4 border-b">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#if orders.length === 0}
          <tr>
            <td colspan="7" class="py-4 text-center text-gray-500">No orders found matching your criteria.</td>
          </tr>
        {:else}
          {#each orders as order (order.id)}
            <tr class="hover:bg-gray-50 border-b last:border-b-0">
              <td class="py-3 px-4 text-sm text-gray-800 truncate" title={order.id}>{order.id.slice(0, 8)}...</td>
              <td class="py-3 px-4 text-sm text-gray-800">{order.user.name || order.user.email}</td>
              <td class="py-3 px-4 text-sm text-gray-700">{new Date(order.orderDate).toLocaleDateString()}</td>
              <td class="py-3 px-4 text-sm text-gray-800 font-medium">${Number(order.totalAmount).toFixed(2)}</td>
              <td class="py-3 px-4">
                <span class={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                  {formatOrderStatus(order.status)}
                </span>
              </td>
              <td class="py-3 px-4 text-sm text-gray-700">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
              <td class="py-3 px-4 space-x-2 flex">
                <Button style="submit" onClick={() => viewOrderDetails(order.id)}>View</Button>
                <Button style="secondary" onClick={() => openUpdateStatusModal(order.id, order.status)}>Update Status</Button>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  {#if totalPages > 1}
    <div class="mt-6 flex justify-between items-center">
      <Button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>Previous</Button>
      <span class="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
      <Button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>Next</Button>
    </div>
  {/if}
</div>

<!-- Update Status Modal -->
{#if showUpdateStatusModal}
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Update Order Status</h2>
      <form onsubmit={handleSubmitUpdateStatus} class="space-y-4">
        <p class="text-gray-700 mb-4">Order ID: <span class="font-semibold">{selectedOrderIdForStatus?.slice(-8)}</span></p>
        <p class="text-gray-700 mb-4">Current Status: 
          <span class={`px-2 py-1 rounded-full text-sm font-semibold ${selectedOrderCurrentStatus ? getStatusColor(selectedOrderCurrentStatus) : 'bg-gray-200'}`}>
            {selectedOrderCurrentStatus ? formatOrderStatus(selectedOrderCurrentStatus) : 'N/A'}
          </span>
        </p>
        
        <div>
          <label for="newStatus" class="block text-sm font-medium text-gray-700">New Status</label>
          <select id="newStatus" bind:value={newOrderStatus} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            {#each orderStatuses as status}
              <option value={status}>{formatOrderStatus(status)}</option>
            {/each}
          </select>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <Button style="secondary" type="button" onClick={closeUpdateStatusModal} disabled={isUpdatingStatus}>Cancel</Button>
          <Button style="submit" type="submit" disabled={isUpdatingStatus}>
            {#if isUpdatingStatus}
              Updating...
            {:else}
              Save Changes
            {/if}
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}