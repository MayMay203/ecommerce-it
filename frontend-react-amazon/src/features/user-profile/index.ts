export type {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
  AddressListResponse,
  AddressSingleResponse,
} from './types/address.types';

export { addressService } from './services/address.service';

export { useAddresses } from './hooks/useAddresses';
export { useAddress } from './hooks/useAddress';
export { useCreateAddress } from './hooks/useCreateAddress';
export { useUpdateAddress } from './hooks/useUpdateAddress';
export { useDeleteAddress } from './hooks/useDeleteAddress';
export { useSetDefaultAddress } from './hooks/useSetDefaultAddress';

export { AddressForm } from './components/AddressForm';
export { AddressCard } from './components/AddressCard';
export { AddressList } from './components/AddressList';
export { ProfileSettings } from './components/ProfileSettings';
export { EditProfileForm } from './components/EditProfileForm';

export { default as ProfilePage } from './pages/ProfilePage';
export { default as AddressListPage } from './pages/AddressListPage';
