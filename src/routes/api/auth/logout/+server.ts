// src/routes/api/auth/logout/+server.ts
import prisma from '$lib/server/prisma';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

const SESSION_COOKIE_NAME = 'sessionId';

export const POST: RequestHandler = async ({ cookies }) => {
  try {
    const sessionId = cookies.get(SESSION_COOKIE_NAME);

    if (sessionId) {
      try {
        await prisma.session.delete({
          where: { id: sessionId },
        });
      } catch (dbError: any) {
        if (dbError.code === 'P2025') { // Prisma's "Record to delete does not exist."
            console.warn(`Logout: Session ${sessionId} not found in DB, likely already deleted or invalid.`);
        } else {
            console.error(`Logout: Error deleting session ${sessionId} from DB:`, dbError.message);
        }
      }

      cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
    }

    return json({ message: 'Logout successful' });

  } catch (e: any) {
    console.error('Logout error:', e);
    if (e.status && e.body && typeof e.body.message === 'string') {
        throw error(e.status, e.body.message);
    }
    throw error(500, 'An error occurred during logout.');
  }
};