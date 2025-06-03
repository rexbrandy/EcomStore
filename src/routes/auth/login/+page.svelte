<script lang="ts">
  import Button from "$lib/layout/Button.svelte";
  import { goto } from "$app/navigation";
	import { invalidateAll } from "$app/navigation";

  let isLoading = $state(false);
  let errorMessage = $state<string | null>(null);

  let form = $state({
    email: '',
    password: '',
  });

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault(); // Prevent default HTML form submission
    isLoading = true;
    errorMessage = null;

    const formData = new FormData();
    formData.append('email', form.email);
    formData.append('password', form.password);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: formData, // Send as FormData
      });

      const responseData = await response.json();

      if (response.ok) { // Status code 200-299
        // Login was successful
        // The cookie is set by the server, and hooks.server.ts will update locals.user.
        // Invalidate all loaded data to ensure UI reflects the new authentication state.
        await invalidateAll();
        // Navigate to the homepage or dashboard.
        await goto('/', { replaceState: true });
      } else {
        // Server returned an error (4xx, 5xx)
        // Your endpoint should return a JSON like { message: "Error details" }
        errorMessage = responseData.message || 'Login failed. Please check your credentials.';
      }
    } catch (error: any) {
      console.error('Login fetch error:', error);
      errorMessage = error.message || 'An unexpected network error occurred. Please try again.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
  <div class="w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded-lg">
    <h1 class="text-2xl font-bold text-center text-gray-700">Login</h1>
    <form onsubmit={handleSubmit} class="space-y-6">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          autocomplete="email"
          bind:value={form.email}
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autocomplete="current-password"
          bind:value={form.password}
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="••••••••"
        />
      </div>

      {#if errorMessage}
        <p class="text-sm text-red-600">{errorMessage}</p>
      {/if}

      <div>
        <Button type="submit" disabled={isLoading} class="w-full">
          {#if isLoading}
            Processing...
          {:else}
            Sign in
          {/if}
        </Button>
      </div>
    </form>
  </div>
</div>
