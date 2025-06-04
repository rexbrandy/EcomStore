import type { Handle } from "@sveltejs/kit";
import prisma from '$lib/server/prisma';

const SESSION_COOKIE_NAME = 'sessionId';

export const handle: Handle = async ({ event, resolve}) => {
  event.locals.user = null; // Ensure this is false when this starts

  const sessionId = event.cookies.get(SESSION_COOKIE_NAME);

  if (sessionId) {
    try {
      const session = await prisma.session.findUnique({
        where: { id: sessionId},
        include: {
          user: {
            select:{
              id: true,
              email: true,
              name: true,
              isAdmin: true
            },
          },
        },
      });
      console.log(session)
      if (session) {
        if (session.user && session.expiresAt > new Date()) {
          event.locals.user = session.user;
        } else {
          event.cookies.delete(SESSION_COOKIE_NAME, { path: '/'});
          // Delete from db aswell; 
          await prisma.session.delete({ where: { id: sessionId } }).catch(err => {
            console.warn(`Hooks: Failed to delete invalid/expired session ${sessionId} from DB:`, err.message);
          });
        }
      } else {
        event.cookies.delete(SESSION_COOKIE_NAME, { path: '/'});
      }
    } catch (dbError: any) {
      console.error('Hooks: Db error during session validation:', dbError.message);
    }
  }

  const response = await resolve(event);
  return response;
}