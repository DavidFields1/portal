<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useLayoutStore } from '@/stores/layoutStore' // <-- 1. Importar el store del layout

import {
	LayoutDashboard,
	Users as UsersIcon,
	CreditCard,
	Settings2,
	ChevronRight,
	PanelLeft,
	LogOut,
	PackageCheck,
	Bell,
	Check,
	ChevronDown,
	Receipt,
	ScanBarcode,
} from 'lucide-vue-next'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Toaster } from '@/components/ui/sonner'

// --- Estado del Layout ---
const MOBILE_BREAKPOINT = 768
const sidebarOpen = ref(true)
const sidebarCollapsed = ref(false)
const isMobile = ref(false)
const openNavItems = ref<string[]>([])
const hoveredNavItem = ref<string | null>(null)
const hoverTimeout = ref<number | null>(null)

// --- Integración con Stores ---
const authStore = useAuthStore()
const layoutStore = useLayoutStore() // <-- 2. Instanciar el store
const user = computed(() => authStore.user)

// --- Datos de Navegación (sin cambios) ---
const navMain = [
	{ title: 'Dashboard', url: '/', icon: LayoutDashboard },
	{
		title: 'Administración',
		icon: UsersIcon,
		items: [
			{ title: 'Usuarios', url: '/users' },
			{ title: 'Log de Peticiones', url: '/http-logs' },
		],
	},
	{
		title: 'Facturación',
		icon: CreditCard,
		items: [
			{ title: 'Mis Facturas', url: '/invoices' },
			{ title: 'Monitor de Facturas', url: '/invoices-monitor' },
			// { title: "Carga de Factura con OC", url: "/invoice-upload" },
			// { title: "Carga de Factura sin OC", url: "/invoice-upload-no-po" },
			{ title: 'Carga de Factura con OC', url: '/invoice/upload' },
			{ title: 'Carga de Factura sin OC', url: '/invoice-upload-no-po' },
			{ title: '[ALT] Carga de Factura con OC', url: '/invoice/upload' },
			{ title: '[ALT] Carga de Factura sin OC', url: '/invoice/upload-no-po' },
		],
	},
	{
		title: 'Complementos',
		icon: PackageCheck,
		items: [
			{ title: 'Mis Complementos', url: '/complements' },
			// { title: "Complementos de Pago", url: "/complements-pay" },
		],
	},
	{ title: 'Pagos', url: '/payments', icon: Receipt },
	{ title: 'Ordenes de Compra', url: '/purchase-order', icon: ScanBarcode },
	{ title: 'Configuración', url: '/settings', icon: Settings2 },
]

// --- Notificaciones e Idioma (sin cambios) ---
const notifications = ref([
	{
		id: 1,
		title: 'Nueva factura recibida',
		description: 'La factura #INV-2025-001 ha sido procesada.',
		time: '10 min',
		read: false,
	},
	{
		id: 2,
		title: 'Complemento de pago aprobado',
		description: 'Tu complemento de pago ha sido aprobado.',
		time: '1 hora',
		read: false,
	},
	{
		id: 3,
		title: 'Mantenimiento programado',
		description: 'El sistema estará en mantenimiento el 10/07.',
		time: '2 días',
		read: true,
	},
])
const unreadNotificationsCount = computed(() => notifications.value.filter((n) => !n.read).length)
const markAllAsRead = () => {
	notifications.value.forEach((n) => (n.read = true))
}
const markAsRead = (id: number) => {
	const notification = notifications.value.find((n) => n.id === id)
	if (notification) {
		notification.read = true
	}
}
const languages = [
	{ code: 'es', name: 'Español', flag: '🇪🇸' },
	{ code: 'en', name: 'English', flag: '🇺🇸' },
	{ code: 'fr', name: 'Français', flag: '🇫🇷' },
]
const currentLang = ref('es')
const currentLanguage = computed(
	() => languages.find((lang) => lang.code === currentLang.value) || languages[0],
)
const changeLanguage = (lang: string) => {
	currentLang.value = lang
}

