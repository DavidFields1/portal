import axiosInstance from '@/config/axiosInstance';
import {
	ProrrateosResponseSchema,
	type ProrrateosResponse,
	type Prorrateo,
} from '@/schemas/prorrateosSchema';
import { type PurchaseOrderResponse } from '@/schemas/purchaseOrder';
import { useMutation, useQuery, type UseQueryOptions } from '@tanstack/vue-query';
import { toValue, type Ref } from 'vue';

type UseOrdenesCompraSAPQueryOptions = Omit<
	UseQueryOptions<PurchaseOrderResponse, Error>,
	'queryKey' | 'queryFn'
>;

export function useProrrateosQuery(
	uuidFactura: Ref<string | null>,
	options: UseOrdenesCompraSAPQueryOptions = {},
) {
	return useQuery<ProrrateosResponse, Error>({
		queryKey: ['prorrateos', uuidFactura],
		queryFn: async () => {
			const currentUuidFactura = toValue(uuidFactura);

			if (!currentUuidFactura) {
				throw new Error('ID de Proveedor y RFC son requeridos para la query.');
			}

			const { data } = await axiosInstance.get('/factura/prorrateo', {
				params: { uuid_factura: currentUuidFactura },
			});

			const parsedData = ProrrateosResponseSchema.parse(data);
			return parsedData;
		},
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: false,
		...options,
	});
}

export function useCreateProrrateoMutation() {
	return useMutation({
		mutationFn: async (prorrateoData: Prorrateo) => {
			const { data } = await axiosInstance.post('/factura/prorrateo', prorrateoData);
			return data;
		},
	});
}

export function useUpdateProrrateoMutation() {
	return useMutation({
		mutationFn: async (prorrateoData: Prorrateo) => {
			const { data } = await axiosInstance.put('/factura/prorrateo', prorrateoData);
			return data;
		},
	});
}

export function useDeleteProrrateoMutation() {
	return useMutation({
		mutationFn: async (idProrrateo: number) => {
			const { data } = await axiosInstance.delete('/factura/prorrateo/borrar/' + idProrrateo);
			return data;
		},
	});
}
