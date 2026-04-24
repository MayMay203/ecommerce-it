import type { Address } from '../types/address.types';

interface Props {
  address: Address;
  isDefault: boolean;
  onEdit: (address: Address) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
  isLoading?: boolean;
}

export function AddressCard({
  address,
  isDefault,
  onEdit,
  onDelete,
  onSetDefault,
  isLoading = false,
}: Props) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        isDefault
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{address.fullName}</h3>
          <p className="text-sm text-gray-600">{address.phone}</p>
        </div>
        {isDefault && (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            Default
          </span>
        )}
      </div>

      <p className="mb-2 text-sm text-gray-700">
        {address.addressLine}, {address.ward}, {address.district}, {address.city} {address.postalCode}
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(address)}
          disabled={isLoading}
          className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          Edit
        </button>
        {!isDefault && (
          <>
            <button
              onClick={() => onSetDefault(address.id)}
              disabled={isLoading}
              className="text-sm text-gray-600 hover:text-gray-700 disabled:opacity-50"
            >
              Set as Default
            </button>
            <button
              onClick={() => onDelete(address.id)}
              disabled={isLoading}
              className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
