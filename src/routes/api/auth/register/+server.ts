// src/routes/api/auth/register/+server.ts
import prisma from '$lib/server/prisma';
import { json, error } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import type { RequestHandler } from '@sveltejs/kit';
import { PWORD_SALT_ROUNDS } from '$lib/common';

const SALT_ROUNDS = PWORD_SALT_ROUNDS;

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Change from request.json() to request.formData()
    const { name, email, password } = await request.json(); // This will be an empty string if submitted empty, or null if not present

    // Basic validation
    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      throw error(400, 'A valid email is required.');
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      throw error(400, 'Password must be at least 8 characters long.');
    }
    // Adjust name validation: formData.get('name') might be an empty string if the field is submitted empty.
    // If 'name' is truly optional and can be absent, `formData.get('name')` would return null if the field isn't part of the form.
    // However, your Svelte form *does* include a 'name' input. If it's submitted empty, it will be an empty string.
    if (name && typeof name === 'string' && name.trim() === '') { // Check if name is provided but only whitespace
        // If name is optional and an empty string is acceptable for "not provided", remove this check or adjust.
        // If an empty string for name means "no name provided", then this is fine.
        // If name must be non-empty *if* the field itself is sent (even if empty), this is also fine.
        // The current Svelte form sends `name: ''` if left blank.
    } else if (name && typeof name !== 'string') { // This case is unlikely with standard form data for 'name'
        throw error(400, 'Name, if provided, must be a valid string.');
    }


    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw error(409, 'User with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        // Handle name: if it's an empty string from the form and you want to store null, convert it.
        name: name && name.trim() !== '' ? name.trim() : null,
        isAdmin: false // Defaulting isAdmin to false
      }
    });

    // Remove password from user obj
    const { password: _, ...userWithoutPassword } = user;

    return json(userWithoutPassword, { status: 201 });
  } catch (e: any) {
    console.error('Registration error:', e);
    if (e.status && e.body && typeof e.body.message === 'string') {
        // This re-throws SvelteKit errors, which is good
        throw error(e.status, e.body.message);
    }
    // For other types of errors, throw a generic 500
    throw error(500, 'Failed to register user. Please try again later.');
  }
};