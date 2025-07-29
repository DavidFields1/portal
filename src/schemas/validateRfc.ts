import z from 'zod';

export const ValidateRfcResponseSchema = z.object({
	status: z.string(),
	errorDescription: z.string().nullable(),
	object: z.string().nullable(),
	message: z.string(),
});
export type ValidateRfcResponse = z.infer<typeof ValidateRfcResponseSchema>;
