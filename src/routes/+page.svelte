<script lang="ts">
  // `data` here will contain `{ categories: [...] }` from +page.server.ts
  let { data } = $props();

  // You can inspect the data received
  // console.log('Categories data in +page.svelte:', data.categories);
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-8">Welcome to Ecom Store</h1>

  <h2 class="text-2xl font-semibold mb-4">Shop by Category</h2>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {#if data.categories && data.categories.length > 0}
      {#each data.categories as category (category.id)}
        <a href={`/category/${category.slug}`} class="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
          <h3 class="text-xl font-bold text-gray-800 mb-2">{category.name}</h3>
          {#if category.description}
            <p class="text-gray-600 text-sm">{category.description}</p>
          {:else}
            <p class="text-gray-500 text-sm italic">No description available.</p>
          {/if}
        </a>
      {/each}
    {:else}
      <p class="text-gray-600 col-span-full">No categories found at the moment.</p>
    {/if}
  </div>
</div>