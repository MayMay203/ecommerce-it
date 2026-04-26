import { useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { OrderList } from '../components/OrderList';

export default function OrderListPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | undefined>(undefined);

  const { data, isLoading } = useOrders(page, 10, status);
  const orders = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-2 text-gray-600">View and manage your orders</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setStatus(undefined); setPage(1); }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            status === undefined
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Orders
        </button>
        {['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              status === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Order List */}
      <OrderList orders={orders} isLoading={isLoading} />

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white p-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
          >
            Previous
          </button>
          <div className="flex gap-1">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-10 w-10 rounded-lg font-medium transition-colors ${
                  p === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage(Math.min(meta.totalPages, page + 1))}
            disabled={page === meta.totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
