<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import Button from '$lib/layout/Button.svelte';
  import type { OrderWithItems } from '$lib/types'; // Import necessary types
  import { formatOrderStatus } from '$lib/common';
  import { getStatusColor } from '$lib/common';
  import { viewOrderDetails } from '$lib/common';

  let { data } = $props();

  // Reactive states for account details form
  let formName = $state(data.accountUser.name || '');
  let formEmail = $state(data.accountUser.email || '');
  let isUpdating = $state(false); // Loading state for update button

  // Reactive state for orders list
  const orders = $derived<OrderWithItems[]>(data.orders || []);

  async function handleSubmitUpdate(event: Event) {
    event.preventDefault();

    if (isUpdating) return;

    isUpdating = true;
    try {
      const response = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update account.');
      }

      const updatedUser = await response.json();
      alert('Account updated successfully!');
      // Invalidate the /api/account endpoint to refresh current user data
      await invalidateAll();
    } catch (error: any) {
      console.error('Error updating account:', error);
      alert(`Error: ${error.message}`);
    } finally {
      isUpdating = false;
    }
  }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold mb-8">My Account</h1>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-2xl font-bold mb-4">Account Details</h2>
      <form onsubmit={handleSubmitUpdate} class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" id="name" bind:value={formName} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" id="email" bind:value={formEmail} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
        </div>
        <Button type="submit" disabled={isUpdating} class="mt-4">
          {#if isUpdating}
            Saving...
          {:else}
            Update Account
          {/if}
        </Button>
      </form>
    </div>

    <div class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-2xl font-bold mb-4">My Orders</h2>
      {#if orders.length === 0}
        <p class="text-gray-600">You haven't placed any orders yet.</p>
        <Button onClick={() => goto('/')} class="mt-4">Start Shopping</Button>
      {:else}
        <div class="space-y-4">
          {#each orders as order (order.id)}
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition duration-200">
              <div class="flex justify-between items-center mb-2">
                <h3 class="text-lg font-semibold text-gray-800">Order #{order.id.slice(-8)}</h3>
                <span class={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                  {formatOrderStatus(order.status)}
                </span>
              </div>
              <p class="text-gray-700 text-sm mb-1">Date: {new Date(order.orderDate).toLocaleDateString()}</p>
              <p class="text-gray-700 text-sm mb-3">Total: <span class="font-bold">${order.totalAmount.toFixed(2)}</span> ({order.items.reduce((sum, item) => sum + item.quantity, 0)} items)</p>
              <Button onClick={() => viewOrderDetails(order.id)}>View Details</Button>
            </div>
          {/each}
          <p class="mt-4 text-center">
            <a href="/orders" class="text-indigo-600 hover:underline">View All Orders</a>
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>