// --- Métodos del Layout (sin cambios) ---
const checkMobile = () => {
	isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
	if (isMobile.value) {
		sidebarCollapsed.value = false
	}
}
const toggleSidebar = () => {
	if (isMobile.value) {
		sidebarOpen.value = !sidebarOpen.value
	} else {
		sidebarCollapsed.value = !sidebarCollapsed.value
	}
}
const closeSidebar = () => {
	if (isMobile.value) {
		sidebarOpen.value = false
	}
}
const toggleNavItem = (title: string) => {
	if (sidebarCollapsed.value && !isMobile.value) return
	const index = openNavItems.value.indexOf(title)
	if (index > -1) {
		openNavItems.value.splice(index, 1)
	} else {
		openNavItems.value.push(title)
	}
}
const isNavItemOpen = (title: string) => {
	return openNavItems.value.includes(title) && (!sidebarCollapsed.value || isMobile.value)
}
const handleLogout = () => {
	authStore.logout()
}
const getInitials = (name: string | undefined): string => {
	if (!name) return 'U'
	return name
		.split(' ')
		.map((n) => n[0])
		.slice(0, 2)
		.join('')
		.toUpperCase()
}
const handleMouseEnter = (title: string) => {
	if (hoverTimeout.value) {
		clearTimeout(hoverTimeout.value)
		hoverTimeout.value = null
	}
	hoveredNavItem.value = title
}
const handleMouseLeave = () => {
	hoverTimeout.value = window.setTimeout(() => {
		hoveredNavItem.value = null
	}, 100)
}

// --- Clases Computadas (MODIFICADAS) ---
const sidebarClasses = computed(() => {
	if (isMobile.value) {
		return [
			'fixed left-0 top-0 z-50 h-screen w-64 transform bg-background border-r border-border transition-transform duration-300 ease-in-out',
			{ 'translate-x-0': sidebarOpen.value, '-translate-x-full': !sidebarOpen.value },
		]
	} else {
		return [
			'fixed left-0 top-0 z-40 h-screen bg-background border-r border-border transition-all duration-300 ease-in-out',
			{ 'w-64': !sidebarCollapsed.value, 'w-20': sidebarCollapsed.value },
		]
	}
})

// 3. Modificar las clases del contenido principal para que deje espacio a la derecha
const mainContentClasses = computed(() => {
	const classes = ['flex flex-1 flex-col transition-all duration-300 ease-in-out']
	if (isMobile.value) {
		return 'flex flex-1 flex-col'
	}
	classes.push(!sidebarCollapsed.value ? 'ml-64' : 'ml-20')
	// Si la barra lateral derecha está visible, añade un margen a la derecha
	if (layoutStore.isRightSidebarVisible) {
		classes.push('mr-80') // Coincide con el ancho de la nueva barra (w-80)
	}
	return classes
})

// --- Hooks de Ciclo de Vida (sin cambios) ---
onMounted(() => {
	checkMobile()
	window.addEventListener('resize', checkMobile)
	if (isMobile.value) {
		sidebarOpen.value = false
	}
})
onUnmounted(() => {
	window.removeEventListener('resize', checkMobile)
})
</script>

