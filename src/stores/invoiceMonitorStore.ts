import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import axiosInstance from '@/config/axiosInstance';
import {
	InvoiceMonitorResponseSchema,
	// type InvoiceData,
	type InvoiceMonitor,
} from '@/schemas/invoiceSchemas';
import { ConceptResponseSchema, type Concept } from '@/schemas/conceptSchemas';
import type { Prorrateo } from '@/schemas/prorrateosSchema';

interface InvoiceFilters {
	estatus: string;
	fechaOrigen: string;
	fechaLimite: string;
	tipoFechaBusqueda: string;
}

export const useInvoiceMonitorStore = defineStore('invoice-monitor', () => {
	// ! STATE
	const filters = ref<InvoiceFilters>({
		estatus: '',
		fechaOrigen: '',
		fechaLimite: '',
		tipoFechaBusqueda: '',
	});
	const selectedInvoiceUuid = ref<string | null>(null);
	const searchAfter = ref(0);
	// const selectedInvoice = ref<InvoiceData | null>(null);

	// ! QUERIES
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
			// return parsedData.object;
			return parsedData.object.map((concept) => ({
				...concept,
				prorrateos: [],
			}));
		},
		enabled: computed(() => !!selectedInvoiceUuid.value),
		refetchOnWindowFocus: false,
		staleTime: 1000 * 60 * 10,
	});

	// ! GETTERS
	// FACTURAS
	const invoices = computed(() => invoicesQuery.data.value ?? []);
	const isLoading = computed(() => invoicesQuery.isLoading.value);
	const isError = computed(() => invoicesQuery.isError.value);
	const error = computed(() => invoicesQuery.error.value);

	// CONCEPTOS
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

	// COMBINA LA FACTURA BASE CON SUS CONCEPTOS
	const selectedInvoiceWithConcepts = computed(() => {
		const base = selectedInvoiceBase.value;
		const conceptsData = conceptsQuery.data.value;

		if (!base) return null;

		return {
			...base,
			conceptos: conceptsData ?? null, // Ensure we return null if conceptsData is undefined
		};
	});

	// ! ACCIONES
	const setFilters = (newFilters: Partial<InvoiceFilters>) => {
		filters.value = { ...filters.value, ...newFilters };
	};
	const refetchInvoices = () => {
		return invoicesQuery.refetch();
	};
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
	const clearSelectedInvoice = () => {
		selectedInvoiceUuid.value = null;
	};

	const _mergeProrateosIntoConcepts = (prorrateos: Prorrateo[]) => {
		
		if (!conceptsQuery.data.value || !prorrateos) return;

		// Crear un mapa para agrupar prorrateos por id_concepto
		const prorrateosByConceptId = new Map<number, Prorrateo[]>();
		for (const p of prorrateos) {
			if (!prorrateosByConceptId.has(p.id_concepto)) {
				prorrateosByConceptId.set(p.id_concepto, []);
			}
			prorrateosByConceptId.get(p.id_concepto)?.push(p);
		}

		// Asignar los prorrateos a cada concepto
		conceptsQuery.data.value.forEach((concept) => {
			concept.prorrateos = prorrateosByConceptId.get(concept.id_concepto) ?? [];
		});
	};

	return {
		// Estado
		filters,
		selectedInvoiceUuid,
		selectedInvoice: selectedInvoiceWithConcepts,

		// Queries
		invoicesQuery,
		conceptsQuery,

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
		_mergeProrateosIntoConcepts,
	};
});
