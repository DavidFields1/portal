import z from 'zod'

export const InvoiceDataSchema = z.object({
	folio: z.string().min(1, 'El folio es requerido'),
	moneda: z
		.enum(['MXN', 'USD', 'EUR'])
		.refine((val) => ['MXN', 'USD', 'EUR'].includes(val), {
			message: 'Selecciona una moneda válida',
		}),
	// --- CAMBIO AQUÍ ---
	// Añadimos la regla `.min()` para asegurar que el valor sea al menos 1.
	importe: z
		.number({
			error: 'El importe debe ser un número',
		})
		.min(1, 'El importe debe ser mayor o igual a 1'),
	sociedad: z.string().min(1, 'La sociedad es requerida'),
})
export type InvoiceData = z.infer<typeof InvoiceDataSchema>
