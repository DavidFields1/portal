import { z } from 'zod'

export const PurchaseOrderSchema = z.object({
	DocumentoCompras: z.string(),
	CondPago: z.string(),
	Sociedad: z.string(),
	Isanual: z.number().nullable(),
	Monto: z.string(),
	Moneda: z.string(),
	FechaCreacion: z.string(),
	NoProveedor: z.string(),
	Rfc: z.string(),
})
export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>

const ObjectSchema = z.object({
	content: PurchaseOrderSchema.array(),
})
export const PusrchaseOrderResponseSchema = z.object({
	status: z.string(),
	errorDescription: z.string().nullable(),
	object: ObjectSchema,
	message: z.string(),
})
export type PurchaseOrderResponse = z.infer<typeof PusrchaseOrderResponseSchema>

export const PurchaseOrdersSchema = z.array(PurchaseOrderSchema)
export type PurchaseOrders = z.infer<typeof PurchaseOrdersSchema>
