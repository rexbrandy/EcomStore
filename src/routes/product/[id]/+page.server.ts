import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
  const productId = params.id;

  if (!productId) {
    // This case should ideally be handled by SvelteKit's routing
    // if the [id] parameter is mandatory.
    throw error(400, 'Product ID is required.');
  }

  try {
    const response = await fetch(`/api/products/${productId}`);

    if (!response.ok) {
      // Attempt to parse the error message from the API if available
      let message = `Failed to fetch product: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          message = errorData.message;
        }
      } catch (e) {
        // Ignore if parsing error body fails, use statusText
      }
      // Forward the status code from the API response
      throw error(response.status, message);
    }

    const product = await response.json();

    // The price from Prisma Decimal might be a string.
    // It's often better to handle type conversions consistently,
    // either here or in the component. For simplicity, if your component
    // expects a number for price, you might convert it here.
    // However, your current component's `formatPrice` handles string or number.
    // product.price = parseFloat(product.price as string); // Example if conversion is needed

    return {
      product: product,
    };

  } catch (e: any) {
    console.error(`Error in load function for product ${productId}:`, e);
    // If it's already a SvelteKit error, re-throw it
    if (e.status) {
      throw e;
    }
    // For unexpected errors
    throw error(500, `An unexpected error occurred while fetching product ${productId}.`);
  }
};