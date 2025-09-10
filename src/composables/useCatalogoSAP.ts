import axiosInstance from '@/config/axiosInstance';
import { CentroCostoResponseSchema, type CentroCostoResponse } from '@/schemas/centrosCostoSchemas';
import {
	CuentasGastoResponseSchema,
	type CuentasGastoResponse,
} from '@/schemas/cuentasGastoSchemas';
import { GoodsReceiptResponseSchema, type GoodsReceiptResponse } from '@/schemas/goodReceiptSchema';
import {
	IndicadoresIvaResponseSchema,
	type IndicadoresIvaResponse,
} from '@/schemas/indicadoresIvaSchemas';
import { PurchaseOrderResponseSchema, type PurchaseOrderResponse } from '@/schemas/purchaseOrder';
import { SocietyResponseSchema, type SocietyResponse } from '@/schemas/societySchema';
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

export function useSociedadesSAPQuery(options: UseOrdenesCompraSAPQueryOptions = {}) {
	return useQuery<SocietyResponse, Error>({
		queryKey: ['sociedades'],
		queryFn: async () => {
			const { data } = await axiosInstance.get('/catalogo-sap/sociedades');

			const parsedData = SocietyResponseSchema.parse(data);

			return parsedData;
		},
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: false,
		...options,
	});
}

export function useCentrosCostoSAPQuery(
	options: UseOrdenesCompraSAPQueryOptions = {},
	sociedadFactura: Ref<string | null>,
) {
	return useQuery<CentroCostoResponse, Error>({
		queryKey: ['centros-costo'],
		queryFn: async () => {
			const { data } = await axiosInstance.get('/catalogo-sap/centros-costo', {
				params: {
					sociedad: sociedadFactura.value,
				},
			});

			const parsedData = CentroCostoResponseSchema.parse(data);

			return parsedData;
		},
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: false,
		...options,
	});
}

export function useCuentasGastoSAPQuery(
	options: UseOrdenesCompraSAPQueryOptions = {},
	sociedadFactura: Ref<string | null>,
) {
	return useQuery<CuentasGastoResponse, Error>({
		queryKey: ['cuentas-gasto'],
		queryFn: async () => {
			const { data } = await axiosInstance.get('/catalogo-sap/cuentas-gasto', {
				params: {
					sociedad: sociedadFactura.value,
				},
			});

			const parsedData = CuentasGastoResponseSchema.parse(data);

			return parsedData;
		},
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: false,
		...options,
	});
}

export function useIndicadoresIvaSAPQuery(options: UseOrdenesCompraSAPQueryOptions = {}) {
	return useQuery<IndicadoresIvaResponse, Error>({
		queryKey: ['indicadores-iva'],
		queryFn: async () => {
			const { data } = await axiosInstance.get('/catalogo-sap/indicadores-iva');

			const parsedData = IndicadoresIvaResponseSchema.parse(data);

			return parsedData;
		},
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: false,
		...options,
	});
}
