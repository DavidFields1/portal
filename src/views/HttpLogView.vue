<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
	ChevronDown,
	ChevronUp,
	Copy,
	Filter,
	Calendar as CalendarIcon,
	ChevronLeft,
	ChevronRight,
} from 'lucide-vue-next'
import { toast, Toaster } from 'vue-sonner'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { type DateValue, getLocalTimeZone } from '@internationalized/date'

// --- Tipos y Datos Simulados ---
interface HttpLogEntry {
	id: string
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
	action: string
	endpoint: string
	module: string
	userId: string
	status: number
	timestamp: string
	requestPayload?: object | string | null
	responsePayload?: object | string | null
}

const httpLogs = ref<HttpLogEntry[]>([
	{
		id: 'log_001',
		method: 'POST',
		action: 'Crear Usuario',
		endpoint: '/api/v1/users',
		module: 'Usuarios',
		userId: 'admin-001',
		status: 201,
		timestamp: '2024-05-14T10:30:15Z',
		requestPayload: { name: 'Nuevo Usuario', email: 'nuevo@example.com', role: 'Viewer' },
		responsePayload: {
			id: 'usr_125',
			name: 'Nuevo Usuario',
			email: 'nuevo@example.com',
			role: 'Viewer',
			createdAt: '2024-05-14T10:30:15Z',
		},
	},
	{
		id: 'log_002',
		method: 'GET',
		action: 'Obtener Facturas',
		endpoint: '/api/v1/invoices?status=pending',
		module: 'Facturación',
		userId: 'user-002',
		status: 200,
		timestamp: '2024-05-14T10:32:45Z',
		requestPayload: null,
		responsePayload: { count: 2, data: [{ id: 'inv_001' }, { id: 'inv_002' }] },
	},
	{
		id: 'log_003',
		method: 'PUT',
		action: 'Actualizar Configuración',
		endpoint: '/api/v1/settings/profile',
		module: 'Configuración',
		userId: 'admin-001',
		status: 401,
		timestamp: '2024-05-14T10:35:00Z',
		requestPayload: { bio: 'Nueva biografía actualizada.' },
		responsePayload: { error: 'Unauthorized', message: 'Token inválido o expirado.' },
	},
	{
		id: 'log_004',
		method: 'DELETE',
		action: 'Eliminar Factura',
		endpoint: '/api/v1/invoices/inv_003',
		module: 'Facturación',
		userId: 'user-002',
		status: 204,
		timestamp: '2024-05-14T10:38:22Z',
		requestPayload: null,
		responsePayload: null,
	},
	{
		id: 'log_005',
		method: 'GET',
		action: 'Listar Productos',
		endpoint: '/api/v1/products',
		module: 'Productos',
		userId: 'guest',
		status: 200,
		timestamp: '2024-05-15T11:00:00Z',
		requestPayload: null,
		responsePayload: { count: 50 },
	},
	{
		id: 'log_006',
		method: 'POST',
		action: 'Procesar Pago',
		endpoint: '/api/v1/payments',
		module: 'Pagos',
		userId: 'user-003',
		status: 500,
		timestamp: '2024-05-15T11:05:10Z',
		requestPayload: { amount: 100 },
		responsePayload: { error: 'Internal Server Error' },
	},
	{
		id: 'log_007',
		method: 'GET',
		action: 'Ver Perfil',
		endpoint: '/api/v1/users/me',
		module: 'Usuarios',
		userId: 'user-002',
		status: 200,
		timestamp: '2024-05-15T11:10:20Z',
		requestPayload: null,
		responsePayload: { id: 'user-002' },
	},
	{
		id: 'log_008',
		method: 'GET',
		action: 'Obtener Reporte',
		endpoint: '/api/v1/reports/sales',
		module: 'Reportes',
		userId: 'admin-001',
		status: 200,
		timestamp: '2024-05-16T09:00:00Z',
		requestPayload: null,
		responsePayload: { data: '...' },
	},
	{
		id: 'log_009',
		method: 'PATCH',
		action: 'Actualizar Stock',
		endpoint: '/api/v1/products/prod_123',
		module: 'Productos',
		userId: 'admin-001',
		status: 200,
		timestamp: '2024-05-16T09:15:00Z',
		requestPayload: { stock: 99 },
		responsePayload: { success: true },
	},
	{
		id: 'log_010',
		method: 'GET',
		action: 'Buscar Clientes',
		endpoint: '/api/v1/customers?q=test',
		module: 'Clientes',
		userId: 'user-002',
		status: 300,
		timestamp: '2024-05-16T10:00:00Z',
		requestPayload: null,
		responsePayload: { count: 5 },
	},
	{
		id: 'log_011',
		method: 'POST',
		action: 'Crear Ticket',
		endpoint: '/api/v1/support/tickets',
		module: 'Soporte',
		userId: 'user-003',
		status: 201,
		timestamp: '2024-05-16T10:30:00Z',
		requestPayload: { subject: 'Ayuda' },
		responsePayload: { id: 'tkt_001' },
	},
	{
		id: 'log_012',
		method: 'GET',
		action: 'Obtener Facturas',
		endpoint: '/api/v1/invoices?status=paid',
		module: 'Facturación',
		userId: 'admin-001',
		status: 403,
		timestamp: '2024-05-17T14:00:00Z',
		requestPayload: null,
		responsePayload: { error: 'Forbidden' },
	},
])
// --- Fin Datos Simulados ---

