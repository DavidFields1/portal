import { z } from 'zod';
import { ProrrateoSchema } from './prorrateoSchemas';

export const ConceptSchema = z.object({
	id_concepto: z.number(),
	uuid_factura: z.string(),
	clave_prod_serv: z.string(),
	cantidad: z.number(),
	clave_unidad: z.string(),
	unidad: z.string(),
	descripcion: z.string(),
	valor_unitario: z.number(),
	importe: z.number(),
	estatus: z.string(),
	prorrateos: z.array(ProrrateoSchema).nullable().optional(),
	fecha_creacion: z.string(),
	fecha_modificacion: z.string(),
});
export type Concept = z.infer<typeof ConceptSchema>;

export const ConceptResponseSchema = z.object({
	status: z.string(),
	errorDescription: z.string().nullable(),
	object: z.array(ConceptSchema),
	message: z.string(),
});
export type DeviationsResponse = z.infer<typeof ConceptResponseSchema>;

export const PurchaseOrdersSchema = z.array(ConceptSchema);
export type PurchaseOrders = z.infer<typeof ConceptSchema>;
