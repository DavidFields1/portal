import { z } from 'zod';

export const CentrosCostoSchema = z.object({
	Sociedad: z.string(),
	CentroCosto: z.string(),
	Descripcion: z.string(),
});

export const CentroCostoResponseSchema = z.object({
	status: z.string(),
	message: z.string(),
	object: z.array(CentrosCostoSchema),
	errorDescription: z.string().nullable(),
});

export type CentroCosto = z.infer<typeof CentrosCostoSchema>;
export type CentroCostoResponse = z.infer<typeof CentroCostoResponseSchema>;
