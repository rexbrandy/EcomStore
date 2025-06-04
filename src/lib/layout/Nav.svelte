<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from './Button.svelte';
  import type { Product } from '@prisma/client';

  // We now receive the entire `data` object from +layout.svelte
  let { user, cartItems } = $props(); // Destructure both user and cartItems
  // Derived state for total cart quantity
  let totalCartQuantity = $derived(cartItems.length);

  function handleLogout() {
    fetch('/api/auth/logout', { method: 'POST' })
      .then(() => {
        goto('/auth/login');
      })
      .catch(error => {
        console.error('Logout failed:', error);
      });
  }

  function handleViewCart() {
    goto('/cart'); // Assuming you'll create a /cart page later
  }
</script>

<nav class="bg-white shadow">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 justify-between">
      <div class="flex items-center">
        <a href="/" class="text-xl font-bold text-gray-900">Ecom Store</a>
      </div>
      <div class="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
        {#if user}
          <span class="text-sm text-gray-600 hidden md:block">
            Hi, {user.name}!
          </span>
          
          <Button onClick={handleViewCart} class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            {#if totalCartQuantity > 0}
              <span class="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                {totalCartQuantity}
              </span>
            {/if}
          </Button>

          <Button>Account</Button>
          <Button onClick={handleLogout}>Logout</Button>
        {:else}
          <Button style="submit" onClick={() => goto('/auth/login')}>Login</Button>
          <Button onClick={() => goto('/auth/register')}>Register</Button>
        {/if}
      </div>
    </div>
  </div>
</nav>