// --- Estado para Filas Expandidas (LÓGICA ACTUALIZADA) ---
const expandedRowId = ref<string | null>(null)

const toggleRowExpansion = (logId: string) => {
	expandedRowId.value = expandedRowId.value === logId ? null : logId
}

const isRowExpanded = (logId: string) => {
	return expandedRowId.value === logId
}
// --- Fin Estado Expansión ---

// --- Helpers ---
const formatDate = (dateString: string) => {
	try {
		return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(
			new Date(dateString),
		)
	} catch {
		return dateString
	}
}
const getStatusVariant = (status: number) => {
	if (status >= 200 && status < 300)
		return 'text-green-500 border-green-500 bg-transparent font-bold'
	if (status >= 400 && status < 500) return 'text-red-500 border-red-500 bg-transparent font-bold'
	if (status >= 300 && status < 400)
		return 'text-yellow-500 border-yellow-500 bg-transparent font-bold'
	return 'text-grey-500 border-black bg-transparent font-bold'
}
const getMethodVariant = (
	method: HttpLogEntry['method'],
): 'default' | 'secondary' | 'outline' | 'destructive' => {
	switch (method) {
		case 'GET':
			return 'default'
		case 'POST':
			return 'secondary'
		case 'PUT':
		case 'PATCH':
			return 'outline'
		case 'DELETE':
			return 'destructive'
		default:
			return 'default'
	}
}
// --- Fin Helpers ---

// --- Función para Copiar al Portapapeles ---
const copyToClipboard = async (
	payload: object | string | null | undefined,
	type: 'Request' | 'Response',
) => {
	if (!payload) {
		toast.info(`No hay ${type.toLowerCase()} payload para copiar.`)
		return
	}
	try {
		const textToCopy = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2)
		await navigator.clipboard.writeText(textToCopy)
		toast.success(`${type} payload copiado al portapapeles.`)
	} catch (err) {
		console.error('Error al copiar al portapapeles:', err)
		toast.error(`No se pudo copiar el ${type.toLowerCase()} payload.`)
	}
}

// --- Lógica de Filtros ---
const showFilters = ref(false)

// Estado para los filtros
const selectedMethod = ref<HttpLogEntry['method'] | 'Todos'>('Todos')
const selectedStatus = ref('all')
const startDate = ref<DateValue>()
const endDate = ref<DateValue>()

const methods: (HttpLogEntry['method'] | 'Todos')[] = [
	'Todos',
	'GET',
	'POST',
	'PUT',
	'DELETE',
	'PATCH',
]
const statusOptions = [
	{ value: 'all', label: 'Todos' },
	{ value: '2xx', label: 'Éxito (2xx)' },
	{ value: '3xx', label: 'Redirección (3xx)' },
	{ value: '4xx', label: 'Error de Cliente (4xx)' },
	{ value: '5xx', label: 'Error de Servidor (5xx)' },
]

// Helper para formatear las fechas para los botones
const df = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' })

