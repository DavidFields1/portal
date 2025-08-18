import { z } from 'zod';

export const SocietySchema = z.object({
	Clave: z.string(),
	Descripcion: z.string(),
	RFC: z.string(),
});
export type Society = z.infer<typeof SocietySchema>;

export const SocietyResponseSchema = z.object({
	status: z.string(),
	errorDescription: z.string().nullable(),
	object: SocietySchema.array(),
	message: z.string(),
});
export type SocietyResponse = z.infer<typeof SocietyResponseSchema>;

export const SocietiesSchema = z.array(SocietySchema);
export type SocietyType = z.infer<typeof SocietiesSchema>;
