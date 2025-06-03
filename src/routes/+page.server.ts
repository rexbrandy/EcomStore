import prisma from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  console.log('Fetching categories from DB...');
  const categoriesFromDb = await prisma.category.findMany({
    include: {
      products: true,
    },
  });
  console.log(`Fetched ${categoriesFromDb.length} categories.`);

  const serializableCategories = categoriesFromDb.map(category => {
    console.log(`Processing category: ${category.id} - ${category.name}`);
    return {
      ...category,
      products: category.products.map(product => {
        let transformedPrice;
        if (product.price && typeof product.price.toString === 'function') {
          transformedPrice = product.price.toString(); // Or .toFixed(2)
        } else {
          transformedPrice = '0'; // Fallback or handle as error
        }
        return {
          ...product,
          price: transformedPrice,
        };
      }),
    };
  });


  return {
    categories: serializableCategories,
  };
};
