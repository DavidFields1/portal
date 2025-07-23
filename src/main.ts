import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

import App from './App.vue'
import router from './router'
import './assets/main.css'
import { useAuthStore } from './stores/authStore'

const app = createApp(App)
const pinia = createPinia()

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 3,
			refetchOnWindowFocus: false,
		},
		mutations: {
			retry: 0,
		},
	},
})

app.use(pinia) // Usar Pinia
app.use(router)
app.use(VueQueryPlugin, { queryClient })
useAuthStore(pinia).loadFromStorage()

app.mount('#app')
