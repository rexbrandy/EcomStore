// src/lib/common.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { goto } from "$app/navigation";
import { ClientOrderStatus } from './enums';


export function twClassMerge(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusColor(status: ClientOrderStatus) {
  switch (status) {
    case ClientOrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
    case ClientOrderStatus.PAID: return 'bg-green-100 text-green-800';
    case ClientOrderStatus.PROCESSING: return 'bg-blue-100 text-blue-800';
    case ClientOrderStatus.SHIPPED: return 'bg-indigo-100 text-indigo-800';
    case ClientOrderStatus.DELIVERED: return 'bg-purple-100 text-purple-800';
    case ClientOrderStatus.CANCELLED: return 'bg-red-100 text-red-800';
    case ClientOrderStatus.REFUNDED: return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function formatOrderStatus(status: ClientOrderStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export function viewOrderDetails(orderId: string) {
  goto(`/orders/${orderId}`);
}

export function emailIsValid(email: string) {
  return /^\S+@\S+\.\S+$/.test(email)
}

export const PWORD_SALT_ROUNDS = 10;

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}