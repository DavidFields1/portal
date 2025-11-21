// src/composables/useInvoicesQuery.ts

import { useQuery } from '@tanstack/vue-query';
import { toValue, type MaybeRef, computed } from 'vue';
// 1. Importa tu instancia de Axios

import {
	InvoiceMonitorResponseSchema,
	type InvoiceMonitorResponse,
} from '@/schemas/invoiceSchemas';
import { useAuthStore } from '@/stores/authStore';
import axiosInstance from '@/config/axiosInstance';

// La interfaz de parámetros no cambia
interface InvoicesQueryParams {
	tipoFactura?: string;
	searchAfter?: string;
	estatus?: string;
	fechaOrigen?: string;
	fechaLimite?: string;
	tipoFechaBusqueda?: string;
	fecha_creacion?: string;
	UUId?: string;
	idProveedorSap?: string;
}

export function useInvoicesQuery(params: MaybeRef<InvoicesQueryParams>) {
	const fetchInvoices = async (): Promise<InvoiceMonitorResponse> => {
		const authStore = useAuthStore();
		const isEmployee = authStore.user?.perfiles.some((perfil) => perfil.codigo === 'EMPL');

		// Usamos toValue para obtener el valor actual de los parámetros (reactivos o no)
		const resolvedParams = toValue(params);

		const queryParams = {
			tipoFactura: resolvedParams.tipoFactura ?? '',
			searchAfter: resolvedParams.searchAfter ?? '',
			estatus: resolvedParams.estatus ?? '',
			fechaOrigen: resolvedParams.fechaOrigen ?? '',
			fechaLimite: resolvedParams.fechaLimite ?? '',
			tipoFechaBusqueda: resolvedParams.tipoFechaBusqueda ?? '',
			fecha_creacion: resolvedParams.fecha_creacion ?? '',
			UUId: resolvedParams.UUId ?? '',
			idProveedorSap: isEmployee
				? (resolvedParams.idProveedorSap ?? '')
				: (authStore.user?.proveedor?.id_proveedor_sap ?? ''),
		};

		const response = await axiosInstance.get('/factura', {
			params: queryParams,
		});

		return InvoiceMonitorResponseSchema.parse(response.data);
	};

	// Creamos un `computed` para la queryKey para que sea reactiva
	const queryKey = computed(() => ['invoices', toValue(params)]);

	return useQuery({
		queryKey: queryKey, // La clave de la consulta ahora es un computed
		queryFn: fetchInvoices,
	});
}
