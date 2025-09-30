// src/stores/invoicesStore.ts
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

import type { InvoiceMonitor } from '@/schemas/invoiceSchemas';
import { useInvoicesQuery } from '@/composables/useInvoiceQuery';

export const useInvoicesStore = defineStore('invoicesStore', () => {
	// 🔹 Filtros reactivos
	const tipoFactura = ref('');
	const searchAfter = ref('');
	const estatus = ref('');
	const fechaOrigen = ref('');
	const fechaLimite = ref('');
	const tipoFechaBusqueda = ref('');
	const fecha_creacion = ref('');
	const UUId = ref('');
	const idProveedorSap = ref('');

	// 📡 Query
	const { data, isLoading, isError, error, refetch } = useInvoicesQuery({
		get tipoFactura() {
			return tipoFactura.value;
		},
		get searchAfter() {
			return searchAfter.value;
		},
		get estatus() {
			return estatus.value;
		},
		get fechaOrigen() {
			return fechaOrigen.value;
		},
		get fechaLimite() {
			return fechaLimite.value;
		},
		get tipoFechaBusqueda() {
			return tipoFechaBusqueda.value;
		},
		get fecha_creacion() {
			return fecha_creacion.value;
		},
		get UUId() {
			return UUId.value;
		},
		get idProveedorSap() {
			return idProveedorSap.value;
		},
	});

	const invoices = computed<InvoiceMonitor[]>(() => data.value?.object ?? []);

	// ⚡ Refetch en cada cambio de filtro
	watch(
		[
			tipoFactura,
			searchAfter,
			estatus,
			fechaOrigen,
			fechaLimite,
			tipoFechaBusqueda,
			fecha_creacion,
			UUId,
			idProveedorSap,
		],
		() => refetch(),
	);

	return {
		// Filtros
		tipoFactura,
		searchAfter,
		estatus,
		fechaOrigen,
		fechaLimite,
		tipoFechaBusqueda,
		fecha_creacion,
		UUId,
		idProveedorSap,

		// Datos
		invoices,
		isLoading,
		isError,
		error,
		refetch,
	};
});
