// src/stores/invoiceMonitorStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import axiosInstance from '@/config/axiosInstance';
import { InvoiceMonitorResponseSchema, type InvoiceMonitor } from '@/schemas/invoiceSchemas';

// Interfaz para los filtros de búsqueda
interface InvoiceFilters {
	estatus: string;
	fechaOrigen: string;
	fechaLimite: string;
	tipoFechaBusqueda: string; // por ejemplo: 'creacion', 'expedicion'
}

export const useInvoiceMonitorStore = defineStore('invoice-monitor', () => {
	// --- ESTADO ---

	// Estado para los filtros de búsqueda, reactivo para que TanStack Query reaccione a los cambios
	const filters = ref<InvoiceFilters>({
		estatus: '',
		fechaOrigen: '',
		fechaLimite: '',
		tipoFechaBusqueda: '',
	});

	// Estado para la paginación (si es necesaria en el futuro)
	const searchAfter = ref(0);

	// --- QUERIES (con TanStack Query) ---

	/**
	 * Query para obtener las facturas del monitor.
	 * Se ejecuta automáticamente cuando el store es instanciado en un componente.
	 * Vuelve a ejecutarse si los filtros cambian.
	 */
	const invoicesQuery = useQuery({
		// La clave de la query incluye los filtros para que se invalide y se vuelva a ejecutar si cambian
		queryKey: ['invoices', filters],
		queryFn: async (): Promise<InvoiceMonitor[]> => {
			// Construir los parámetros de la URL de forma segura
			const params = new URLSearchParams({
				tipoFactura: 'SOC',
				searchAfter: searchAfter.value.toString(),
				estatus: filters.value.estatus,
				fechaOrigen: filters.value.fechaOrigen,
				fechaLimite: filters.value.fechaLimite,
				tipoFechaBusqueda: filters.value.tipoFechaBusqueda,
			});

			// Realizar la petición GET
			const { data } = await axiosInstance.get('/factura', { params });

			// Validar la respuesta con el esquema de Zod. Si falla, lanzará un error.
			const parsedData = InvoiceMonitorResponseSchema.parse(data);

			// Devolver el array de facturas
			return parsedData.object;
		},
		// Opciones adicionales de TanStack Query
		refetchOnWindowFocus: false, // Evita refetches innecesarios al cambiar de pestaña
		staleTime: 1000 * 60 * 5, // Considera los datos "frescos" por 5 minutos
	});

	// --- GETTERS (usando computed) ---

	// Un getter computado para acceder fácilmente a la lista de facturas.
	// Devuelve un array vacío si los datos aún no están disponibles.
	const invoices = computed(() => invoicesQuery.data.value ?? []);

	// Exponer el estado de carga para mostrar un mensaje de "loading" en la UI.
	const isLoading = computed(() => invoicesQuery.isLoading.value);

	// Exponer el estado de error para manejar fallos en la UI.
	const isError = computed(() => invoicesQuery.isError.value);
	const error = computed(() => invoicesQuery.error.value);

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

	// Exponer el estado, getters y acciones para que puedan ser usados en los componentes
	return {
		// Estado
		filters,

		// Queries (para acceso a más detalles como isFetching, etc.)
		invoicesQuery,

		// Getters
		invoices,
		isLoading,
		isError,
		error,

		// Acciones
		setFilters,
		refetchInvoices,
		resetFilters,
	};
});
