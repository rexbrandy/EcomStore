import prisma from '$lib/server/prisma';
import { json, error } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import type { RequestHandler } from '@sveltejs/kit';

const SESSION_COOKIE_NAME = 'sessionId';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string | null;
    const password = formData.get('password') as string | null;

    if (!email || typeof email !== 'string') {
      throw error(400, 'Email is required and must be a valid string.');
    }
    if (!password || typeof password !== 'string') {
      throw error(400, 'Password is required and must be a valid string.');
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw error(401, 'Invalid email or password.');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw error(401, 'Invalid email or password.');
    }

    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    const newSession = await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt,
      },
    });

    cookies.set(SESSION_COOKIE_NAME, newSession.id, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_MS / 1000,
    });

    const { password: _, ...userWithoutPassword } = user;

    return json({ message: 'Login successful', user: userWithoutPassword });

  } catch (e: any) {
    console.error('Login error:', e);
    // If it's a SvelteKit error thrown by `error()`, re-throw it
    if (e && typeof e.status === 'number' && e.body && typeof e.body.message === 'string') {
        throw error(e.status, e.body.message);
    }
    // For any other unexpected errors
    throw error(500, 'Failed to log in due to a server error. Please try again later.');
  }
};