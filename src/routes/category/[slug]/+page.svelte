<script lang="ts">
  import ProductCard from '$lib/layout/ProductCard.svelte'; // Adjust this path if needed

  // This `data` prop will contain what's returned from +page.server.ts:
  // `{ category: { id, name, slug, description, products: [...] } }`
  let { data } = $props();

  // You can destructure data.category for easier access if you prefer:
  // const { category } = data; 
  // const { name, description, products } = category;

  // console.log('Category data in +page.svelte:', data.category);
</script>

<div class="container mx-auto px-4 py-8">
  {#if data.category}
    <h1 class="text-4xl font-extrabold text-gray-900 mb-4">
      {data.category.name}
    </h1>
    {#if data.category.description}
      <p class="text-lg text-gray-700 mb-8">{data.category.description}</p>
    {/if}

    <h2 class="text-3xl font-bold text-gray-800 mb-6">Products in this Category</h2>

    {#if data.category.products && data.category.products.length > 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {#each data.category.products as product (product.id)}
          <ProductCard
            id={product.id}
            name={product.name}
            description={product.description}
            price={product.price}
            imageUrl={product.imageUrl}
            stockQuantity={product.stockQuantity}
            category={data.category}
            user={data.user} />
        {/each}
      </div>
    {:else}
      <p class="text-gray-600 text-lg">No products found in this category yet.</p>
    {/if}
  {:else}
    <p class="text-xl text-red-600">Failed to load category data.</p>
    {/if}
</div>