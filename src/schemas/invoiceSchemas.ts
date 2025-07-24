import { z } from 'zod'

export const GoodsReceiptSchema = z.object({
	id: z.string(),
	number: z.string(),
	material: z.string(),
	iva: z.number().min(0),
	date: z.string(),
	amount: z.number().min(0),
	itemCount: z.number().min(1),
	status: z.enum(['Pendiente de Factura', 'Facturado']),
	poNumber: z.string(),
})

export const PurchaseOrderSchema = z.object({
	id: z.string(),
	number: z.string(),
	supplier: z.string(),
	supplierId: z.number(),
	supplierRfc: z.string(),
	date: z.string(),
	totalAmount: z.number().min(0),
	status: z.enum(['Abierta', 'Cerrada Parcialmente', 'Cerrada']),
	goodsReceipts: z.array(GoodsReceiptSchema),
})

export const SupplierSchema = z.object({
	id: z.number(),
	name: z.string(),
	rfc: z.string(),
})

export const StepSchema = z.object({
	id: z.string(),
	name: z.string(),
	icon: z.any(),
})

export const InvoiceDataSchema = z.object({
	folio: z.string().min(1, 'El folio es requerido'),
	moneda: z.enum(['MXN', 'USD', 'EUR']),
	importe: z.number().min(0.01, 'El importe debe ser mayor a 0'),
	sociedad: z.string().min(1, 'La sociedad es requerida'),
})

export const FileUploadSchema = z.object({
	pdf: z.instanceof(File).optional(),
	xml: z.instanceof(File).optional(),
})

// Tipos inferidos
export type GoodsReceipt = z.infer<typeof GoodsReceiptSchema>
export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>
export type Supplier = z.infer<typeof SupplierSchema>
export type Step = z.infer<typeof StepSchema>
export type InvoiceData = z.infer<typeof InvoiceDataSchema>
export type FileUpload = z.infer<typeof FileUploadSchema>

// Esquemas de validación para forms
export const InvoiceFormSchema = InvoiceDataSchema.partial().extend({
	folio: z.string().optional(),
	importe: z.number().optional(),
	sociedad: z.string().optional(),
})

export type InvoiceFormData = z.infer<typeof InvoiceFormSchema>
