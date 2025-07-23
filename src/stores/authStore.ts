import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthenticatedUser } from '@/schemas/authSchemas'

export const useAuthStore = defineStore('auth', () => {
	const user = ref<AuthenticatedUser | null>(null)

	const isAuthenticated = computed(() => !!user.value)

	function setAuth(newToken: string, newUser: AuthenticatedUser) {
		user.value = newUser
		localStorage.setItem('token', newToken)
		localStorage.setItem('user', JSON.stringify(newUser))
	}

	function logout() {
		user.value = null
		localStorage.removeItem('user')
	}

	function loadFromStorage() {
		const localUser = localStorage.getItem('user')
		if (localUser) {
			user.value = JSON.parse(localUser)
		}
	}

	return {
		user,
		isAuthenticated,
		setAuth,
		logout,
		loadFromStorage,
	}
})
