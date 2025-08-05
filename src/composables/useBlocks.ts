import axiosInstance from '@/config/axiosInstance';
import { BlocksResponseSchema, type BlocksResponse, type Block } from '@/schemas/blockSchema';
import {
	useQuery,
	useMutation,
	useQueryClient,
	type UseQueryOptions,
	type UseMutationOptions,
} from '@tanstack/vue-query';
import { type Ref, toValue } from 'vue';

// Query options type
type UseBlocksQueryOptions = Omit<UseQueryOptions<BlocksResponse, Error>, 'queryKey' | 'queryFn'>;

// Mutation options type
type UseBlocksMutationOptions = Omit<UseMutationOptions<unknown, Error, unknown>, 'mutationFn'>;

// GET - Fetch all blocks
export function useBlocksQuery(options: UseBlocksQueryOptions = {}) {
	return useQuery<BlocksResponse, Error>({
		queryKey: ['blocks'],
		queryFn: async () => {
			const { data } = await axiosInstance.get('/bloqueo');
			const parsedData = BlocksResponseSchema.parse(data);
			return parsedData;
		},
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: false,
		...options,
	});
}

// GET - Fetch block by ID
export function useBlockByIdQuery(id: Ref<string | null>, options: UseBlocksQueryOptions = {}) {
	return useQuery<BlocksResponse, Error>({
		queryKey: ['block', id],
		queryFn: async () => {
			const currentId = toValue(id);

			if (!currentId) {
				throw new Error('ID de bloqueo es requerido para la query.');
			}

			const { data } = await axiosInstance.get(`/bloqueo/${currentId}`);
			const parsedData = BlocksResponseSchema.parse(data);
			return parsedData;
		},
		enabled: !!toValue(id),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: false,
		...options,
	});
}

// POST - Create new block
export function useCreateBlockMutation(options: UseBlocksMutationOptions = {}) {
	const queryClient = useQueryClient();

	return useMutation<unknown, Error, Partial<Block>>({
		mutationFn: async (blockData) => {
			const { data } = await axiosInstance.post('/bloqueo', blockData);
			return data;
		},
		onSuccess: () => {
			// Invalidate and refetch blocks list
			queryClient.invalidateQueries({ queryKey: ['blocks'] });
		},
		...options,
	});
}

// PUT - Update block
export function useUpdateBlockMutation(options: UseBlocksMutationOptions = {}) {
	const queryClient = useQueryClient();

	return useMutation<unknown, Error, { id: string; data: Partial<Block> }>({
		mutationFn: async ({ id, data }) => {
			const response = await axiosInstance.put(`/bloqueo/${id}`, data);
			return response.data;
		},
		onSuccess: (_, variables) => {
			// Invalidate and refetch blocks list
			queryClient.invalidateQueries({ queryKey: ['blocks'] });
			// Invalidate specific block query
			queryClient.invalidateQueries({ queryKey: ['block', variables.id] });
		},
		...options,
	});
}

// DELETE - Delete block
export function useDeleteBlockMutation(options: UseBlocksMutationOptions = {}) {
	const queryClient = useQueryClient();

	return useMutation<unknown, Error, string>({
		mutationFn: async (id) => {
			const response = await axiosInstance.delete(`/bloqueo/${id}`);
			return response.data;
		},
		onSuccess: (_, id) => {
			// Invalidate and refetch blocks list
			queryClient.invalidateQueries({ queryKey: ['blocks'] });
			// Remove specific block from cache
			queryClient.removeQueries({ queryKey: ['block', id] });
		},
		...options,
	});
}

// PATCH - Partial update block
export function usePatchBlockMutation(options: UseBlocksMutationOptions = {}) {
	const queryClient = useQueryClient();

	return useMutation<unknown, Error, { id: string; data: Partial<Block> }>({
		mutationFn: async ({ id, data }) => {
			const response = await axiosInstance.patch(`/bloqueo/${id}`, data);
			return response.data;
		},
		onSuccess: (_, variables) => {
			// Invalidate and refetch blocks list
			queryClient.invalidateQueries({ queryKey: ['blocks'] });
			// Invalidate specific block query
			queryClient.invalidateQueries({ queryKey: ['block', variables.id] });
		},
		...options,
	});
}
