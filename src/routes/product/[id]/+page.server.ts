import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
  const productId = params.id;

  if (!productId) {
    throw error(400, 'Product ID is required.');
  }

  try {
    const response = await fetch(`/api/products/${productId}`);

    if (!response.ok) {
      let message = `Failed to fetch product: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          message = errorData.message;
        }
      } catch (e) {
      }
      throw error(response.status, message);
    }

    const product = await response.json();
    
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