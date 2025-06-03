<script>
  import Button from "./Button.svelte";
  
  let {
    id,
    name,
    description = "No description available.", // Default description
    price,
    imageUrl,
    stockQuantity = 0, // Default stock quantity
    // createdAt, // Not typically displayed on a product card
    // updatedAt, // Not typically displayed on a product card
    category
  } = $props();


  let stockStatusText = $derived(stockQuantity > 0 ? (stockQuantity < 10 ? `Low stock (${stockQuantity})` : 'In Stock') : 'Out of Stock');
  let stockStatusColor = $derived(stockQuantity > 0 ? (stockQuantity < 10 ? 'text-yellow-600' : 'text-green-600') : 'text-red-600');
  let defaultImageUrl = "https://via.placeholder.com/300x200?text=No+Image"; // Placeholder image

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
      {name}
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

    <Button
      disabled={stockQuantity === 0}
      onClick={() => console.log(`Add to cart: ${id} - ${name}`)}
    >
      {stockQuantity > 0 ? 'Add to Cart' : 'Notify Me'}
    </Button>
  </div>
</div>