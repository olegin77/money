import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { perimetersApi, CreatePerimeterData } from '@/lib/api/perimeters';

export const perimeterKeys = {
  all: ['perimeters'] as const,
  lists: () => [...perimeterKeys.all, 'list'] as const,
  detail: (id: string) => [...perimeterKeys.all, 'detail', id] as const,
  budgetStatus: (id: string) => [...perimeterKeys.all, 'budget', id] as const,
  shares: (id: string) => [...perimeterKeys.all, 'shares', id] as const,
};

export function usePerimeters() {
  return useQuery({
    queryKey: perimeterKeys.lists(),
    queryFn: () => perimetersApi.findAll(),
  });
}

export function usePerimeter(id: string) {
  return useQuery({
    queryKey: perimeterKeys.detail(id),
    queryFn: () => perimetersApi.findOne(id),
    enabled: !!id,
  });
}

export function useBudgetStatus(id: string) {
  return useQuery({
    queryKey: perimeterKeys.budgetStatus(id),
    queryFn: () => perimetersApi.getBudgetStatus(id),
    enabled: !!id,
  });
}

export function useCreatePerimeter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePerimeterData) => perimetersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: perimeterKeys.all });
    },
  });
}

export function useUpdatePerimeter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePerimeterData> }) =>
      perimetersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: perimeterKeys.all });
    },
  });
}

export function useDeletePerimeter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => perimetersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: perimeterKeys.all });
    },
  });
}
