import prisma from '$lib/server/prisma';
import { json, error } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import type { RequestHandler } from '@sveltejs/kit';

const SALT_ROUNDS = 10;

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email, password, name } = await request.json();

    // basic validation
    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      throw error(400, 'A valid email is required.');
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      throw error(400, 'Password must be at least 8 characters long.');
    }
    if (name && (typeof name !== 'string' || name.trim() === '')) {
        throw error(400, 'Name, if provided, must be a non-empty string.');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLocaleLowerCase() },
    });

    if (existingUser) {
      throw error(409, 'User with this email already exists.')
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
        isAdmin: false
      }
    });

    // remove password from user obj
    const { password: _, ...userWithoutPassword } = user;

    return json(userWithoutPassword, { status: 201 });
  } catch (e: any) {
    console.error('Registration error:', e);
    // if there is another error, throw it
    if (e.status && e.body && typeof e.body.message === 'string') {
        throw error(e.status, e.body.message);
    }
    throw error(500, 'Failed to register user. Please try again later.');
  }
}