import { z } from 'zod';

export const ModuloSchema = z.object({
	id_modulo: z.number(),
	descripcion: z.string(),
	codigo: z.string(),
	permisos: z.null(),
});
export type Modulo = z.infer<typeof ModuloSchema>;

export const PerfilSchema = z.object({
	id_perfil: z.number(),
	descripcion: z.string(),
	estatus: z.string(),
	codigo: z.string(),
	modulos: z.null(),
});
export type Perfil = z.infer<typeof PerfilSchema>;

export const ProveedorSchema = z.object({
	usuario: z.any().nullable(),
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
});
export type Proveedor = z.infer<typeof ProveedorSchema>;

export const AuthenticatedUserSchema = z.object({
	id: z.number(),
	username: z.string(),
	permisos: z.array(z.string()),
	nombre: z.string(),
	imagen_perfil: z.string().nullable(),
	email_address: z.string().email(),
	modulos: z.array(ModuloSchema),
	perfiles: z.array(PerfilSchema),
	proveedor: ProveedorSchema.nullable(),
	resetPassword: z.boolean(),
	estatus: z.string(),
	accessToken: z.string(),
	tokenType: z.string(),
});
export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>;
