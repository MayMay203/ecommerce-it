import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addressService } from '../services/address.service';
import type { Address } from '../types/address.types';

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => addressService.setDefault(id),
    onMutate: async (id: number) => {
      // Cancel any ongoing refetches
      await queryClient.cancelQueries({ queryKey: ['addresses'] });

      // Get previous data
      const previousAddresses = queryClient.getQueryData<Address[]>(['addresses']);

      // Optimistically update the cache
      if (previousAddresses) {
        const updatedAddresses = previousAddresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === id,
        }));
        queryClient.setQueryData(['addresses'], updatedAddresses);
      }

      return { previousAddresses };
    },
    onSuccess: () => {
      // Refetch to confirm the change from server
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: (_error, _id, context) => {
      // Revert to previous data if mutation fails
      if (context?.previousAddresses) {
        queryClient.setQueryData(['addresses'], context.previousAddresses);
      }
    },
  });
}
