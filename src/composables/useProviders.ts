import axiosInstance from '@/config/axiosInstance'
import { ProvidersResponseSchema, type ProvidersResponse } from '@/schemas/providerSchema'
import { useQuery } from '@tanstack/vue-query'

export function useProvidersQuery() {
	return useQuery<ProvidersResponse, Error>({
		queryKey: ['proveedores'],
		queryFn: async () => {
			const { data } = await axiosInstance.get('/proveedor?estatus=ACTIVO')
			// Validación Zod
			return ProvidersResponseSchema.parse(data)
		},
	})
}

// AQUI VAN LAS DEMAS PETICIONES PARA CRUD
