<script lang="ts">
  import { page } from '$app/state'; 
  import { goto } from '$app/navigation';
  import Button from '$lib/layout/Button.svelte';

  const status = $derived(page.status);
  const message = $derived(page.error?.message);

  let title = $derived.by(() => {
    if (status === 404) return 'Page Not Found';
    if (status === 403) return 'Access Denied';
    if (status >= 500) return 'Server Error';
    return 'An Error Occurred';
  });

  let description = $derived.by(() => {
    if (status === 404) return 'The page you are looking for does not exist or has been moved.';
    if (status === 403) return 'You do not have permission to view this content.';
    if (status >= 500) return 'Something went wrong on our end. Please try again later.';
    return message || 'We encountered an unexpected problem.';
  });
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 p-4 text-center">
  <div class="bg-white shadow-xl rounded-lg p-8 max-w-lg w-full space-y-6">
    <h1 class="text-6xl font-extrabold text-indigo-600">{status}</h1>
    <h2 class="text-3xl font-bold text-gray-800">{title}</h2>
    <p class="text-lg text-gray-600">{description}</p>

    {#if message && status >= 500}
      <p class="text-sm text-red-500 mt-4">Error Details: {message}</p>
    {/if}

    <div class="mt-8">
      <Button
        onClick={() => goto('/')}
        style="submit"
      >
        Go to Homepage
      </Button>
      <Button
        onClick={() => window.location.reload()}
        style="secondary"
      >
        Reload Page
      </Button>
    </div>
  </div>
</div>

<style>
</style>