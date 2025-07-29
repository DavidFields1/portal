import axiosInstance from '@/config/axiosInstance';
import { GoodsReceiptResponseSchema, type GoodsReceiptResponse } from '@/schemas/goodReceiptSchema';
import { PurchaseOrderResponseSchema, type PurchaseOrderResponse } from '@/schemas/purchaseOrder';
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query';
import { type Ref, toValue } from 'vue';

type UseOrdenesCompraSAPQueryOptions = Omit<
	UseQueryOptions<PurchaseOrderResponse, Error>,
	'queryKey' | 'queryFn'
>;

export function useOrdenesCompraSAPQuery(
	idProveedor: Ref<string | null>,
	rfc: Ref<string | null>,
	options: UseOrdenesCompraSAPQueryOptions = {},
) {
	return useQuery<PurchaseOrderResponse, Error>({
		queryKey: ['ordenes-compra', idProveedor, rfc],
		queryFn: async () => {
			const currentId = toValue(idProveedor);
			const currentRfc = toValue(rfc);

			if (!currentId || !currentRfc) {
				throw new Error('ID de Proveedor y RFC son requeridos para la query.');
			}

			const { data } = await axiosInstance.get('/catalogo-sap/orden-compra', {
				params: { idProveedor: currentId, rfc: currentRfc },
			});

			const parsedData = PurchaseOrderResponseSchema.parse(data);
			return parsedData;
		},
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: false,
		...options,
	});
}

export function useEntradasMercanciaSAPQuery(
	idProveedor: Ref<string | null>,
	ordenCompra: Ref<string | null>,
	options: UseOrdenesCompraSAPQueryOptions = {},
) {
	return useQuery<GoodsReceiptResponse, Error>({
		queryKey: ['entradas-mercancia', idProveedor, ordenCompra],
		queryFn: async () => {
			const currentId = toValue(idProveedor);
			const currentOc = toValue(ordenCompra);

			if (!currentId || !currentOc) {
				throw new Error('ID de Proveedor y RFC son requeridos para la query.');
			}

			const { data } = await axiosInstance.get('/catalogo-sap/entrada-mercancia', {
				params: { proveedor: currentId, ordenCompra: currentOc },
			});

			const parsedData = GoodsReceiptResponseSchema.parse(data);

			return parsedData;
		},
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: false,
		...options,
	});
}
