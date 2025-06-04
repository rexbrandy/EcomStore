<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/layout/Button.svelte';
  import type { CartItemWithProduct } from '$lib/types';
  import { invalidateAll } from '$app/navigation';

  let { data } = $props();

  const cartItems = $state<CartItemWithProduct[]>(data.cartItems || []);

  let subtotal = $derived(
    cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  );

  let totalItems = $derived(cartItems.length);

  async function updateQuantity(cartItemId: string, newQuantity: number) {
    if (newQuantity <= 0) {
      // If new quantity is 0 or less, remove the item
      await removeCartItem(cartItemId);
      return;
    }

    const itemToUpdate = cartItems.find(item => item.id === cartItemId);
    if (!itemToUpdate) return;

    if (itemToUpdate.product.stockQuantity < newQuantity) {
        alert(`Not enough stock for ${itemToUpdate.product.name}. Available: ${itemToUpdate.product.stockQuantity}`);
        return;
    }

    try {
      // Use the PUT endpoint for direct quantity updates
      const response = await fetch(`/api/cart/${cartItemId}`, { // Note: endpoint is /api/cart/[itemId]
        method: 'PUT', // Changed from PATCH to PUT
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update quantity.');
      }

      await invalidateAll(); // Re-fetch the cart data
    } catch (error: any) {
      console.error('Error updating cart item quantity:', error);
      alert(`Error: ${error.message}`);
    }
  }

  async function removeCartItem(cartItemId: string) {
    if (!confirm('Are you sure you want to remove this item from your cart?')) {
      return;
    }

    try {
      // Use the DELETE /api/cart/[itemId] endpoint
      const response = await fetch(`/api/cart/${cartItemId}`, { // Note: endpoint is /api/cart/[itemId]
        method: 'DELETE', 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove item from cart.');
      }

      await invalidateAll();; // Re-fetch the cart data
    } catch (error: any) {
      console.error('Error removing cart item:', error);
      alert(`Error: ${error.message}`);
    }
  }

  async function clearCart() {
    if (!confirm('Are you sure you want to clear your entire cart? This action cannot be undone.')) {
      return;
    }

    try {
      // Use the DELETE /api/cart endpoint
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to clear cart.');
      }

      await invalidateAll();; // Re-fetch the cart data
      alert('Your cart has been cleared!');
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      alert(`Error: ${error.message}`);
    }
  }

</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold mb-8">Your Shopping Cart</h1>

  {#if cartItems.length === 0}
    <div class="text-center py-12">
      <p class="text-xl text-gray-600 mb-4">Your cart is empty.</p>
      <Button onClick={() => goto('/')}>Continue Shopping</Button>
    </div>
  {:else}
    <div class="bg-white shadow-md rounded-lg p-6 mb-8">
      <div class="space-y-4">
        {#each cartItems as item (item.id)}
          <div class="flex items-center border-b pb-4 last:border-b-0 last:pb-0">
            <img src={item.product.imageUrl || 'https://via.placeholder.com/100x70?text=No+Image'} alt={item.product.name} class="w-20 h-14 object-cover rounded-md mr-4" />
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-800">{item.product.name}</h3>
              {#if item.product.category?.name}
                <p class="text-gray-600 text-sm">Category: {item.product.category.name}</p>
              {/if}
              <p class="text-indigo-600 font-bold">${(item.product.price * item.quantity).toFixed(2)}</p>
            </div>
            <div class="flex items-center space-x-2">
              <Button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</Button>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onchange={(e) => updateQuantity(item.id, parseInt((e.target as HTMLInputElement).value) || 1)}
                class="w-16 text-center border rounded-md p-1"
              />
              <Button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.product.stockQuantity}>+</Button>
              <Button style="error" onClick={() => removeCartItem(item.id)}>Remove</Button>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="bg-white shadow-md rounded-lg p-6">
      <div class="flex justify-between items-center text-xl font-bold mb-4">
        <span>Total Items:</span>
        <span>{totalItems}</span>
      </div>
      <div class="flex justify-between items-center text-2xl font-bold text-indigo-700 mb-6">
        <span>Subtotal:</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div class="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => goto('/checkout')}>Proceed to Checkout</Button>
        <Button style="warning" onClick={clearCart}>Clear Cart</Button>
      </div>
    </div>
  {/if}
</div>