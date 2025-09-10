import { z } from 'zod';

export const IndicadoresIvaSchema = z.object({
	IndImpuesto: z.string(),
	Denominacion: z.string(),
	FactorMult: z.string(),
});

export const IndicadoresIvaResponseSchema = z.object({
	status: z.string(),
	message: z.string(),
	object: z.array(IndicadoresIvaSchema),
	errorDescription: z.string().nullable(),
});

export type IndicadoresIva = z.infer<typeof IndicadoresIvaSchema>;
export type IndicadoresIvaResponse = z.infer<typeof IndicadoresIvaResponseSchema>;
