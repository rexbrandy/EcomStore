// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import { PrismaClient } from '@prisma/client';

interface AuthenticatedUser {
	id: string;
	email: string;
	name: string | null;
	isAdmin: boolean;
}

declare global {
	var __prisma: PrismaClient | undefined;
	namespace App {
		interface Locals {
			user: AuthenticatedUser | null; // null if not authed
		}
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
