<script lang="ts">
  import { type Snippet } from 'svelte';
  import Button from '$lib/layout/Button.svelte';

  // Define the type for the product based on your Prisma model
  // Assuming Decimal is represented as a number or string in the frontend
  type Product = {
    id: string;
    name: string;
    description?: string | null;
    price: number | string; // Or a more specific Decimal type if you have one
    imageUrl?: string | null;
    stockQuantity: number;
  };

  type PageData = {
    product: Product;
  };

  const {
    data, // This 'data' prop will contain the object returned from +page.server.ts
    addToCart,
    children
  }: {
    data: PageData; // Specify the type of the 'data' prop
    addToCart?: (product: Product) => void;
    children?: Snippet;
  } = $props();

  let product = $state(data.product)

  // Helper to format price (optional, can be done upstream)
  function formatPrice(price: number | string): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    // Basic currency formatting, adjust as needed (e.g., for specific locales/currencies)
    return `$${numPrice.toFixed(2)}`;
  }

  let currentImageUrl = $state(product.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image+Available');
  let showDescription = $state(false);

  function toggleDescription() {
    showDescription = !showDescription;
  }

  // Reactive fallback for image loading e
  // rrors
  $effect(() => {
    currentImageUrl = product.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image+Available';
  });

</script>

  <div class="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 bg-white shadow-lg rounded-lg">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="flex justify-center items-start">
        <img
          src={currentImageUrl}
          alt={product.name}
          class="w-full max-w-md h-auto object-cover rounded-md border border-gray-200"
          onerror={() => currentImageUrl = 'https://via.placeholder.com/600x400?text=Image+Load+Error'}
        />
      </div>

      <div class="flex flex-col justify-start space-y-4">
        <h1 class="text-3xl font-bold text-gray-900">{product.name}</h1>

        <p class="text-2xl font-semibold text-blue-600">{formatPrice(product.price)}</p>

        <div class="mt-2 text-sm text-gray-900 max-w-none">
          {@html product.description}
        </div>

        <div>
          {#if product.stockQuantity > 0}
            <p class="text-sm font-medium text-green-600">
              In Stock: <span class="font-bold">{product.stockQuantity}</span> available
            </p>
          {:else}
            <p class="text-sm font-medium text-red-600 bg-red-100 px-2 py-1 rounded-md inline-block">
              Out of Stock
            </p>
          {/if}
        </div>

        <Button
          disabled={product.stockQuantity === 0}
          onClick={() => console.log(`Add to cart: ${product.id} - ${product.name}`)}
        >
          {product.stockQuantity > 0 ? 'Add to Cart' : 'Notify Me'}
        </Button>

        {#if children}
          <div class="mt-4">
            {@render children()}
          </div>
        {/if}

        {#if !children && addToCart}
          <div class="mt-6">
            <button
              onclick={() => addToCart(product)}
              disabled={product.stockQuantity === 0}
              class="w-full px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add to Cart 🛒
            </button>
          </div>
        {/if}

      </div>
    </div>
  </div>