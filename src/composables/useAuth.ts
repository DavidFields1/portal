import { z } from 'zod'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { useMutation } from '@tanstack/vue-query'
import { AuthenticatedUserSchema, type AuthenticatedUser } from '@/schemas/authSchemas'
// import { toast } from 'vue-sonner'

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
			const { data } = await axios.post('http://13.216.21.166/reciboo-api/auth/signin', creds)
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
