import { useQuery } from '@tanstack/react-query';
import { addressService } from '../services/address.service';

export function useAddress(id: number) {
  return useQuery({
    queryKey: ['address', id],
    queryFn: async () => {
      const { data } = await addressService.getById(id);
      return data.data;
    },
    enabled: !!id,
  });
}
