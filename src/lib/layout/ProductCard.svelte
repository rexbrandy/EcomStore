<script lang="ts">
  import Button from "./Button.svelte";
  import { invalidateAll } from "$app/navigation";
  
  let {
    id,
    name,
    description = "No description available.",
    price,
    imageUrl,
    stockQuantity = 0,
    category,
    user
  } = $props();


  let stockStatusText = $derived(stockQuantity > 0 ? (stockQuantity < 10 ? `Low stock (${stockQuantity})` : 'In Stock') : 'Out of Stock');
  let stockStatusColor = $derived(stockQuantity > 0 ? (stockQuantity < 10 ? 'text-yellow-600' : 'text-green-600') : 'text-red-600');
  let defaultImageUrl = "https://via.placeholder.com/300x200?text=No+Image";

  async function handleAddToCart() {
    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: id,
                quantity: 1 // Adding one item at a time with this button
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add item to cart.');
        }

        const result = await response.json();
        await invalidateAll();
        alert(`${name} added to cart! Quantity: ${result.quantity}`);
    } catch (error: any) {
        console.error('Error adding to cart:', error);
        alert(`Error: ${error.message}`);
    }
  }
</script>

<div class="product-card border border-gray-200 rounded-lg shadow-lg overflow-hidden max-w-sm bg-white hover:shadow-xl transition-shadow duration-300 ease-in-out">
  <div class="relative pb-[66.66%]">
    <img
      src={imageUrl || defaultImageUrl}
      alt={"Image of " + name}
      class="absolute top-0 left-0 w-full h-full object-cover"
      loading="lazy"
    />
  </div>

  <div class="p-4">
    <span class="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded mb-2">
      {category.name}
    </span>
    <h3 class="text-xl font-semibold mb-2 text-gray-800 truncate" title={name}>
      <a href="/product/{id}">{name}</a>
    </h3>

    {#if description}
      <p class="text-gray-600 text-sm mb-3 h-10 overflow-hidden text-ellipsis">
        {description}
      </p>
    {/if}

    <div class="flex justify-between items-center mb-3">
      <p class="text-2xl font-bold text-indigo-600">
        ${price}
      </p>
      <p class={`text-sm font-medium ${stockStatusColor}`}>
        {stockStatusText}
      </p>
    </div>
    {#if user}
      <Button
        style="submit"
        disabled={stockQuantity === 0}
        onClick={handleAddToCart}
      >
        {stockQuantity > 0 ? 'Add to Cart' : 'Notify Me'}
      </Button>
    {:else}
      <a href="/auth/login" class="text-gray-600">Log in to shop</a>
    {/if}
  </div>
</div>