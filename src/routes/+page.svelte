<script lang="ts">
  import type { PageData } from './$types';
  
  export let data: PageData;
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
              <img 
                src={product.imageUrl} 
                alt={product.name}
                class="w-full h-48 object-cover"
              />
            {/if}
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-2">{product.name}</h3>
              <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                {product.description || 'No description available'}
              </p>
              <div class="flex justify-between items-center">
                <span class="text-lg font-bold">${product.price.toString()}</span>
                <button 
                  class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
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
