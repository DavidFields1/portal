// src/stores/invoiceMonitorStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import axiosInstance from '@/config/axiosInstance';
import { InvoiceMonitorResponseSchema, type InvoiceMonitor } from '@/schemas/invoiceSchemas';
import { ConceptResponseSchema, type Concept } from '@/schemas/conceptSchemas';

// Interfaz para los filtros de búsqueda
interface InvoiceFilters {
	estatus: string;
	fechaOrigen: string;
	fechaLimite: string;
	tipoFechaBusqueda: string; // por ejemplo: 'creacion', 'expedicion'
}

export const useInvoiceMonitorStore = defineStore('invoice-monitor', () => {
	const filters = ref<InvoiceFilters>({
		estatus: '',
		fechaOrigen: '',
		fechaLimite: '',
		tipoFechaBusqueda: '',
	});

	const searchAfter = ref(0);

	const invoicesQuery = useQuery({
		queryKey: ['invoices', filters],
		queryFn: async (): Promise<InvoiceMonitor[]> => {
			const params = new URLSearchParams({
				tipoFactura: 'SOC',
				searchAfter: searchAfter.value.toString(),
				estatus: filters.value.estatus,
				fechaOrigen: filters.value.fechaOrigen,
				fechaLimite: filters.value.fechaLimite,
				tipoFechaBusqueda: filters.value.tipoFechaBusqueda,
			});

			const { data } = await axiosInstance.get('/factura', { params });

			const parsedData = InvoiceMonitorResponseSchema.parse(data);

			return parsedData.object;
		},
		refetchOnWindowFocus: false,
		staleTime: 1000 * 60 * 5,
	});

	const selectedInvoiceUuid = ref<string | null>(null);
	const conceptsQuery = useQuery({
		queryKey: ['concepts', selectedInvoiceUuid],
		queryFn: async (): Promise<Concept[]> => {
			const uuid = selectedInvoiceUuid.value;
			if (!uuid) {
				throw new Error('No se ha proporcionado un UUID de factura.');
			}
			const params = new URLSearchParams({ uuid_factura: uuid });
			const { data } = await axiosInstance.get('/factura/concepto', {
				params,
			});
			const parsedData = ConceptResponseSchema.parse(data);
			return parsedData.object;
		},
		enabled: computed(() => !!selectedInvoiceUuid.value),
		refetchOnWindowFocus: false,
		staleTime: 1000 * 60 * 10,
	});

	// --- GETTERS (usando computed) ---

	// Un getter computado para acceder fácilmente a la lista de facturas.
	// Devuelve un array vacío si los datos aún no están disponibles.
	const invoices = computed(() => invoicesQuery.data.value ?? []);
	const isLoading = computed(() => invoicesQuery.isLoading.value);
	const isError = computed(() => invoicesQuery.isError.value);
	const error = computed(() => invoicesQuery.error.value);

	const isConceptsLoading = computed(() => conceptsQuery.isLoading.value);
	const isConceptsError = computed(() => conceptsQuery.isError.value);
	const conceptsError = computed(() => conceptsQuery.error.value);

	// Getter que encuentra la factura base en la lista ya cargada
	const selectedInvoiceBase = computed(() => {
		if (!selectedInvoiceUuid.value || invoices.value.length === 0) {
			return null;
		}
		return invoices.value.find((inv) => inv.uuid === selectedInvoiceUuid.value) ?? null;
	});

	// --- GETTER PRINCIPAL: COMBINA LA FACTURA BASE CON SUS CONCEPTOS ---
	const selectedInvoice = computed(() => {
		const base = selectedInvoiceBase.value;
		const conceptsData = conceptsQuery.data.value;

		if (!base) return null;

		// Mapeamos los conceptos de la API a la estructura que espera el componente
		// y los añadimos a la factura base.
		const mappedConcepts = (conceptsData ?? []).map((c) => ({
			id: c.id_concepto, // El componente espera un ID de string
			descripcion: c.descripcion,
			cantidad: c.cantidad,
			unidad: c.unidad,
			valorUnitario: c.valor_unitario,
			importe: c.importe,
			// Aseguramos que el estatus coincida con los valores esperados
			estatus: c.estatus === 'Completado' ? 'Completado' : ('Pendiente' as const),
			// Inicializamos los prorrateos como un array vacío
			prorrateos: [],
		}));

		return {
			...base,
			conceptos: mappedConcepts,
		};
	});

	// --- ACCIONES ---

	/**
	 * Actualiza los filtros y dispara automáticamente una nueva llamada a la API
	 * gracias a la reactividad de la queryKey en `useQuery`.
	 * @param newFilters - Un objeto con los nuevos valores de filtro.
	 */
	const setFilters = (newFilters: Partial<InvoiceFilters>) => {
		filters.value = { ...filters.value, ...newFilters };
	};

	/**
	 * Permite forzar una recarga manual de los datos.
	 */
	const refetchInvoices = () => {
		return invoicesQuery.refetch();
	};

	/**
	 * Reinicia los filtros a su estado inicial.
	 */
	const resetFilters = () => {
		filters.value = {
			estatus: '',
			fechaOrigen: '',
			fechaLimite: '',
			tipoFechaBusqueda: '',
		};
	};

	const selectInvoiceForDetail = (uuid: string) => {
		selectedInvoiceUuid.value = uuid;
	};

	/**
	 * Limpia el UUID de la factura seleccionada, desactivando la query.
	 */
	const clearSelectedInvoice = () => {
		selectedInvoiceUuid.value = null;
	};

	// Exponer el estado, getters y acciones para que puedan ser usados en los componentes
	return {
		// Estado
		filters,

		// Queries (para acceso a más detalles como isFetching, etc.)
		invoicesQuery,
		conceptsQuery,
		selectedInvoiceUuid,
		selectedInvoice,

		// Getters
		invoices,
		isLoading,
		isError,
		error,
		isConceptsLoading,
		isConceptsError,
		conceptsError,

		// Acciones
		setFilters,
		refetchInvoices,
		resetFilters,
		selectInvoiceForDetail,
		clearSelectedInvoice,
	};
});
