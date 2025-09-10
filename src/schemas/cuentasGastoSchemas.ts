import { z } from 'zod';

export const CuentasGastoSchema = z.object({
	NumCuentaMayor: z.string(),
	Denominacion: z.string(),
	Sociedad: z.string(),
});

export const CuentasGastoResponseSchema = z.object({
	status: z.string(),
	message: z.string(),
	object: z.array(CuentasGastoSchema),
	errorDescription: z.string().nullable(),
});

export type CuentasGasto = z.infer<typeof CuentasGastoSchema>;
export type CuentasGastoResponse = z.infer<typeof CuentasGastoResponseSchema>;
