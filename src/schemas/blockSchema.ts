import { z } from 'zod';

export const BlockSchema = z.object({
	id: z.string(),
	nombre: z.string(),
	descripcion: z.string(),
	modulos: z.array(z.string()),
	fecha_creacion: z.string(),
	fecha_modificacion: z.string(),
});
export type Block = z.infer<typeof BlockSchema>;

export const BlocksResponseSchema = z.object({
	status: z.string(),
	errorDescription: z.string().nullable(),
	object: BlockSchema.array(),
	message: z.string(),
});
export type BlocksResponse = z.infer<typeof BlocksResponseSchema>;

export const BlocksSchema = z.array(BlockSchema);
export type Blocks = z.infer<typeof BlockSchema>;
