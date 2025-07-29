import { z } from 'zod';

export const StepSchema = z.object({
	id: z.string(),
	name: z.string(),
	icon: z.any(),
});

export const InvoiceDataSchema = z.object({
	folio: z.string().min(1, 'El folio es requerido'),
	moneda: z.enum(['MXN', 'USD', 'EUR']),
	importe: z.number().min(0.01, 'El importe debe ser mayor a 0'),
	sociedad: z.string().min(1, 'La sociedad es requerida'),
});

export type Step = z.infer<typeof StepSchema>;
export type InvoiceData = z.infer<typeof InvoiceDataSchema>;
