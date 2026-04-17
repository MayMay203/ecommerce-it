interface Props {
  title?: string;
  message: string;
  variant?: 'error' | 'info';
  onClose: () => void;
}

export function AlertModal({ title, message, variant = 'error', onClose }: Props) {
  const titleText = title ?? (variant === 'error' ? 'Error' : 'Info');
  const titleColor = variant === 'error' ? 'text-red-600' : 'text-gray-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className={`mb-2 text-lg font-semibold ${titleColor}`}>{titleText}</h2>
        <p className="mb-6 text-sm text-gray-600">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
