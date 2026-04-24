import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addressService } from '../services/address.service';
import type { UpdateAddressRequest } from '../types/address.types';

export function useUpdateAddress(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAddressRequest) =>
      addressService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      queryClient.invalidateQueries({ queryKey: ['address', id] });
    },
  });
}
