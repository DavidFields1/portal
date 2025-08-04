import { z } from 'zod';

export const PurchaseOrderSchema = z.object({
	DocumentoCompras: z.string(),
	Sociedad: z.string(),
	Moneda: z.string(),
	FechaCreacion: z.string(),
	Rfc: z.string(),
	CondPago: z.string(),
	IsAnual: z.coerce.boolean(), // Transforma el string "false" a un booleano `false`
	Monto: z.coerce.number(), // Transforma el string "2030.00" a un número `2030`
	NoProveedor: z.string(), // Se mantiene como string, puede estar vacío
	DenominacionSociedad: z.string(),
	CodigoPostalSociedad: z.string(),
	RfcSociedad: z.string(),
	RegFiscalSociedad: z.string(),
	Proveedor: z.string(),
	NombreProveedor: z.string(),
	CodigoPostalProveedor: z.string(),
	RegFiscalProveedor: z.string(),
	ClaveTipoPedido: z.string(),
	TipoPedido: z.string(),
});
export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>;

export const PurchaseOrderResponseSchema = z.object({
	status: z.string(),
	errorDescription: z.string().nullable(),
	object: PurchaseOrderSchema.array(),
	message: z.string(),
});
export type PurchaseOrderResponse = z.infer<typeof PurchaseOrderResponseSchema>;

export const PurchaseOrdersSchema = z.array(PurchaseOrderSchema);
export type PurchaseOrders = z.infer<typeof PurchaseOrdersSchema>;
