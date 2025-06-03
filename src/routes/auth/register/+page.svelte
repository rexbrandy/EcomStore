<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation'; // To redirect to login or show a link
  import type { SubmitFunction } from '@sveltejs/kit';

  // Component props (optional, if you want to customize messages or redirection from parent)
  // export let redirectToLoginAfterSuccess = true; // Example prop

  let isLoading = $state(false);
  let errorMessage = $state<string | null>(null);
  let successMessage = $state<string | null>(null);

  let form = $state({
    name: '',
    email: '',
    password: '',
    confirmPassword: '' // Added for client-side confirmation
  });

  const handleRegistration: SubmitFunction = async () => {
    isLoading = true;
    errorMessage = null;
    successMessage = null;

    if (form.password !== form.confirmPassword) {
      errorMessage = 'Passwords do not match.';
      isLoading = false;
      return ({ update }) => { 
        update({ reset: false }); // Don't reset form if client-side validation fails
      };
    }

    // The actual submission will be handled by `enhance`.
    // We only need to define the callback for when the submission is complete.
    return async ({ result, update }) => {
      isLoading = false;
      console.log(result)

      if (result.type === 'failure') {
        // `result.data` should contain the error object from `error(status, message)`
        errorMessage = result.data?.message || 'Registration failed. Please try again.';
        update({ reset: false }); // Don't reset form on failure
      } else if (result.type === 'success') {
        goto('/auth/login'); 
        update({ reset: true }); // Reset the form fields
      } else if (result.type === 'error') {
        // This handles unexpected errors during the fetch itself, not application errors from the server
        errorMessage = result.error?.message || 'An unexpected error occurred. Please try again.';
        update({ reset: false });
      }
    };
  };
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
  <div class="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-lg">
    <h2 class="text-3xl font-extrabold text-center text-gray-800">Create your Account</h2>

    <form
      method="POST"
      action="/api/auth/register"
      use:enhance={handleRegistration}
      class="space-y-6"
    >
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          bind:value={form.name}
          class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Your Name"
        />
      </div>

      <div>
        <label for="email-register" class="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email-register"
          name="email"
          type="email"
          autocomplete="email"
          bind:value={form.email}
          required
          class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label for="password-register" class="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password-register"
          name="password"
          type="password"
          autocomplete="new-password"
          bind:value={form.password}
          required
          minlength="8"
          class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="•••••••• (min. 8 characters)"
        />
      </div>

       <div>
        <label for="confirm-password-register" class="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          id="confirm-password-register"
          name="confirmPassword"
          type="password"
          autocomplete="new-password"
          bind:value={form.confirmPassword}
          required
          minlength="8"
          class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="••••••••"
        />
      </div>

      {#if errorMessage}
        <div
          class="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm"
          role="alert"
        >
          <p>{errorMessage}</p>
        </div>
      {/if}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if isLoading}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          {:else}
            Create Account
          {/if}
        </button>
      </div>
    </form>

    <p class="mt-6 text-center text-sm text-gray-600">
      Already have an account?
      <a href="/auth/login" class="font-medium text-indigo-600 hover:text-indigo-500">
        Sign in
      </a>
    </p>
  </div>
</div>

<style>
</style>