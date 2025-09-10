import axiosInstance from '@/config/axiosInstance';
import { ProrrateosResponseSchema, type ProrrateosResponse } from '@/schemas/prorrateosSchema';
import { type PurchaseOrderResponse } from '@/schemas/purchaseOrder';
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query';
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
