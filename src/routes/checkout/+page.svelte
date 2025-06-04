<script lang="ts">
  import { goto } from '$app/navigation';
  import { invalidate } from '$app/navigation'; // For invalidating cart data after order
  import Button from '$lib/layout/Button.svelte';
  import type { CheckoutCartItem } from '$lib/types';
  import { OrderStatus } from '@prisma/client'; // Import OrderStatus enum if needed for display

  let { data } = $props();

  const cartItems = $state<CheckoutCartItem[]>(data.checkoutCartItems || []);
  const user = $state(data.user);

  let subtotal = $derived(
    cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  );

  let isPlacingOrder = $state(false); // State for loading indicator

  // Basic Address Form (for demonstration, can be expanded)
  let shippingAddress = $state({
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });

  let billingAddress = $state({
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });

  let sameAsShipping = $state(true);


  async function handlePlaceOrder() {
    if (isPlacingOrder) return;

    if (!user) {
        alert('You must be logged in to place an order.');
        goto('/auth/login?redirectTo=/checkout');
        return;
    }

    if (cartItems.length === 0) {
        alert('Your cart is empty. Please add items before placing an order.');
        goto('/');
        return;
    }

    if (!shippingAddress.address1 || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
        alert('Please fill in all required shipping address fields.');
        return;
    }

    if (!sameAsShipping && (!billingAddress.address1 || !billingAddress.city || !billingAddress.postalCode || !billingAddress.country)) {
        alert('Please fill in all required billing address fields, or check "Same as shipping address".');
        return;
    }

    isPlacingOrder = true;

    try {
        const orderDetails = {
            cartItems: cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                priceAtPurchase: item.product.price // Use the number here, API will handle Decimal conversion
            })),
            totalAmount: subtotal,
            shippingAddress: shippingAddress,
            billingAddress: sameAsShipping ? shippingAddress : billingAddress,
            // For simulated payment, status will be PAID immediately
            status: OrderStatus.PAID, 
            paymentIntentId: `simulated_payment_${Date.now()}` // Dummy ID
        };

        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderDetails)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to place order.');
        }

        const newOrder = await response.json();
        alert('Order placed successfully! Thank you for your purchase.');
        console.log('New Order:', newOrder);

        // Invalidate cart to clear it
        await invalidate('/api/cart'); 
        // Redirect to a confirmation page or user's order history
        goto(`/orders/${newOrder.id}`); // Assuming an order details page
    } catch (error: any) {
        console.error('Error placing order:', error);
        alert(`Error placing order: ${error.message}`);
    } finally {
        isPlacingOrder = false;
    }
  }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold mb-8">Checkout</h1>

  {#if cartItems.length === 0}
    <div class="text-center py-12">
      <p class="text-xl text-gray-600 mb-4">Your cart is empty. Please add items before checking out.</p>
      <Button onClick={() => goto('/')}>Continue Shopping</Button>
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 bg-white shadow-md rounded-lg p-6">
        <h2 class="text-2xl font-bold mb-4">Order Summary</h2>
        <div class="space-y-4">
          {#each cartItems as item (item.id)}
            <div class="flex items-center border-b pb-4 last:border-b-0 last:pb-0">
              <img src={item.product.imageUrl || 'https://via.placeholder.com/60x40?text=No+Image'} alt={item.product.name} class="w-16 h-12 object-cover rounded-md mr-4" />
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-800">{item.product.name}</h3>
                {#if item.product.category?.name}
                  <p class="text-gray-600 text-sm">Category: {item.product.category.name}</p>
                {/if}
                <p class="text-gray-700">Quantity: {item.quantity}</p>
              </div>
              <p class="text-indigo-600 font-bold">${(item.product.price * item.quantity).toFixed(2)}</p>
            </div>
          {/each}
        </div>
        <div class="mt-6 pt-4 border-t border-gray-200">
          <div class="flex justify-between items-center text-xl font-bold mb-2">
            <span>Total Items:</span>
            <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
          <div class="flex justify-between items-center text-2xl font-bold text-indigo-700">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-2xl font-bold mb-4">Shipping Information</h2>
        <div class="space-y-4">
            <div>
                <label for="address1" class="block text-sm font-medium text-gray-700">Address Line 1</label>
                <input type="text" id="address1" bind:value={shippingAddress.address1} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
            </div>
            <div>
                <label for="address2" class="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
                <input type="text" id="address2" bind:value={shippingAddress.address2} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="city" class="block text-sm font-medium text-gray-700">City</label>
                    <input type="text" id="city" bind:value={shippingAddress.city} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
                </div>
                <div>
                    <label for="state" class="block text-sm font-medium text-gray-700">State / Province</label>
                    <input type="text" id="state" bind:value={shippingAddress.state} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="postalCode" class="block text-sm font-medium text-gray-700">Postal Code</label>
                    <input type="text" id="postalCode" bind:value={shippingAddress.postalCode} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
                </div>
                <div>
                    <label for="country" class="block text-sm font-medium text-gray-700">Country</label>
                    <input type="text" id="country" bind:value={shippingAddress.country} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
                </div>
            </div>
        </div>

        <div class="mt-6">
            <h2 class="text-2xl font-bold mb-4">Payment Information</h2>
            <div class="flex items-center mb-4">
                <input type="checkbox" id="sameAsShipping" bind:checked={sameAsShipping} class="h-4 w-4 text-indigo-600 border-gray-300 rounded">
                <label for="sameAsShipping" class="ml-2 block text-sm text-gray-900">Billing address same as shipping</label>
            </div>

            {#if !sameAsShipping}
            <div class="space-y-4">
                <div>
                    <label for="billingAddress1" class="block text-sm font-medium text-gray-700">Billing Address Line 1</label>
                    <input type="text" id="billingAddress1" bind:value={billingAddress.address1} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
                </div>
                <div>
                    <label for="billingAddress2" class="block text-sm font-medium text-gray-700">Billing Address Line 2 (Optional)</label>
                    <input type="text" id="billingAddress2" bind:value={billingAddress.address2} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="billingCity" class="block text-sm font-medium text-gray-700">City</label>
                        <input type="text" id="billingCity" bind:value={billingAddress.city} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
                    </div>
                    <div>
                        <label for="billingState" class="block text-sm font-medium text-gray-700">State / Province</label>
                        <input type="text" id="billingState" bind:value={billingAddress.state} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="billingPostalCode" class="block text-sm font-medium text-gray-700">Postal Code</label>
                        <input type="text" id="billingPostalCode" bind:value={billingAddress.postalCode} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
                    </div>
                    <div>
                        <label for="billingCountry" class="block text-sm font-medium text-gray-700">Country</label>
                        <input type="text" id="billingCountry" bind:value={billingAddress.country} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
                    </div>
                </div>
            </div>
            {/if}

            <p class="text-sm text-gray-600 mt-4">
                Payment will be simulated. In a real application, you would integrate a payment gateway here.
            </p>
        </div>

        <Button onClick={handlePlaceOrder} class="mt-8" disabled={isPlacingOrder}>
          {#if isPlacingOrder}
            Placing Order...
          {:else}
            Place Order
          {/if}
        </Button>
      </div>
    </div>
  {/if}
</div>