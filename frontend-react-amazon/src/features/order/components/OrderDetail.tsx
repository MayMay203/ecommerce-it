import type { Order } from '../types/order.types';

interface OrderDetailProps {
  order: Order;
  onCancel?: () => void;
  isCancelling?: boolean;
}

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipping: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function OrderDetail({ order, onCancel, isCancelling }: OrderDetailProps) {
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
            <p className="mt-1 text-sm text-gray-500">Placed on {formattedDate}</p>
          </div>
          <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${statusStyles[order.status]}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Order Items */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
        </div>
        <div className="divide-y">
          {order.orderItems.map((item) => (
            <div key={item.id} className="p-6 flex gap-4">
              {item.thumbnailUrl && (
                <img
                  src={item.thumbnailUrl}
                  alt={item.productName}
                  className="h-20 w-20 rounded-lg object-cover bg-gray-100"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                <div className="mt-2 flex items-baseline gap-4">
                  <span className="text-lg font-semibold text-gray-900">
                    ${Number(item.price).toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">× {item.quantity}</span>
                  <span className="ml-auto text-lg font-semibold text-gray-900">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Shipping Address */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
          <p className="text-sm text-gray-600">
            Address information will be displayed from snapshot
          </p>
        </div>

        {/* Price Breakdown */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Price Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">
                ${(Number(order.totalAmount) - Number(order.shippingFee)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-900">${Number(order.shippingFee).toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-lg text-gray-900">
                ${Number(order.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600">Payment Status</p>
            <p className="mt-1 font-semibold text-gray-900">
              {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
            </p>
            <p className="text-sm text-gray-600 mt-2">Payment Method</p>
            <p className="mt-1 font-semibold text-gray-900">
              {order.paymentMethod.replace(/_/g, ' ').toUpperCase()}
            </p>
          </div>
          {order.status === 'pending' && onCancel && (
            <button
              onClick={onCancel}
              disabled={isCancelling}
              className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
