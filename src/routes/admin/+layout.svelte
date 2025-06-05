<script lang="ts">
  import '../../app.css'; // Your global CSS
  import AdminNav from '$lib/layout/AdminNav.svelte'; // We'll create this next
  import { page } from '$app/state'; // To get current path for active links

  let { children, data } = $props();
</script>

<div class="flex h-screen bg-gray-100">
  <AdminNav user={data.user} currentPath={page.url.pathname}/>

  <div class="flex-1 flex flex-col overflow-hidden">
    <header class="w-full bg-white shadow py-4 px-6 md:hidden">
      <h1 class="text-xl font-bold text-gray-800">Admin Dashboard</h1>
    </header>

    <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
      {@render children()}
    </main>
  </div>
</div>