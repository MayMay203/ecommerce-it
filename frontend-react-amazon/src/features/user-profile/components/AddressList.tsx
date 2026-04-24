import type { Address } from '../types/address.types';
import { AddressCard } from './AddressCard';

interface Props {
  addresses: Address[];
  onEdit: (address: Address) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
  isLoading?: boolean;
}

export function AddressList({
  addresses,
  onEdit,
  onDelete,
  onSetDefault,
  isLoading = false,
}: Props) {
  if (addresses.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-gray-600">No addresses saved yet. Add your first address.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {addresses.map((address) => (
        <AddressCard
          key={address.id}
          address={address}
          isDefault={address.isDefault}
          onEdit={onEdit}
          onDelete={onDelete}
          onSetDefault={onSetDefault}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