// Contar filtros activos
const activeFilterCount = computed(() => {
	let count = 0
	if (selectedMethod.value !== 'Todos') count++
	if (selectedStatus.value !== 'all') count++
	if (startDate.value || endDate.value) count++
	return count
})

// Limpiar todos los filtros
const clearFilters = () => {
	selectedMethod.value = 'Todos'
	selectedStatus.value = 'all'
	startDate.value = undefined
	endDate.value = undefined
}

// Aplicar filtros a los logs
const filteredLogs = computed(() => {
	let logs = httpLogs.value

	if (selectedMethod.value !== 'Todos') {
		logs = logs.filter((log) => log.method === selectedMethod.value)
	}

	if (selectedStatus.value !== 'all') {
		const lowerBound = Number(selectedStatus.value.charAt(0)) * 100
		const upperBound = lowerBound + 100
		logs = logs.filter((log) => log.status >= lowerBound && log.status < upperBound)
	}

	if (startDate.value || endDate.value) {
		logs = logs.filter((log) => {
			const logDate = new Date(log.timestamp)
			if (startDate.value) {
				const startOfDay = startDate.value.toDate(getLocalTimeZone())
				startOfDay.setHours(0, 0, 0, 0)
				if (logDate < startOfDay) return false
			}
			if (endDate.value) {
				const endOfDay = endDate.value.toDate(getLocalTimeZone())
				endOfDay.setHours(23, 59, 59, 999)
				if (logDate > endOfDay) return false
			}
			return true
		})
	}

	return logs
})

// --- Lógica de Paginación ---
const currentPage = ref(1)
const itemsPerPage = ref(6)

const totalPages = computed(() => {
	return Math.ceil(filteredLogs.value.length / itemsPerPage.value)
})

const paginatedLogs = computed(() => {
	const start = (currentPage.value - 1) * itemsPerPage.value
	const end = start + itemsPerPage.value
	return filteredLogs.value.slice(start, end)
})

const canGoPrevious = computed(() => currentPage.value > 1)
const canGoNext = computed(() => currentPage.value < totalPages.value)

function nextPage() {
	if (canGoNext.value) {
		currentPage.value++
	}
}

function previousPage() {
	if (canGoPrevious.value) {
		currentPage.value--
	}
}

// Reiniciar a la página 1 cuando los filtros cambian
watch(filteredLogs, () => {
	currentPage.value = 1
})

const getFiltersButtonVariant = () => {
	if (showFilters.value) return 'default'
	else if (!showFilters.value && activeFilterCount.value == 0) return 'outline'
}
</script>

