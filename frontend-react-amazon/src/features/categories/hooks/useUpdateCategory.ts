import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/category.service';
import type { UpdateCategoryRequest } from '../types/category.types';

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryRequest }) =>
      categoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
