// src/composables/useInvoicesQuery.ts

import { useQuery } from '@tanstack/vue-query';
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

export function useInvoicesQuery(params: InvoicesQueryParams) {
	// La función de fetch es la que cambia
	const fetchInvoices = async (): Promise<InvoiceMonitorResponse> => {
		const authStore = useAuthStore();
		const isEmployee = authStore.user?.perfiles.filter((perfil) => perfil.codigo === 'EMPL');

		// 2. Preparamos los parámetros para Axios
		const queryParams = {
			tipoFactura: params.tipoFactura ?? '',
			searchAfter: params.searchAfter ?? '',
			estatus: params.estatus ?? '',
			fechaOrigen: params.fechaOrigen ?? '',
			fechaLimite: params.fechaLimite ?? '',
			tipoFechaBusqueda: params.tipoFechaBusqueda ?? '',
			fecha_creacion: params.fecha_creacion ?? '',
			UUId: params.UUId ?? '',
			// Lógica de rol para el idProveedorSap
			idProveedorSap: isEmployee
				? (params.idProveedorSap ?? '')
				: (authStore.user?.proveedor?.id_proveedor_sap ?? ''),
		};

		// 3. Hacemos la llamada con axiosInstance.get
		//    - La URL base y el token de autorización se añaden automáticamente.
		//    - Axios se encarga de construir la query string desde el objeto `params`.
		const response = await axiosInstance.get('/factura', {
			params: queryParams,
		});

		// 4. Con Axios, los datos vienen en `response.data`.
		//    Validamos la respuesta con Zod como antes.
		return InvoiceMonitorResponseSchema.parse(response.data);
	};

	// La configuración de useQuery no cambia
	return useQuery({
		queryKey: ['invoices', params],
		queryFn: fetchInvoices,
	});
}
