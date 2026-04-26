import { Link } from 'react-router';
import { ROUTES } from '@/routes/routes';
import type { Order } from '../types/order.types';

interface OrderCardProps {
  order: Order;
}

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipping: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentStatusStyles: Record<string, string> = {
  unpaid: 'bg-red-50 text-red-700',
  paid: 'bg-green-50 text-green-700',
};

export function OrderCard({ order }: OrderCardProps) {
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[order.status]}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${paymentStatusStyles[order.paymentStatus]}`}>
            {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
          </span>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-4 py-3 border-y border-gray-100">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Items</p>
          <p className="text-lg font-semibold text-gray-900">{order.orderItems.length}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
          <p className="text-lg font-semibold text-gray-900">${Number(order.totalAmount).toFixed(2)}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          to={ROUTES.ORDER_DETAIL.replace(':id', String(order.id))}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          View Details
        </Link>
        {order.status === 'pending' && (
          <button className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200">
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}
