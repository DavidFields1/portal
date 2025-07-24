import { z } from 'zod'
import { useAuthStore } from '@/stores/authStore'
import { useMutation } from '@tanstack/vue-query'
import { AuthenticatedUserSchema, type AuthenticatedUser } from '@/schemas/authSchemas'
import axiosInstance from '@/config/axiosInstance'

export const credentialsSchema = z.object({
	email: z.email('El email es obligatorio'),
	password: z.string().min(1, 'La contraseña es obligatoria'),
})
export type Credentials = z.infer<typeof credentialsSchema>

export function useLogin() {
	const auth = useAuthStore()

	return useMutation<AuthenticatedUser, Error, Credentials>({
		mutationFn: async (creds: Credentials) => {
			credentialsSchema.parse(creds)
			const { data } = await axiosInstance.post('/auth/signin', creds)
			return AuthenticatedUserSchema.parse(data)
		},
		onSuccess(userData: AuthenticatedUser) {
			auth.setAuth(userData.accessToken, userData)
		},
		onError(err: Error) {
			console.error('Login failed:', err.message)
		},
	})
}
