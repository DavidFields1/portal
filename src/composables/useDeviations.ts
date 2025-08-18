import axiosInstance from '@/config/axiosInstance';
import {
	DeviationsResponseSchema,
	type DeviationsResponse,
	type Deviation,
} from '@/schemas/deviationSchema';
import {
	useQuery,
	useMutation,
	useQueryClient,
	type UseQueryOptions,
	type UseMutationOptions,
} from '@tanstack/vue-query';
import { type Ref, toValue } from 'vue';

// Query options type
type UseDeviationsQueryOptions = Omit<
	UseQueryOptions<DeviationsResponse, Error>,
	'queryKey' | 'queryFn'
>;

// Mutation options type
type UseDeviationsMutationOptions = Omit<UseMutationOptions<unknown, Error, unknown>, 'mutationFn'>;

// GET - Fetch all deviations
export function useDeviationsQuery(options: UseDeviationsQueryOptions = {}) {
	return useQuery<DeviationsResponse, Error>({
		queryKey: ['deviations'],
		queryFn: async () => {
			const { data } = await axiosInstance.get('/configuracion/desviacion');
			const parsedData = DeviationsResponseSchema.parse(data);
			return parsedData;
		},
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: false,
		...options,
	});
}

// GET - Fetch deviation by Moneda
export function useDeviationByCurrencyQuery(
	moneda: Ref<string | null>,
	options: UseDeviationsQueryOptions = {},
) {
	return useQuery<DeviationsResponse, Error>({
		queryKey: ['deviation', moneda],
		queryFn: async () => {
			const monedaValue = toValue(moneda);

			if (!monedaValue) {
				throw new Error('ID de desviación es requerido para la query.');
			}

			const { data } = await axiosInstance.get(`/configuracion/desviacion/${moneda}`);
			const parsedData = DeviationsResponseSchema.parse(data);
			return parsedData;
		},
		enabled: !!toValue(moneda),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: false,
		...options,
	});
}

// POST - Create new deviation
export function useCreateDeviationMutation(options: UseDeviationsMutationOptions = {}) {
	const queryClient = useQueryClient();

	return useMutation<unknown, Error, Partial<Deviation>>({
		mutationFn: async (deviationData) => {
			const { data } = await axiosInstance.post('/configuracion/desviacion', deviationData);
			return data;
		},
		onSuccess: () => {
			// Invalidate and refetch deviations list
			queryClient.invalidateQueries({ queryKey: ['deviations'] });
		},
		...options,
	});
}

// PUT - Update deviation
export function useUpdateDeviationMutation(options: UseDeviationsMutationOptions = {}) {
	const queryClient = useQueryClient();

	return useMutation<unknown, Error, { id: string; data: Partial<Deviation> }>({
		mutationFn: async ({ id, data }) => {
			const response = await axiosInstance.put(`/configuracion/desviacion/${id}`, data);
			return response.data;
		},
		onSuccess: (_, variables) => {
			// Invalidate and refetch deviations list
			queryClient.invalidateQueries({ queryKey: ['deviations'] });
			// Invalidate specific deviation query
			queryClient.invalidateQueries({ queryKey: ['deviation', variables.id] });
		},
		...options,
	});
}

// DELETE - Delete deviation
export function useDeleteDeviationMutation(options: UseDeviationsMutationOptions = {}) {
	const queryClient = useQueryClient();

	return useMutation<unknown, Error, string>({
		mutationFn: async (id) => {
			const response = await axiosInstance.delete(`/configuracion/desviacion/${id}`);
			return response.data;
		},
		onSuccess: (_, id) => {
			// Invalidate and refetch deviations list
			queryClient.invalidateQueries({ queryKey: ['deviations'] });
			// Remove specific deviation from cache
			queryClient.removeQueries({ queryKey: ['deviation', id] });
		},
		...options,
	});
}

// PATCH - Partial update deviation
export function usePatchDeviationMutation(options: UseDeviationsMutationOptions = {}) {
	const queryClient = useQueryClient();

	return useMutation<unknown, Error, { id: string; data: Partial<Deviation> }>({
		mutationFn: async ({ id, data }) => {
			const response = await axiosInstance.patch(`/configuracion/desviacion/${id}`, data);
			return response.data;
		},
		onSuccess: (_, variables) => {
			// Invalidate and refetch deviations list
			queryClient.invalidateQueries({ queryKey: ['deviations'] });
			// Invalidate specific deviation query
			queryClient.invalidateQueries({ queryKey: ['deviation', variables.id] });
		},
		...options,
	});
}
