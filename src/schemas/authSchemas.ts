import { z } from 'zod'

export const ModuloSchema = z.object({
	id_modulo: z.number(),
	descripcion: z.string(),
	codigo: z.string(),
	permisos: z.null(),
})
export type Modulo = z.infer<typeof ModuloSchema>

export const PerfilSchema = z.object({
	id_perfil: z.number(),
	descripcion: z.string(),
	estatus: z.string(),
	codigo: z.string(),
	modulos: z.null(),
})
export type Perfil = z.infer<typeof PerfilSchema>

export const AuthenticatedUserSchema = z.object({
	id: z.number(),
	username: z.string(),
	permisos: z.array(z.string()),
	nombre: z.string(),
	imagen_perfil: z.string().nullable(),
	email_address: z.email(),
	modulos: z.array(ModuloSchema),
	perfiles: z.array(PerfilSchema),
	proveedor: z.boolean().nullable(),
	resetPassword: z.boolean(),
	estatus: z.string(),
	accessToken: z.string(),
	tokenType: z.string(),
})
export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>
