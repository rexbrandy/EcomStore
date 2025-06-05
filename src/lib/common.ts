import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { OrderStatus } from "@prisma/client";
import { goto } from "$app/navigation";

export function twClassMerge(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusColor(status: OrderStatus) {
  switch (status) {
    case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
    case OrderStatus.PAID: return 'bg-green-100 text-green-800';
    case OrderStatus.PROCESSING: return 'bg-blue-100 text-blue-800';
    case OrderStatus.SHIPPED: return 'bg-indigo-100 text-indigo-800';
    case OrderStatus.DELIVERED: return 'bg-purple-100 text-purple-800';
    case OrderStatus.CANCELLED: return 'bg-red-100 text-red-800';
    case OrderStatus.REFUNDED: return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function formatOrderStatus(status: OrderStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export function viewOrderDetails(orderId: string) {
  goto(`/orders/${orderId}`);
}