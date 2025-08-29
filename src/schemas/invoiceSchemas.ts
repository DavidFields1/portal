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

// Esquema para un solo objeto de factura en la respuesta
export const InvoiceSchema = z.object({
	id_factura: z.number(),
	uuid: z.string(),
	moneda: z.string(),
	total: z.number(),
	fecha_expedicion: z.string(),
	fecha_timbrado: z.string(),
	fecha_creacion: z.string(),
	razonsocial_emisor: z.string(),
	rfc_emisor: z.string(),
	razonsocial_receptor: z.string(),
	rfc_receptor: z.string(),
	domicilio_fiscal: z.string(),
	metodo_pago: z.string(),
	forma_pago: z.string(),
	estatus: z.string(),
	file_path: z.string(),
	sello: z.string(),
	no_certificado: z.string(),
	certificado: z.string(),
	subtotal: z.number(),
	tipo_comprobante: z.string(),
	regimen_fiscal_receptor: z.string(),
	uso_cfdi: z.string(),
	total_impuestos_trasladados: z.number(),
	total_impuestos_retenidos: z.number(),
	sello_sat: z.string(),
	no_certificado_sat: z.string(),
	tipo_factura: z.string(),
	serie: z.string(),
	folio: z.string(),
	documento_contable: z.string().nullable(),
	ejercicio_fiscal: z.string().nullable(),
	sociedad: z.string(),
	conceptos: z.any().nullable(), // Se puede detallar más si se conoce la estructura
	id_proveedor_sap: z.string(),
});

// Esquema para la respuesta completa del API
export const InvoiceMonitorResponseSchema = z.object({
	message: z.string(),
	status: z.string(),
	object: z.array(InvoiceSchema),
});

// Inferir los tipos de TypeScript a partir de los esquemas
export type InvoiceMonitor = z.infer<typeof InvoiceSchema>;
export type InvoiceMonitorResponse = z.infer<typeof InvoiceMonitorResponseSchema>;
