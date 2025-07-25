import axiosInstance from '@/config/axiosInstance'
import { PusrchaseOrderResponseSchema, type PurchaseOrderResponse } from '@/schemas/purchaseOrder'
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'
import { type Ref, toValue } from 'vue'

// Definimos un tipo para las opciones que puede recibir nuestro composable
type UseOrdenesCompraSAPQueryOptions = Omit<
	UseQueryOptions<PurchaseOrderResponse, Error>,
	'queryKey' | 'queryFn'
>

export function useOrdenesCompraSAPQuery(
	idProveedor: Ref<number | null>,
	rfc: Ref<string | null>,
	options: UseOrdenesCompraSAPQueryOptions = {}, // Permite pasar opciones adicionales
) {
	return useQuery<PurchaseOrderResponse, Error>({
		queryKey: ['ordenes-compra', idProveedor, rfc],
		queryFn: async () => {
			const currentId = toValue(idProveedor)
			const currentRfc = toValue(rfc)

			if (!currentId || !currentRfc) {
				// Podrías lanzar un error o retornar un valor específico
				// Si el 'enabled' se maneja correctamente en el componente,
				// esta parte no se debería alcanzar si los valores son nulos.
				throw new Error('ID de Proveedor y RFC son requeridos para la query.')
			}

			const { data } = await axiosInstance.get('/catalogo-sap/orden-compra', {
				params: { idProveedor: currentId, rfc: currentRfc },
			})
			return PusrchaseOrderResponseSchema.parse(data)
		},
		// ==========================================================
		// ESTAS SON LAS OPCIONES CLAVE PARA EVITAR REPETICIONES:
		// ==========================================================

		// 1. staleTime: Cuánto tiempo los datos se consideran "frescos".
		//    Mientras los datos estén frescos, TanStack Query no los refetcheará
		//    automáticamente en un remount o focus de ventana.
		//    Ejemplo: 5 minutos (en milisegundos)
		staleTime: 1000 * 60 * 5,

		// 2. refetchOnMount: Evita refetch al montar el componente si los datos son frescos.
		//    Si staleTime es 0, siempre refetcheará. Si staleTime es > 0, solo si han caducado.
		//    Para control total, a menudo se establece a `false`.
		refetchOnMount: false,

		// 3. refetchOnWindowFocus: Evita refetch cuando la ventana recupera el foco.
		refetchOnWindowFocus: false,

		// 4. refetchOnReconnect: Evita refetch cuando la conexión a la red se recupera.
		refetchOnReconnect: false,
		retry: false,
		// Permite que las opciones pasadas desde el componente sobrescriban estas por defecto
		...options,
	})
}
