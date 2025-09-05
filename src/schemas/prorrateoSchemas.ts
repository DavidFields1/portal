import { z } from 'zod';

export const ProrrateoSchema = z.object({
	id_prorrateo: z.number(),
	id_concepto: z.number(),
	cuenta_contable: z.string(),
	centro_costo: z.string(),
	indicador_impuesto: z.string(),
	valor_porcentaje: z.number(),
	valor_importe: z.number(),
	estatus: z.string(),
	fecha_creacion: z.string(),
	fecha_modificacion: z.string(),
});
export type Prorrateo = z.infer<typeof ProrrateoSchema>;

export const ConceptResponseSchema = z.object({
	status: z.string(),
	errorDescription: z.string().nullable(),
	object: z.array(ProrrateoSchema),
	message: z.string(),
});
export type DeviationsResponse = z.infer<typeof ConceptResponseSchema>;

export const PurchaseOrdersSchema = z.array(ProrrateoSchema);
export type PurchaseOrders = z.infer<typeof ProrrateoSchema>;
