import { z } from 'zod';

export const SocietySchema = z.object({
	Clave: z.string(),
	Descripcion: z.string(),
	RFC: z.string(),
});

export const SocietyResponseSchema = z.object({
	status: z.string(),
	message: z.string(),
	object: z.array(SocietySchema),
	errorDescription: z.string().nullable(),
});

export type Society = z.infer<typeof SocietySchema>;
export type SocietyResponse = z.infer<typeof SocietyResponseSchema>;
