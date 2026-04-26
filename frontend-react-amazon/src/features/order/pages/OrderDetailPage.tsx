import { useParams, useNavigate } from 'react-router';
import { useOrder } from '../hooks/useOrder';
import { useCancelOrder } from '../hooks/useCancelOrder';
import { OrderDetail } from '../components/OrderDetail';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = parseInt(id || '0', 10);

  const { data: order, isLoading, error } = useOrder(orderId, !!id);
  const cancelOrderMutation = useCancelOrder();

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      await cancelOrderMutation.mutateAsync({ orderId });
      alert('Order cancelled successfully');
    } catch (err) {
      alert('Failed to cancel order');
    }
  };

  if (!id) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Order not found</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">Failed to load order</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Orders
      </button>

      <OrderDetail
        order={order}
        onCancel={order.status === 'pending' ? handleCancel : undefined}
        isCancelling={cancelOrderMutation.isPending}
      />
    </div>
  );
}
