import { z } from 'zod'

export const GoodsReceiptSchema = z.object({
	id_factura: z.string().nullable(),
	OrdenCompra: z.string(),
	UmText: z.string(),
	EjercicioDocMat: z.string().nullable(),
	PrecioUnit: z.string(),
	ClaseMvto: z.string(),
	FechaEm: z.string(),
	Posicion: z.string(),
	IndImpuestos: z.string(),
	ClaveMaterial: z.string(),
	Material: z.string(),
	Cantidad: z.string(),
	UnidadMedida: z.string(),
	ImporteMl: z.string(),
	DocMaterial: z.string(),
	PosDocRef: z.string(),
	Moneda: z.string(),
	Proveedor: z.string(),
})
export type GoodsReceipt = z.infer<typeof GoodsReceiptSchema>

export const GoodsReceiptResponseSchema = z.object({
	status: z.string(),
	errorDescription: z.string().nullable(),
	object: GoodsReceiptSchema.array(),
	message: z.string(),
})
export type GoodsReceiptResponse = z.infer<typeof GoodsReceiptResponseSchema>

export const PurchaseOrdersSchema = z.array(GoodsReceiptSchema)
export type PurchaseOrders = z.infer<typeof GoodsReceiptSchema>
