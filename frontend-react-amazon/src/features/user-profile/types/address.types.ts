export interface Address {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  fullName: string;
  phone: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  postalCode: string;
}

export interface UpdateAddressRequest extends CreateAddressRequest {}

export interface AddressListResponse {
  success: boolean;
  data: Address[];
}

export interface AddressSingleResponse {
  success: boolean;
  data: Address;
}
