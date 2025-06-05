// src/stores/auth.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'

// Simulamos una interfaz de usuario simple
interface User {
	id: string
	name: string
	email: string
	role?: 'Admin' | 'Editor' | 'Viewer' // Añadir rol opcional
	avatarUrl?: string // Añadir avatar opcional
}

export const useAuthStore = defineStore('auth', () => {
	const router = useRouter()
	const user = ref<User | null>(null)
	const token = ref<string | null>(localStorage.getItem('authToken')) // Cargar token inicial desde localStorage
	const loading = ref(false)
	const error = ref<string | null>(null)

	// Intentar cargar datos del usuario si hay token al inicio
	// En una app real, validarías el token con el backend aquí
	if (token.value) {
		// Simulación: Si hay token, asumimos que es válido y cargamos datos dummy
		user.value = {
			id: 'user-123', // O el ID que corresponda
			name: localStorage.getItem('userName') || 'Usuario Ejemplo', // Asumiendo que guardas el nombre
			email: localStorage.getItem('userEmail') || 'usuario@ejemplo.com',
			role: (localStorage.getItem('userRole') as User['role']) || 'Viewer', // Asumiendo que guardas el rol
			avatarUrl: localStorage.getItem('userAvatar') || undefined, // Asumiendo que guardas el avatar
		}
		console.log('Usuario cargado desde token existente.')
	}

	const isAuthenticated = computed(() => !!user.value && !!token.value)

	async function login(email: string, password: string): Promise<boolean> {
		loading.value = true
		error.value = null
		try {
			console.log('Simulando llamada a API para login...')
			await new Promise((resolve) => setTimeout(resolve, 1000)) // Simular delay de red

			// --- Lógica de Autenticación Simulada ---
			// ¡¡REEMPLAZAR con tu llamada real a la API!!
			if (email === 'admin@test.com' && password === 'password') {
				const simulatedToken = `fake-jwt-token-${Date.now()}`
				const simulatedUser: User = {
					id: 'admin-001',
					name: 'Admin Test',
					email: email,
					role: 'Admin', // Añadir rol simulado
					avatarUrl: '/placeholder-avatar.jpg', // Añadir URL simulada (asegúrate de tener una imagen en public/placeholder-avatar.jpg o quita esto)
				}

				token.value = simulatedToken
				user.value = simulatedUser
				localStorage.setItem('authToken', simulatedToken) // Guardar token
				localStorage.setItem('userEmail', simulatedUser.email) // Guardar email (para demo)
				console.log('Login simulado exitoso')
				return true
			} else {
				throw new Error('Credenciales inválidas.')
			}
			// --- Fin Simulación ---
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			console.error('Error en login:', err)
			error.value = err.message || 'Ocurrió un error al iniciar sesión.'
			token.value = null
			user.value = null
			localStorage.removeItem('authToken')
			localStorage.removeItem('userEmail')
			return false
		} finally {
			loading.value = false
		}
	}

	async function register(name: string, email: string, password: string): Promise<boolean> {
		loading.value = true
		error.value = null
		try {
			console.log('Simulando llamada a API para registro...')
			console.log(`Nombre: ${name}, Email: ${email}, Contraseña: ${password}`)

			await new Promise((resolve) => setTimeout(resolve, 1000))

			// --- Lógica de Registro Simulada ---
			// ¡¡REEMPLAZAR con tu llamada real a la API!!
			// Aquí simplemente simulamos éxito. En una app real, la API crearía el usuario.
			console.log('Registro simulado exitoso para:', email)
			// Podrías hacer login automático después del registro si tu API lo soporta/devuelve token
			// await login(email, password); // Opcional: login automático
			return true
			// --- Fin Simulación ---
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			console.error('Error en registro:', err)
			error.value = err.message || 'Ocurrió un error durante el registro.'
			return false
		} finally {
			loading.value = false
		}
	}

	function logout() {
		console.log('Cerrando sesión...')
		user.value = null
		token.value = null
		error.value = null
		localStorage.removeItem('authToken')
		localStorage.removeItem('userEmail')
		// Redirigir a login después de limpiar el estado
		router.push('/login')
	}

	return {
		user,
		token,
		loading,
		error,
		isAuthenticated,
		login,
		logout,
		register,
	}
})
