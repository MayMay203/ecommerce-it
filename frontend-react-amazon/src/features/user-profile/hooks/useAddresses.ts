import { useQuery } from '@tanstack/react-query';
import { addressService } from '../services/address.service';

export function useAddresses() {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const { data } = await addressService.getAll();
      return data.data;
    },
  });
}
