import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  // Locals user set in hooks.server.ts
  if (locals.user) {
    return json({
      loggedIn: true,
      user: locals.user,
    });
  } else {
    return json({
      loggedIn: false,
      user: null,
    });
  }
};