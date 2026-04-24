import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address, CreateAddressRequest } from '../types/address.types';

const addressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  addressLine: z.string().min(1, 'Address is required'),
  ward: z.string().min(1, 'Ward is required'),
  district: z.string().min(1, 'District is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface Props {
  initialData?: Address;
  onSubmit: (data: CreateAddressRequest) => void;
  isLoading: boolean;
  error?: string;
}

const fieldClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
const errorClass = 'mt-1 text-xs text-red-500';

export function AddressForm({ initialData, onSubmit, isLoading, error }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialData || undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className={labelClass}>
            Full Name
          </label>
          <input
            {...register('fullName')}
            id="fullName"
            type="text"
            placeholder="John Doe"
            className={fieldClass}
          />
          {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone
          </label>
          <input
            {...register('phone')}
            id="phone"
            type="tel"
            placeholder="0901234567"
            className={fieldClass}
          />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="addressLine" className={labelClass}>
          Address Line
        </label>
        <input
          {...register('addressLine')}
          id="addressLine"
          type="text"
          placeholder="123 Main Street"
          className={fieldClass}
        />
        {errors.addressLine && <p className={errorClass}>{errors.addressLine.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="ward" className={labelClass}>
            Ward
          </label>
          <input
            {...register('ward')}
            id="ward"
            type="text"
            placeholder="Ward 1"
            className={fieldClass}
          />
          {errors.ward && <p className={errorClass}>{errors.ward.message}</p>}
        </div>

        <div>
          <label htmlFor="district" className={labelClass}>
            District
          </label>
          <input
            {...register('district')}
            id="district"
            type="text"
            placeholder="District 1"
            className={fieldClass}
          />
          {errors.district && <p className={errorClass}>{errors.district.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className={labelClass}>
            City
          </label>
          <input
            {...register('city')}
            id="city"
            type="text"
            placeholder="Ho Chi Minh"
            className={fieldClass}
          />
          {errors.city && <p className={errorClass}>{errors.city.message}</p>}
        </div>

        <div>
          <label htmlFor="postalCode" className={labelClass}>
            Postal Code
          </label>
          <input
            {...register('postalCode')}
            id="postalCode"
            type="text"
            placeholder="70000"
            className={fieldClass}
          />
          {errors.postalCode && <p className={errorClass}>{errors.postalCode.message}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Saving…' : initialData ? 'Update Address' : 'Add Address'}
      </button>
    </form>
  );
}
