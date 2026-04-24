import { useState } from 'react';
import { useAddresses } from '../hooks/useAddresses';
import { useCreateAddress } from '../hooks/useCreateAddress';
import { useUpdateAddress } from '../hooks/useUpdateAddress';
import { useDeleteAddress } from '../hooks/useDeleteAddress';
import { useSetDefaultAddress } from '../hooks/useSetDefaultAddress';
import { AddressList } from '../components/AddressList';
import { AddressForm } from '../components/AddressForm';
import type { Address, CreateAddressRequest } from '../types/address.types';

export default function AddressListPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const { data: addresses = [], isLoading: isLoadingAddresses } = useAddresses();
  const { mutate: createAddress, isPending: isCreating } = useCreateAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress(
    selectedAddress?.id || 0,
  );
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();
  const { mutate: setDefault, isPending: isSettingDefault } = useSetDefaultAddress();

  const isLoading = isCreating || isUpdating || isDeleting || isSettingDefault;

  const handleAddressSubmit = (data: CreateAddressRequest) => {
    if (selectedAddress) {
      updateAddress(data, {
        onSuccess: () => {
          setSelectedAddress(null);
          setShowForm(false);
        },
      });
    } else {
      createAddress(data, {
        onSuccess: () => {
          setShowForm(false);
        },
      });
    }
  };

  const handleEdit = (address: Address) => {
    setSelectedAddress(address);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this address?')) {
      deleteAddress(id);
    }
  };

  const handleSetDefault = (id: number) => {
    setDefault(id);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedAddress(null);
  };

  return (
    <div className="mx-auto max-w-2xl py-8 px-4 sm:py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Shipping Addresses</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add New Address
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form Section */}
        {showForm && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {selectedAddress ? 'Edit Address' : 'New Address'}
            </h2>
            <AddressForm
              initialData={selectedAddress || undefined}
              onSubmit={handleAddressSubmit}
              isLoading={isLoading}
            />
            <button
              onClick={handleCancel}
              className="mt-3 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        )}

        {/* List Section */}
        <div className={showForm ? '' : 'lg:col-span-2'}>
          {isLoadingAddresses ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-lg border border-gray-200 bg-gray-50 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <AddressList
              addresses={addresses}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
