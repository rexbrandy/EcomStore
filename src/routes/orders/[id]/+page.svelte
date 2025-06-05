<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/layout/Button.svelte';
  import type { OrderWithItems } from '$lib/types';
  import { OrderStatus } from '@prisma/client';
  import { formatOrderStatus } from '$lib/common';

  let { data } = $props();

  const order = $derived<OrderWithItems>(data.order);

  // CORRECTED: No JSON.parse() needed here. Prisma already deserializes it.
  let shippingAddressParsed = $derived(order?.shippingAddress || null); 
  let billingAddressParsed = $derived(order?.billingAddress || null); 

  function formatAddress(address: any) {
    if (!address) return 'N/A';
    // Ensure address properties exist, as they might be optional in your JSON schema
    return `
      ${address.address1 || ''}
      ${address.address2 ? address.address2 + '\n' : ''}
      ${address.city || ''}, ${address.state || ''} ${address.postalCode || ''}
      ${address.country || ''}
    `.trim();
  }

  let statusColor = $derived(() => {
    switch (order?.status) {
      case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.PAID: return 'bg-green-100 text-green-800';
      case OrderStatus.PROCESSING: return 'bg-blue-100 text-blue-800';
      case OrderStatus.SHIPPED: return 'bg-indigo-100 text-indigo-800';
      case OrderStatus.DELIVERED: return 'bg-purple-100 text-purple-800';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-800';
      case OrderStatus.REFUNDED: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  });

  function handleReorder() {
    alert('Reordering functionality not implemented yet!');
  }
</script>

<div class="container mx-auto px-4 py-8">
  {#if order}
    <h1 class="text-4xl font-bold mb-6">Order Details #<span class="text-indigo-600">{order.id.slice(-8)}</span></h1>
    
    <div class="bg-white shadow-md rounded-lg p-6 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-800 mb-2">Order Information</h2>
          <p class="text-gray-700">Order Date: {new Date(order.orderDate).toLocaleDateString()}</p>
          <p class="text-gray-700">Total Amount: <span class="font-bold text-2xl text-indigo-700">${Number(order.totalAmount).toFixed(2)}</span></p>
          <p class="text-gray-700">Status: 
            <span class={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
              {formatOrderStatus(order.status)}
            </span>
          </p>
          {#if order.paymentIntentId}
            <p class="text-gray-700 text-sm">Payment ID: {order.paymentIntentId}</p>
          {/if}
        </div>
        <div>
          <h2 class="text-xl font-semibold text-gray-800 mb-2">Customer Information</h2>
          <p class="text-gray-700">Name: {order.user.name}</p>
          <p class="text-700">Email: {order.user.email}</p>
        </div>
      </div>

      <h2 class="text-xl font-semibold text-gray-800 mb-4">Shipping Address</h2>
      <pre class="bg-gray-50 p-4 rounded-md text-gray-700 text-sm mb-6">{formatAddress(shippingAddressParsed)}</pre>

      {#if billingAddressParsed && JSON.stringify(shippingAddressParsed) !== JSON.stringify(billingAddressParsed)}
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Billing Address</h2>
        <pre class="bg-gray-50 p-4 rounded-md text-gray-700 text-sm mb-6">{formatAddress(billingAddressParsed)}</pre>
      {/if}

      <h2 class="text-xl font-semibold text-gray-800 mb-4">Items</h2>
      <div class="space-y-4">
        {#each order.items as item (item.id)}
          <div class="flex items-center border-b pb-4 last:border-b-0 last:pb-0">
            <img src={item.product.imageUrl || 'https://via.placeholder.com/60x40?text=No+Image'} alt={item.product.name} class="w-16 h-12 object-cover rounded-md mr-4" />
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-800">{item.product.name}</h3>
              {#if item.product.description}
                <p class="text-gray-600 text-sm">{item.product.description}</p>
              {/if}
              <p class="text-gray-700">Quantity: {item.quantity}</p>
              <p class="text-gray-700">Price at Purchase: ${Number(item.priceAtPurchase).toFixed(2)}</p>
            </div>
            <p class="text-indigo-600 font-bold">${Number(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
          </div>
        {/each}
      </div>

      <div class="mt-8 flex justify-end">
        <Button onClick={handleReorder}>Reorder This Order</Button>
      </div>
    </div>
  {:else if data.user}
    <div class="text-center py-12">
      <p class="text-xl text-gray-600 mb-4">Order not found or you don't have permission to view it.</p>
      <Button onClick={() => goto('/orders')}>View All Orders</Button>
    </div>
  {:else}
    <div class="text-center py-12">
      <p class="text-xl text-gray-600 mb-4">You need to log in to view this order.</p>
      <Button onClick={() => goto(`/auth/login?redirectTo=/orders/`)}>Log In</Button>
    </div>
  {/if}
</div>