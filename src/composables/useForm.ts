// src/composables/useZodForm.ts

import { reactive } from 'vue'
import { z, ZodError, type ZodObject } from 'zod'

// Usamos genéricos para que el composable funcione con cualquier schema y tipo de datos.
// T: El tipo del schema de Zod (ej. credentialsSchema)
// TData: El tipo de datos inferido del schema (ej. Credentials)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useForm<T extends ZodObject<any>, TData = z.infer<T>>(
	schema: T,
	initialValues: TData & object,
) {
	// Estado reactivo para los datos del formulario
	const form = reactive({ ...(initialValues as object) }) as TData

	// Estado reactivo para los errores de validación
	const errors = reactive<Partial<Record<keyof TData, string>>>({})

	/**
	 * Valida un campo específico del formulario.
	 * Ideal para usar con el evento @blur en los inputs.
	 * @param field - El nombre del campo a validar.
	 */
	function validateField(field: keyof TData) {
		try {
			// Usamos .pick para validar solo una parte del schema
			// Usamos .pick para validar solo una parte del schema
			schema.pick({ [field as string]: true }).parse({ [field]: form[field] })
			// Si la validación es exitosa, eliminamos el error para ese campo.
			delete (errors as Partial<Record<string, string>>)[field as string]
		} catch (e) {
			if (e instanceof ZodError) {
				;(errors as Partial<Record<string, string>>)[field as string] = e.issues[0].message
			}
		}
	}

	/**
	 * Crea un manejador de envío que primero valida el formulario completo.
	 * Si la validación es exitosa, llama al callback `onSuccess` con los datos validados.
	 * @param onSuccess - La función a ejecutar cuando el formulario es válido.
	 * @returns Una función para ser usada como manejador de eventos @submit.
	 */
	function handleSubmit(onSuccess: (data: TData) => void) {
		return () => {
			const result = schema.safeParse(form)

			// Limpiamos errores previos
			Object.keys(errors).forEach(
				(key) => delete (errors as Partial<Record<string, string>>)[key],
			)

			if (!result.success) {
				// Si la validación falla, poblamos el objeto de errores
				result.error.issues.forEach((issue) => {
					const key = issue.path[0] as string
					;(errors as Record<string, string>)[key] = issue.message
				})
				return // Detenemos la ejecución
			}

			// Si la validación es exitosa, llamamos al callback con los datos limpios y tipados
			onSuccess(result.data as TData)
		}
	}

	return {
		form,
		errors,
		validateField,
		handleSubmit,
	}
}
