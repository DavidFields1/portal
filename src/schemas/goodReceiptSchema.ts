import { z } from 'zod';

const trimStringToNumber = z.preprocess(
	(val) => (typeof val === 'string' ? val.trim() : val),
	z.coerce.number(),
);

export const GoodsReceiptSchema = z.object({
	// Campos nuevos o con tipos corregidos
	id_factura: z.number().nullable(), // El valor es `null`, por lo que debe ser `nullable`. Asumimos que es un número cuando existe.
	SheetNo: z.string(), // Campo que faltaba en el schema original
	SheetItem: z.string(), // Campo que faltaba en el schema original
	ImporteMl: trimStringToNumber, // Transforma "2030.00 " a 2030
	Cantidad: trimStringToNumber, // Transforma "10.000 " a 10
	PrecioUnit: trimStringToNumber, // Transforma "203.00 " a 203
	Proveedor: z.string(),
	Moneda: z.string(),
	PosDocRef: z.string(),
	DocMaterial: z.string(),
	UnidadMedida: z.string(),
	Material: z.string(),
	ClaveMaterial: z.string(),
	Posicion: z.string(),
	IndImpuestos: z.string(),
	FechaEm: z.string(),
	ClaseMvto: z.string(),
	UmText: z.string(),
	OrdenCompra: z.string(),
	EjercicioDocMat: z.string(),
});
export type GoodsReceipt = z.infer<typeof GoodsReceiptSchema>;

export const GoodsReceiptResponseSchema = z.object({
	status: z.string(),
	errorDescription: z.string().nullable(),
	object: GoodsReceiptSchema.array(),
	message: z.string(),
});
export type GoodsReceiptResponse = z.infer<typeof GoodsReceiptResponseSchema>;

export const PurchaseOrdersSchema = z.array(GoodsReceiptSchema);
export type PurchaseOrders = z.infer<typeof GoodsReceiptSchema>;