<template>
	<Toaster richColors position="top-right" />
	<div class="container mx-auto py-6 md:py-10">
		<!-- Encabezado de la página -->
		<div class="mb-4 flex items-center justify-between">
			<h1 class="text-2xl font-bold md:text-3xl">Log de Peticiones HTTP</h1>
			<Button
				:variant="getFiltersButtonVariant()"
				@click="showFilters = !showFilters"
				:class="
					activeFilterCount > 0
						? 'bg-primary text-white hover:bg-violet-400 hover:text-white'
						: ''
				"
			>
				<Filter class="mr-2 h-4 w-4" />
				Filtros
				<Badge v-if="activeFilterCount > 0" variant="secondary" class="ml-2">{{
					activeFilterCount
				}}</Badge>
			</Button>
		</div>

		<!-- Contenedor Flex para el contenido principal (Tabla y Filtros) -->
		<div class="flex gap-6">
			<!-- Columna principal (flexible) que contiene la tabla -->
			<div class="flex-1">
				<Card>
					<CardContent class="p-0">
						<div class="overflow-x-auto">
							<Table class="min-w-full">
								<TableHeader>
									<TableRow>
										<TableHead class="w-[50px] px-2 sm:px-4"
											><span class="sr-only">Expandir</span></TableHead
										>
										<TableHead class="w-[100px] px-2 sm:px-4">ID</TableHead>
										<TableHead class="px-2 sm:px-4">Método</TableHead>
										<TableHead class="px-2 sm:px-4">Acción</TableHead>
										<TableHead class="px-2 sm:px-4">Endpoint</TableHead>
										<TableHead class="px-2 sm:px-4">Módulo</TableHead>
										<TableHead class="px-2 sm:px-4">ID Usuario</TableHead>
										<TableHead class="px-2 sm:px-4">Estatus</TableHead>
										<TableHead class="text-right px-2 sm:px-4">Fecha</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									<template v-if="paginatedLogs.length > 0">
										<template v-for="log in paginatedLogs" :key="log.id">
											<!-- Fila Principal -->
											<TableRow>
												<TableCell class="w-[50px] px-2 sm:px-4 py-3">
													<Button
														variant="ghost"
														size="icon"
														@click="toggleRowExpansion(log.id)"
														class="h-7 w-7"
													>
														<ChevronDown
															v-if="!isRowExpanded(log.id)"
															class="h-4 w-4"
														/>
														<ChevronUp v-else class="h-4 w-4" />
														<span class="sr-only"
															>Expandir/Colapsar</span
														>
													</Button>
												</TableCell>
												<TableCell class="font-medium px-2 sm:px-4">{{
													log.id
												}}</TableCell>
												<TableCell class="px-2 sm:px-4">
													<Badge
														:variant="getMethodVariant(log.method)"
														>{{ log.method }}</Badge
													>
												</TableCell>
												<TableCell class="px-2 sm:px-4">{{
													log.action
												}}</TableCell>
												<TableCell class="max-w-xs truncate px-2 sm:px-4">{{
													log.endpoint
												}}</TableCell>
												<TableCell class="px-2 sm:px-4">{{
													log.module
												}}</TableCell>
												<TableCell class="px-2 sm:px-4">{{
													log.userId
												}}</TableCell>
												<TableCell class="px-2 sm:px-4">
													<Badge :class="getStatusVariant(log.status)">
														{{ log.status }}
													</Badge>
												</TableCell>
												<TableCell class="text-right px-2 sm:px-4">{{
													formatDate(log.timestamp)
												}}</TableCell>
											</TableRow>

											<!-- Fila Expandible (Condicional) -->
											<TableRow
												v-if="isRowExpanded(log.id)"
												class="bg-muted/10"
											>
												<TableCell class="p-0"></TableCell>
												<TableCell :colspan="8" class="p-0">
													<div class="p-4 space-y-4">
														<!-- Request Payload con Botón de Copia -->
														<div class="relative">
															<div
																class="flex justify-between items-center mb-1"
															>
																<h4 class="text-sm font-semibold">
																	Request Payload:
																</h4>
																<Button
																	v-if="log.requestPayload"
																	variant="ghost"
																	size="icon"
																	@click="
																		copyToClipboard(
																			log.requestPayload,
																			'Request',
																		)
																	"
																	class="h-6 w-6 p-0.5"
																	aria-label="Copiar Request Payload"
																>
																	<Copy class="h-3 w-3" />
																</Button>
															</div>
															<pre
																v-if="log.requestPayload"
																class="text-xs bg-background border rounded-md p-2 overflow-x-auto max-h-60"
																>{{
																	JSON.stringify(
																		log.requestPayload,
																		null,
																		2,
																	)
																}}</pre
															>
															<p
																v-else
																class="text-xs text-muted-foreground"
															>
																No request payload.
															</p>
														</div>
														<!-- Response Payload con Botón de Copia -->
														<div class="relative">
															<div
																class="flex justify-between items-center mb-1"
															>
																<h4 class="text-sm font-semibold">
																	Response Payload:
																</h4>
																<Button
																	v-if="log.responsePayload"
																	variant="ghost"
																	size="icon"
																	@click="
																		copyToClipboard(
																			log.responsePayload,
																			'Response',
																		)
																	"
																	class="h-6 w-6 p-0.5"
																	aria-label="Copiar Response Payload"
																>
																	<Copy class="h-3 w-3" />
																</Button>
															</div>
															<pre
																v-if="log.responsePayload"
																class="text-xs bg-background border rounded-md p-2 overflow-x-auto max-h-60"
																>{{
																	JSON.stringify(
																		log.responsePayload,
																		null,
																		2,
																	)
																}}</pre
															>
															<p
																v-else
																class="text-xs text-muted-foreground"
															>
																No response payload.
															</p>
														</div>
													</div>
												</TableCell>
											</TableRow>
										</template>
									</template>
									<template v-else>
										<TableRow>
											<TableCell :colspan="9" class="h-24 text-center">
												No hay logs que coincidan con los filtros aplicados.
											</TableCell>
										</TableRow>
									</template>
								</TableBody>
							</Table>
						</div>
					</CardContent>
					<CardFooter v-if="totalPages > 0" class="flex items-center justify-between p-4">
						<div class="text-sm text-muted-foreground">
							{{ filteredLogs.length }} registros totales. Página {{ currentPage }} de
							{{ totalPages }}
						</div>
						<div class="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								@click="previousPage"
								:disabled="!canGoPrevious"
							>
								<ChevronLeft class="h-4 w-4" />
								<span class="sr-only">Anterior</span>
							</Button>
							<Button
								variant="outline"
								size="sm"
								@click="nextPage"
								:disabled="!canGoNext"
							>
								<span class="sr-only">Siguiente</span>
								<ChevronRight class="h-4 w-4" />
							</Button>
						</div>
					</CardFooter>
				</Card>
			</div>

			<!-- Columna de Filtros (Sidebar a la derecha) -->
			<Transition name="slide-fade">
				<div v-if="showFilters" class="w-64 flex-shrink-0">
					<Card class="sticky top-6">
						<CardHeader>
							<CardTitle>Filtros</CardTitle>
						</CardHeader>
						<CardContent class="flex flex-col gap-6">
							<!-- Filtro por Método -->
							<div class="flex flex-col gap-2">
								<Label for="method-filter">Método</Label>
								<Select v-model="selectedMethod">
									<SelectTrigger id="method-filter" class="w-full">
										<SelectValue placeholder="Seleccionar método" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem
												v-for="method in methods"
												:key="method"
												:value="method"
											>
												{{ method }}
											</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							<!-- Filtro por Estatus -->
							<div class="flex flex-col gap-2">
								<Label for="status-filter">Estatus</Label>
								<Select v-model="selectedStatus">
									<SelectTrigger id="status-filter" class="w-full">
										<SelectValue placeholder="Seleccionar estatus" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem
												v-for="option in statusOptions"
												:key="option.value"
												:value="option.value"
											>
												{{ option.label }}
											</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							<!-- Filtro por Rango de Fechas -->
							<div class="flex flex-col gap-2">
								<Label>Rango de Fechas</Label>
								<Popover>
									<PopoverTrigger as-child>
										<Button
											variant="outline"
											class="w-full justify-start text-left font-normal"
											:class="!startDate && 'text-muted-foreground'"
										>
											<CalendarIcon class="mr-2 h-4 w-4" />
											<span>{{
												startDate
													? df.format(
															startDate.toDate(getLocalTimeZone()),
														)
													: 'Fecha de inicio'
											}}</span>
										</Button>
									</PopoverTrigger>
									<PopoverContent class="w-auto p-0">
										<Calendar v-model="startDate" />
									</PopoverContent>
								</Popover>
								<Popover>
									<PopoverTrigger as-child>
										<Button
											variant="outline"
											class="w-full justify-start text-left font-normal"
											:class="!endDate && 'text-muted-foreground'"
										>
											<CalendarIcon class="mr-2 h-4 w-4" />
											<span>{{
												endDate
													? df.format(endDate.toDate(getLocalTimeZone()))
													: 'Fecha de fin'
											}}</span>
										</Button>
									</PopoverTrigger>
									<PopoverContent class="w-auto p-0">
										<Calendar v-model="endDate" />
									</PopoverContent>
								</Popover>
							</div>
						</CardContent>
						<CardFooter>
							<Button
								variant="ghost"
								class="w-full cursor-pointer"
								@click="clearFilters"
								:disabled="activeFilterCount === 0"
							>
								Limpiar filtros
							</Button>
						</CardFooter>
					</Card>
				</div>
			</Transition>
		</div>
	</div>
</template>

<style scoped>
/* Animación para deslizar y desvanecer desde la derecha */
.slide-fade-enter-active,
.slide-fade-leave-active {
	transition:
		opacity 0.3s ease,
		transform 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
	opacity: 0;
	transform: translateX(20px);
	/* Inicia 20px a la derecha */
}
</style>
