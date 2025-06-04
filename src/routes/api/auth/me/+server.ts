import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/prisma';

const SESSION_COOKIE_NAME = 'sessionId';

export const GET: RequestHandler = async ({ cookies }) => {
    const sessionId = cookies.get(SESSION_COOKIE_NAME);

    if (!sessionId) {
        return json({ user: null });
    }

    try {
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        isAdmin: true
                    },
                },
            },
        });

        if (session && session.user && session.expiresAt > new Date()) {
            return json({ user: session.user });
        } else {
            // Clean up invalid session
            if (session) {
                await prisma.session.delete({ where: { id: sessionId } }).catch(err => {
                    console.warn(`API: Failed to delete expired session ${sessionId}:`, err.message);
                });
            }
            return json({ user: null });
        }
    } catch (error: any) {
        console.error('API: Database error during user fetch:', error.message);
        return json({ user: null });
    }
};