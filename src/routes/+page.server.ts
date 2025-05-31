import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;

  return {
    user: user // Pass the user object (or null) to the +page.svelte component
  };
};