import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // Importar store
// import AdminLayout from '@/layouts/AdminLayout.vue' // Importar el Layout
import DashboardView from '../views/DashboardView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
// Podrías añadir una vista para 'NotFound' si quieres
// import NotFoundView from '../views/NotFoundView.vue';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		// Rutas que requieren autenticación (usan el Layout)
		{
			path: '/',
			component: AdminLayout, // Usar el Layout como componente padre
			meta: { requiresAuth: true }, // Proteger todas las rutas hijas
			children: [
				{
					path: '', // Ruta raíz dentro del layout
					name: 'dashboard',
					component: DashboardView,
				},
				{
					path: 'users', // Ruta para usuarios
					name: 'users',
					// Usa lazy loading para cargar la vista de usuarios
					component: () => import('@/views/UsersView.vue'), // <--- ACTUALIZADO
				},
				{
					path: 'settings', // Ruta para configuración
					name: 'settings',
					// Usa lazy loading para cargar la vista de configuración
					component: () => import('@/views/SettingsView.vue'), // <--- ACTUALIZADO
				},
				{
					path: 'invoices', // Nueva ruta
					name: 'invoices',
					component: () => import('@/views/MyInvoices.vue'), // Carga lazy
				},
				{
					path: 'invoices-monitor', // Nueva ruta
					name: 'invoices-monitor',
					component: () => import('@/views/InvoicesMonitorView.vue'), // Carga lazy
				},
				{
					path: '/invoices/:uuid',
					name: 'invoice-detail',
					component: () => import('@/views/InvoiceDetailView.vue'),
					props: true,
				},
				{
					path: 'invoice-upload', // Nueva ruta
					name: 'invoice-upload',
					component: () => import('@/views/POInvoiceUploadView.vue'), // Carga lazy
				},
				{
					path: 'invoice-upload-no-po', // Nueva ruta
					name: 'invoice-upload-no-po',
					component: () => import('../views/NoPOInvoiceUploadView.vue'), // Lazy load, fixed path
				},
				{
					path: 'complements', // Nueva ruta
					name: 'complements',
					component: () => import('@/views/MyComplements.vue'), // Lazy load, fixed path
				},
				{
					path: 'complements/:uuid', // Nueva ruta
					name: 'complements-detail',
					component: () => import('@/views/MyComplementsDetailView.vue'), // Lazy load, fixed path
				},
				{
					path: 'http-logs', // Nueva ruta
					name: 'http-logs',
					component: () => import('@/views/HttpLogView.vue'), // Carga lazy
				},
				{
					path: 'payments', // Nueva ruta
					name: 'payments',
					component: () => import('@/views/PaymentsView.vue'), // Carga lazy
				},
				{
					path: 'payments/:doc_contable', // Nueva ruta
					name: 'payments-detail',
					component: () => import('@/views/PaymentDetailView.vue'), // Carga lazy
				},
				{
					path: 'purchase-order', // Nueva ruta
					name: 'purchase-order',
					component: () => import('@/views/PurchaseOrderView.vue'), // Carga lazy
				},
				{
					path: 'purchase-order/:orden_compra', // Nueva ruta
					name: 'purchase-order-detail',
					component: () => import('@/views/PurchaseOrderDetailView.vue'), // Carga lazy
				},
				// --- Añade aquí otras rutas protegidas ---
				// Ejemplo:
				// {
				//   path: 'users',
				//   name: 'users',
				//   component: () => import('../views/UsersView.vue') // Lazy loading
				// },
			],
		},
		// Rutas públicas (Login, Register)
		{
			path: '/login',
			name: 'login',
			component: LoginView,
			meta: { requiresGuest: true }, // Redirigir si ya está logueado
		},
		{
			path: '/register',
			name: 'register',
			component: RegisterView,
			meta: { requiresGuest: true }, // Redirigir si ya está logueado
		},
		// Ruta Catch-all (Opcional)
		// { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView },
	],
})

// Guardia de Navegación Global
router.beforeEach((to, from, next) => {
	// Es crucial instanciar el store DENTRO del guard
	// porque el router se inicializa antes que Pinia fuera de este contexto.
	const authStore = useAuthStore()

	const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
	const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)

	console.log(
		`Navegando a: ${to.path}, requiresAuth: ${requiresAuth}, requiresGuest: ${requiresGuest}, isAuthenticated: ${authStore.isAuthenticated}`,
	)

	if (requiresAuth && !authStore.isAuthenticated) {
		// Si requiere autenticación y no está logueado, redirige a login
		console.log('Redirigiendo a /login (requiere auth, no logueado)')
		next('/login')
	} else if (requiresGuest && authStore.isAuthenticated) {
		// Si requiere ser invitado (no logueado) y sí está logueado, redirige al dashboard
		console.log('Redirigiendo a / (requiere guest, sí logueado)')
		next('/')
	} else {
		// En cualquier otro caso, permite la navegación
		next()
	}
})

export default router
