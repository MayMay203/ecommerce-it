import { api } from '@/shared/lib/axios';
import type {
  CreateAddressRequest,
  UpdateAddressRequest,
  AddressListResponse,
  AddressSingleResponse,
} from '../types/address.types';

export const addressService = {
  getAll: () => api.get<AddressListResponse>('/addresses'),

  getById: (id: number) => api.get<AddressSingleResponse>(`/addresses/${id}`),

  create: (data: CreateAddressRequest) =>
    api.post<AddressSingleResponse>('/addresses', data),

  update: (id: number, data: UpdateAddressRequest) =>
    api.patch<AddressSingleResponse>(`/addresses/${id}`, data),

  delete: (id: number) => api.delete(`/addresses/${id}`),

  setDefault: (id: number) =>
    api.patch<AddressSingleResponse>(`/addresses/${id}/default`),
};
