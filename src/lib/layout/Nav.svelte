<script lang="ts">
	import { goto } from "$app/navigation";
  import { page } from "$app/state";
	import Button from "./Button.svelte";
  import { invalidateAll } from "$app/navigation";

  async function handleLogout() {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        // If your /api/auth/logout endpoint doesn't require a body or specific headers,
        // you might not need 'Content-Type'. Adjust as needed.
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // The logout endpoint should have cleared the cookie.
        // Invalidate all data to update the app state (including $page.data.user).
        await invalidateAll();
        // Navigate to the home page. This will also ensure UI updates.
        await goto('/'); 
      } else {
        console.error('Logout request failed:', await response.text());
        // Optionally, show an error message to the user
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally, show an error message to the user
    }
  }
</script>

<nav class="bg-gray-100 border-b border-gray-200 px-4 sm:px-6 lg:px-8">
  <div class="mx-auto max-w-7xl">
    <div class="flex h-16 items-center justify-between">
      <div class="flex-shrink-0">
        <a href={'/'} class="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
          EcomStore
        </a>
      </div>

      <div class="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
        {#if page.data.user}
          <span class="text-sm text-gray-600 hidden md:block">
            Hi, {page.data.user.name}!
          </span>
          <Button>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            
          </Button>
          <Button >Account</Button>
          <Button onClick={handleLogout}>Logout</Button>
        {:else}
          <Button style="submit" onClick={() => goto('/auth/login')}>Login</Button>
          <Button onClick={() => goto('/auth/register')}>Register</Button>
        {/if}
      </div>

      <div class="-mr-2 flex items-center sm:hidden">
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-md bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          aria-controls="mobile-menu"
          aria-expanded="false"
          onclick={() => {
            const menu = document.getElementById('mobile-menu');
            if (menu) {
              menu.classList.toggle('hidden');
              const expanded = menu.getAttribute('aria-expanded') === 'true' || false;
              menu.setAttribute('aria-expanded', (!expanded).toString());
            }
          }}
        >
          <span class="sr-only">Open main menu</span>
          <svg class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          <svg class="hidden h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <div class="hidden sm:hidden" id="mobile-menu">
    <div class="space-y-1 px-2 pb-3 pt-2">
      {#if page.data.user}
        <div class="block rounded-md px-3 py-2 text-base font-medium text-gray-700">
            Hi, {page.data.user.name || page.data.user.email}!
        </div>
        <a
          href={'/account'}
          class="block rounded-md bg-green-600 px-3 py-2 text-base font-medium text-white hover:bg-green-700 transition-colors"
        >
          Account
        </a>
        <form method="POST" action="/api/auth/logout" class="block">
          <button
            type="submit"
            class="w-full text-left block rounded-md bg-red-600 px-3 py-2 text-base font-medium text-white hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </form>
      {:else}
        <a
          href="/login"
          class="block rounded-md bg-sky-600 px-3 py-2 text-base font-medium text-white hover:bg-sky-700 transition-colors"
        >
          Login
        </a>
        <a
          href="/register"
          class="block rounded-md bg-amber-500 px-3 py-2 text-base font-medium text-gray-900 hover:bg-amber-600 transition-colors"
        >
          Register
        </a>
      {/if}
    </div>
  </div>
</nav>