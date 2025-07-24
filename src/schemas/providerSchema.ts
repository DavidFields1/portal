import { z } from 'zod'

export const ProviderSchema = z.object({
	usuario: z.null(),
	id_proveedor: z.number(),
	id_usuario: z.number(),
	id_proveedor_sap: z.string(),
	id_bloqueo: z.number(),
	nombre_razon_social: z.string(),
	rfc: z.string(),
	pais_clave: z.string(),
	file_path: z.string(),
	fecha_creacion: z.string(),
	fecha_modificacion: z.string(),
})
export type Provider = z.infer<typeof ProviderSchema>

const ObjectSchema = z.object({
	content: ProviderSchema.array(),
})
export const ProvidersResponseSchema = z.object({
	status: z.string(),
	errorDescription: z.string().nullable(),
	object: ObjectSchema,
	message: z.string(),
})
export type ProvidersResponse = z.infer<typeof ProvidersResponseSchema>

export const ProvidersSchema = z.array(ProviderSchema)
export type Providers = z.infer<typeof ProvidersSchema>