<template>
	<div class="flex h-screen bg-background overflow-hidden">
		<!-- Sidebar Izquierdo (sin cambios) -->
		<aside :class="sidebarClasses">
			<div class="flex h-full flex-col">
				<div class="flex h-16 shrink-0 items-center border-b border-border"
					:class="[sidebarCollapsed && !isMobile ? 'justify-center' : 'px-4']">
					<RouterLink to="/" :class="['flex items-center', sidebarCollapsed && !isMobile ? '' : 'gap-2']">
						<!-- <LayoutDashboard class="h-6 w-6 text-primary" /> -->
						<img src="../assets/logo.svg" alt="Reciboo" class="h-10 w-10 mb-1" />
						<Transition enter-active-class="transition-opacity duration-200"
							leave-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
							leave-to-class="opacity-0">
							<span v-if="!sidebarCollapsed || isMobile" class="font-semibold">RECIBOO</span>
						</Transition>
					</RouterLink>
				</div>

				<!-- Sidebar Content -->
				<div class="flex-1 overflow-y-auto p-4">
					<nav class="space-y-1">
						<div v-for="item in navMain" :key="item.title">
							<!-- Caso 1: Enlace simple (sin sub-items) -->
							<RouterLink v-if="!item.items" :to="item.url" @click="closeSidebar"
								class="flex w-full items-center gap-3 rounded-lg p-2 text-sm hover:bg-muted" :class="{
									'justify-center': sidebarCollapsed && !isMobile,
									'bg-muted font-semibold': $route.path === item.url,
								}" :title="sidebarCollapsed && !isMobile ? item.title : ''">
								<component :is="item.icon" class="h-5 w-5 shrink-0" />
								<Transition enter-active-class="transition-opacity duration-200"
									leave-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
									leave-to-class="opacity-0">
									<span v-if="!sidebarCollapsed || isMobile" class="flex-1 text-left">{{ item.title
									}}</span>
								</Transition>
							</RouterLink>

							<!-- Caso 2: Ítem con submenú -->
							<div v-else>
								<Popover :open="hoveredNavItem === item.title &&
									sidebarCollapsed &&
									!isMobile
									">
									<PopoverTrigger as-child>
										<button @click="toggleNavItem(item.title)"
											@mouseenter="handleMouseEnter(item.title)" @mouseleave="handleMouseLeave"
											class="flex w-full items-center gap-3 rounded-lg p-2 text-sm hover:bg-muted"
											:class="{
												'justify-center': sidebarCollapsed && !isMobile,
											}" :title="sidebarCollapsed && !isMobile ? item.title : ''">
											<component :is="item.icon" class="h-5 w-5 shrink-0" />
											<Transition enter-active-class="transition-opacity duration-200"
												leave-active-class="transition-opacity duration-200"
												enter-from-class="opacity-0" leave-to-class="opacity-0">
												<span v-if="!sidebarCollapsed || isMobile" class="flex-1 text-left">{{
													item.title }}</span>
											</Transition>
											<ChevronRight v-if="(!sidebarCollapsed || isMobile) && item.items"
												class="ml-auto h-4 w-4 shrink-0 transition-transform duration-200"
												:class="{ 'rotate-90': isNavItemOpen(item.title) }" />
										</button>
									</PopoverTrigger>
									<PopoverContent side="right" align="start" class="ml-2 w-48 p-1"
										@mouseenter="handleMouseEnter(item.title)" @mouseleave="handleMouseLeave">
										<nav class="flex flex-col space-y-1">
											<RouterLink v-for="subItem in item.items" :key="subItem.title"
												:to="subItem.url" @click="closeSidebar"
												class="block rounded-md p-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
												:class="{
													'bg-accent text-accent-foreground font-medium':
														$route.path === subItem.url,
												}">
												{{ subItem.title }}
											</RouterLink>
										</nav>
									</PopoverContent>
								</Popover>

								<!-- Submenu tipo acordeón (para vista expandida) -->
								<div v-if="isNavItemOpen(item.title)"
									class="ml-4 mt-1 space-y-1 overflow-hidden border-l pl-4">
									<RouterLink v-for="subItem in item.items" :key="subItem.title" :to="subItem.url"
										@click="closeSidebar"
										class="block rounded-lg p-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
										:class="{
											'bg-muted font-semibold text-foreground':
												$route.path === subItem.url,
										}">
										{{ subItem.title }}
									</RouterLink>
								</div>
							</div>
						</div>
					</nav>
				</div>

				<!-- Sidebar Footer -->
				<div class="border-t border-border p-4">
					<div v-if="!sidebarCollapsed || isMobile" class="flex w-full items-center justify-between gap-3">
						<div class="flex items-center gap-3 overflow-hidden">
							<img v-if="user?.avatarUrl" :src="user.avatarUrl" :alt="user.name"
								class="h-8 w-8 rounded-full shrink-0" />
							<div v-else
								class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
								{{ getInitials(user?.name) }}
							</div>
							<div class="flex flex-1 flex-col text-left overflow-hidden">
								<span class="truncate font-semibold">{{
									user?.name || 'Usuario'
								}}</span>
								<span class="truncate text-xs text-muted-foreground">{{
									user?.email
								}}</span>
							</div>
						</div>
						<Button variant="ghost" size="icon"
							class="h-8 w-8 shrink-0 transition-colors cursor-pointer hover:text-destructive"
							@click="handleLogout">
							<LogOut class="h-4 w-4" />
						</Button>
					</div>
					<div v-else class="flex flex-col items-center gap-4">
						<img v-if="user?.avatarUrl" :src="user.avatarUrl" :alt="user.name"
							class="h-8 w-8 rounded-full shrink-0" />
						<div v-else
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
							{{ getInitials(user?.name) }}
						</div>
						<Button variant="ghost" size="icon"
							class="h-8 w-8 shrink-0 transition-colors hover:text-destructive cursor-pointer"
							@click="handleLogout">
							<LogOut class="h-4 w-4 ml-2" />
						</Button>
					</div>
				</div>
			</div>
		</aside>

		<!-- Contenido Principal -->
		<div :class="mainContentClasses">
			<!-- Header (sin cambios) -->
			<header class="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4 bg-background">
				<button @click="toggleSidebar" class="rounded-lg p-2 hover:bg-muted">
					<PanelLeft class="h-5 w-5" />
				</button>

				<!-- Contenedor para los botones de la derecha -->
				<div class="ml-auto flex items-center gap-3 mr-5">
					<!-- Botón de Idioma Mejorado -->

					<!-- Botón de Notificaciones Mejorado -->
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline" size="sm" class="h-9 gap-2 px-3 border-muted relative">
								<Bell class="h-4 w-4" />
								<Badge v-if="unreadNotificationsCount > 0" variant="default"
									class="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center">
									{{ unreadNotificationsCount }}
								</Badge>
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end" class="w-96 p-0">
							<div class="flex items-center justify-between p-4 border-b">
								<h3 class="font-semibold text-lg">Notificaciones</h3>
								<Button variant="ghost" size="sm" class="text-xs h-8 px-2 text-primary"
									@click="markAllAsRead" :disabled="unreadNotificationsCount === 0">
									<Check class="h-4 w-4 mr-1" />
									Marcar todas como leídas
								</Button>
							</div>

							<div class="max-h-[400px] overflow-y-auto">
								<div v-if="notifications.length === 0"
									class="p-6 text-center text-sm text-muted-foreground">
									No tienes notificaciones.
								</div>
								<div v-else>
									<div v-for="notification in notifications" :key="notification.id"
										class="flex items-start gap-3 p-3 hover:bg-muted border-b last:border-b-0 transition-colors"
										:class="{ 'bg-muted/40': !notification.read }">
										<div class="h-2 w-2 shrink-0 rounded-full mt-2" :class="[
											notification.read ? 'bg-transparent' : 'bg-primary',
										]"></div>
										<div class="flex-1">
											<div class="flex items-center justify-between">
												<p class="font-medium text-sm">
													{{ notification.title }}
												</p>
												<span class="text-xs text-muted-foreground">{{
													notification.time
												}}</span>
											</div>
											<p class="text-xs text-muted-foreground mt-1">
												{{ notification.description }}
											</p>
											<div class="flex justify-end mt-2" v-if="!notification.read">
												<Button variant="ghost" size="sm" class="h-7 text-xs text-primary"
													@click="markAsRead(notification.id)">
													Marcar como leída
												</Button>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div class="p-3 border-t text-center">
								<Button variant="link" size="sm" class="text-xs">
									Ver todas las notificaciones
								</Button>
							</div>
						</PopoverContent>
					</Popover>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm" class="h-9 gap-1 px-2 border-muted">
								<span class="text-lg mr-1">{{ currentLanguage.flag }}</span>
								<!-- <span class="font-medium">{{ currentLanguage.code.toUpperCase() }}</span> -->
								<ChevronDown class="h-4 w-4 text-muted-foreground" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" class="w-40">
							<DropdownMenuLabel>Seleccionar idioma</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem v-for="lang in languages" :key="lang.code"
								@click="changeLanguage(lang.code)" :class="{ 'bg-muted': currentLang === lang.code }">
								<div class="flex items-center gap-2">
									<span class="text-lg">{{ lang.flag }}</span>
									<span>{{ lang.name }}</span>
									<Check v-if="currentLang === lang.code" class="h-4 w-4 ml-auto" />
								</div>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</header>

			<!-- Contenido de la página -->
			<main class="flex-1 p-4 sm:p-6 overflow-auto bg-muted/40">
				<RouterView />
			</main>
		</div>

		<!-- 4. AÑADIR: Sidebar Derecho -->
		<aside v-if="layoutStore.isRightSidebarVisible"
			class="fixed top-0 right-0 z-30 h-screen w-80 bg-background border-l border-border">
			<!-- Este componente renderizará lo que la vista le diga al store -->
			<component :is="layoutStore.rightSidebarComponent" v-bind="layoutStore.rightSidebarProps" />
		</aside>

		<!-- Overlay para sidebar móvil (sin cambios) -->
		<div v-if="sidebarOpen && isMobile" @click="closeSidebar"
			class="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"></div>
		<Toaster richColors position="top-right" />
	</div>
</template>
