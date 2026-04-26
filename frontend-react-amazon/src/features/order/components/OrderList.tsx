import type { Order } from '../types/order.types';
import { OrderCard } from './OrderCard';

interface OrderListProps {
  orders: Order[];
  isLoading?: boolean;
}

export function OrderList({ orders, isLoading }: OrderListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 py-16 text-center">
        <svg className="h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        <p className="text-lg text-gray-500">No orders yet</p>
        <p className="text-sm text-gray-400">Start shopping to place your first order</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
