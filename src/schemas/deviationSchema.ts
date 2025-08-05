import { z } from 'zod';

export const DeviationSchema = z.object({
	id: z.string(),
	descripcion: z.string(),
	moneda: z.string(),
	monto: z.number(),
	estatus: z.string(),
	fecha_creacion: z.string(),
	fecha_modificacion: z.string(),
});
export type Deviation = z.infer<typeof DeviationSchema>;

export const DeviationsResponseSchema = z.object({
	status: z.string(),
	errorDescription: z.string().nullable(),
	object: DeviationSchema.array(),
	message: z.string(),
});
export type DeviationsResponse = z.infer<typeof DeviationsResponseSchema>;

export const PurchaseOrdersSchema = z.array(DeviationSchema);
export type PurchaseOrders = z.infer<typeof DeviationSchema>;
