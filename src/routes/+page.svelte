<script lang="ts">
  let { data } = $props();
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-8">Our Products</h1>
  
  {#each data.categories as category}
    <div class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">{category.name}</h2>
      {#if category.description}
        <p class="text-gray-600 mb-6">{category.description}</p>
      {/if}
      
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {#each category.products as product}
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          {#if product.imageUrl}
            <a href={`/product/${product.id}`} aria-label={`View details for ${product.name}`}>
              <img
                src={product.imageUrl}
                alt={product.name}
                class="w-full h-48 object-cover hover:opacity-90 transition-opacity duration-200"
              />
            </a>
          {:else}
            <a href={`/product/${product.id}`} aria-label={`View details for ${product.name}`} class="w-full h-48 bg-gray-200 flex items-center justify-center">
               <span class="text-gray-500">No image</span>
            </a>
          {/if}
          <div class="p-4">
            <h3 class="text-lg font-semibold mb-2">
              <a href={`/product/${product.id}`} class="hover:underline focus:underline focus:outline-none">
                {product.name}
              </a>
            </h3>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">
              {product.description || 'No description available'}
            </p>
            <div class="flex justify-between items-center">
              <span class="text-lg font-bold text-gray-800">${product.price.toString()}</span>
              <button
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onclick={() => { /* Add your Add to Cart logic here, e.g., dispatch('addToCart', product) */ }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
        {/each}
      </div>
    </div>
  {/each}
</div>
