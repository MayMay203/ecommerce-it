import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/category.service';
import type { CreateCategoryRequest } from '../types/category.types';

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
