import { reactive } from 'vue'
import { z, ZodError, type ZodObject } from 'zod'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useForm<T extends ZodObject<any>, TData = z.infer<T>>(
	schema: T,
	initialValues: TData & object,
) {
	// datos del formulario
	const form = reactive({ ...(initialValues as object) }) as TData
	const errors = reactive<Partial<Record<keyof TData, string>>>({})

	function validateField(field: keyof TData) {
		try {
			schema.pick({ [field as string]: true }).parse({ [field]: form[field] })
			delete (errors as Partial<Record<string, string>>)[field as string]
		} catch (e) {
			if (e instanceof ZodError) {
				;(errors as Partial<Record<string, string>>)[field as string] = e.issues[0].message
			}
		}
	}

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
				return
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
