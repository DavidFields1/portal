import { z } from 'zod';

export const ProrrateosSchema = z.object({
	id_prorrateo: z.number(),
	id_concepto: z.number(),
	cuenta_contable: z.string(),
	centro_costo: z.string(),
	indicador_impuesto: z.string(),
	valor_porcentaje: z.number(),
	valor_importe: z.number(),
	fecha_creacion: z.string(),
	fecha_modificacion: z.string(),
	estatus: z.string(),
});

export const ProrrateosResponseSchema = z.object({
	status: z.string(),
	message: z.string(),
	object: z.array(ProrrateosSchema),
	errorDescription: z.string().nullable(),
});

export type Prorrateos = z.infer<typeof ProrrateosSchema>;
export type ProrrateosResponse = z.infer<typeof ProrrateosResponseSchema>;
