<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Filter, Calendar as CalendarIcon, ArrowUpDown, Check } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { type DateValue, getLocalTimeZone, today } from '@internationalized/date'

// --- Tipos y Datos Simulados ---
type OrdenEstatus =
	| 'Creada'
	| 'En Tránsito'
	| 'Recibida'
	| 'Facturada'
	| 'Completada por consignación'

interface OrdenCompra {
	ordenCompra: string
	proveedor: string
	sociedad: string
	moneda: string
	subtotal: number
	iva: number
	importe: number
	estatus: OrdenEstatus
	fechaCarga: string
}

// --- Lógica del Stepper de Estatus ---
const statusProgression: OrdenEstatus[] = ['Creada', 'En Tránsito', 'Recibida', 'Facturada']
const consignmentStatus: OrdenEstatus = 'Completada por consignación'

const getStatusProgress = (currentStatus: OrdenEstatus) => {
	if (currentStatus === consignmentStatus) {
		return { isConsignment: true, currentIndex: statusProgression.length }
	}
	const currentIndex = statusProgression.indexOf(currentStatus)
	return { isConsignment: false, currentIndex }
}

const allOrdenes = ref<OrdenCompra[]>([
	{
		ordenCompra: 'OC-2024-001',
		proveedor: 'Proveedor A',
		sociedad: '1000',
		moneda: 'MXN',
		subtotal: 20000,
		iva: 3200,
		importe: 23200,
		estatus: 'Facturada',
		fechaCarga: '2024-06-01T10:00:00Z',
	},
	{
		ordenCompra: 'OC-2024-002',
		proveedor: 'Proveedor B',
		sociedad: '2000',
		moneda: 'USD',
		subtotal: 5000,
		iva: 800,
		importe: 5800,
		estatus: 'Recibida',
		fechaCarga: '2024-06-05T09:30:00Z',
	},
	{
		ordenCompra: 'OC-2024-003',
		proveedor: 'Proveedor C',
		sociedad: '1000',
		moneda: 'MXN',
		subtotal: 15000,
		iva: 2400,
		importe: 17400,
		estatus: 'En Tránsito',
		fechaCarga: '2024-06-10T08:00:00Z',
	},
	{
		ordenCompra: 'OC-2024-004',
		proveedor: 'Proveedor A',
		sociedad: '3000',
		moneda: 'EUR',
		subtotal: 7000,
		iva: 1120,
		importe: 8120,
		estatus: 'Completada por consignación',
		fechaCarga: '2024-06-15T11:00:00Z',
	},
	{
		ordenCompra: 'OC-2024-005',
		proveedor: 'Proveedor D',
		sociedad: '1000',
		moneda: 'MXN',
		subtotal: 12000,
		iva: 1920,
		importe: 13920,
		estatus: 'Creada',
		fechaCarga: '2024-06-20T14:00:00Z',
	},
])

// Lista única de proveedores para el filtro
const proveedores = computed(() => {
	const uniqueProveedores = new Set(allOrdenes.value.map((orden) => orden.proveedor))
	return Array.from(uniqueProveedores)
})

// Lista de estatus para el filtro
const estatusOptions: OrdenEstatus[] = [...statusProgression, consignmentStatus]

// --- Estado para Filtros y UI ---
const showFilters = ref(true)
const searchTerm = ref('')
const selectedProveedor = ref<string | 'all'>('all')
const selectedEstatus = ref<OrdenEstatus | 'all'>('all')
const startDate = ref<DateValue>()
const endDate = ref<DateValue>()

// --- Estado para Ordenación ---
const sortKey = ref<keyof OrdenCompra | null>('fechaCarga')
const sortOrder = ref<'asc' | 'desc'>('desc')

// --- Estado para Paginación ---
const currentPage = ref(1)
const itemsPerPage = ref(5)

// --- Helpers ---
const df = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' })

// --- Lógica Computada (sin cambios) ---
const activeFilterCount = computed(() => {
	let count = 0
	if (searchTerm.value) count++
	if (selectedProveedor.value !== 'all') count++
	if (selectedEstatus.value !== 'all') count++
	if (startDate.value || endDate.value) count++
	return count
})

const filteredOrdenes = computed(() => {
	let ordenes = allOrdenes.value
	if (searchTerm.value) {
		const lowerSearch = searchTerm.value.toLowerCase()
		ordenes = ordenes.filter(
			(orden) =>
				orden.ordenCompra.toLowerCase().includes(lowerSearch) ||
				orden.proveedor.toLowerCase().includes(lowerSearch),
		)
	}
	if (selectedProveedor.value !== 'all') {
		ordenes = ordenes.filter((orden) => orden.proveedor === selectedProveedor.value)
	}
	if (selectedEstatus.value !== 'all') {
		ordenes = ordenes.filter((orden) => orden.estatus === selectedEstatus.value)
	}
	if (startDate.value || endDate.value) {
		ordenes = ordenes.filter((orden) => {
			const fecha = new Date(orden.fechaCarga)
			const desde = startDate.value ? startDate.value.toDate(getLocalTimeZone()) : null
			const hasta = endDate.value ? endDate.value.toDate(getLocalTimeZone()) : null
			if (desde) {
				desde.setHours(0, 0, 0, 0)
				if (fecha < desde) return false
			}
			if (hasta) {
				hasta.setHours(23, 59, 59, 999)
				if (fecha > hasta) return false
			}
			return true
		})
	}
	return ordenes
})

const sortedOrdenes = computed(() => {
	if (!sortKey.value) return filteredOrdenes.value
	return [...filteredOrdenes.value].sort((a, b) => {
		const valA = a[sortKey.value!]
		const valB = b[sortKey.value!]
		if (typeof valA === 'number' && typeof valB === 'number') {
			return sortOrder.value === 'asc' ? valA - valB : valB - valA
		}
		if (typeof valA === 'string' && typeof valB === 'string') {
			return sortOrder.value === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
		}
		return 0
	})
})

const paginatedOrdenes = computed(() => {
	const start = (currentPage.value - 1) * itemsPerPage.value
	const end = start + itemsPerPage.value
	return sortedOrdenes.value.slice(start, end)
})

const totalPages = computed(() => {
	return Math.ceil(sortedOrdenes.value.length / itemsPerPage.value)
})

// --- Métodos (sin cambios) ---
const clearFilters = () => {
	searchTerm.value = ''
	selectedProveedor.value = 'all'
	selectedEstatus.value = 'all'
	startDate.value = undefined
	endDate.value = undefined
}

const setSort = (key: keyof OrdenCompra) => {
	if (sortKey.value === key) {
		sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
	} else {
		sortKey.value = key
		sortOrder.value = 'asc'
	}
	currentPage.value = 1
}

const prevPage = () => {
	if (currentPage.value > 1) currentPage.value--
}
const nextPage = () => {
	if (currentPage.value < totalPages.value) currentPage.value++
}

const formatDate = (dateString: string) => {
	try {
		return new Intl.DateTimeFormat('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		}).format(new Date(dateString))
	} catch {
		return dateString
	}
}

const formatCurrency = (amount: number, currency: string) =>
	new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount)

watch([searchTerm, selectedProveedor, selectedEstatus, startDate, endDate], () => {
	currentPage.value = 1
})

const getFiltersButtonVariant = () => {
	if (showFilters.value) return 'default'
	else if (!showFilters.value && activeFilterCount.value == 0) return 'outline'
}
</script>

<template>
	<div class="container mx-auto py-6 md:py-10">
		<!-- Encabezado y Acciones Principales -->
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-2xl font-bold md:text-3xl">Órdenes de Compra</h1>
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

		<!-- Contenido Principal: Tarjetas y Filtros -->
		<div class="flex flex-col gap-8 md:flex-row md:gap-6">
			<!-- Columna de Tarjetas de Órdenes -->
			<div class="flex-1">
				<!-- Controles de Ordenación -->
				<div
					class="mb-4 flex items-center justify-between rounded-lg border bg-card p-2 text-card-foreground"
				>
					<span class="text-sm text-muted-foreground"
						>Ordenar por:
						<span class="font-semibold text-primary">{{
							sortKey === 'fechaCarga' ? 'Fecha' : 'Importe'
						}}</span></span
					>
					<div class="flex items-center gap-1">
						<Button
							variant="ghost"
							size="sm"
							@click="setSort('fechaCarga')"
							:class="{ 'bg-accent': sortKey === 'fechaCarga' }"
						>
							Fecha
							<ArrowUpDown v-if="sortKey === 'fechaCarga'" class="ml-2 h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							@click="setSort('importe')"
							:class="{ 'bg-accent': sortKey === 'importe' }"
						>
							Importe
							<ArrowUpDown v-if="sortKey === 'importe'" class="ml-2 h-4 w-4" />
						</Button>
					</div>
				</div>

				<!-- Lista de Tarjetas -->
				<div v-if="paginatedOrdenes.length > 0" class="grid grid-cols-1 gap-5">
					<Card
						v-for="orden in paginatedOrdenes"
						:key="orden.ordenCompra"
						class="cursor-pointer transition-shadow duration-300 hover:shadow-xl"
						@click="
							$router.push({
								name: 'purchase-order-detail',
								params: { orden_compra: orden.ordenCompra },
							})
						"
					>
						<CardHeader class="flex flex-row items-start justify-between">
							<div>
								<CardTitle class="text-lg text-primary">
									<span class="text-sm text-accent-foreground"
										>{{ orden.proveedor }} • {{ orden.sociedad }}</span
									>
									<br />
									{{ orden.ordenCompra }}
								</CardTitle>
							</div>
							<div class="text-right text-sm text-muted-foreground">
								{{ formatDate(orden.fechaCarga) }}
							</div>
						</CardHeader>
						<CardContent class="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-center">
							<!-- Detalles Financieros -->
							<div class="space-y-2 md:col-span-2">
								<div class="flex justify-between text-sm">
									<span class="text-muted-foreground">Subtotal</span>
									<span class="font-mono">{{
										formatCurrency(orden.subtotal, orden.moneda)
									}}</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-muted-foreground">IVA (16%)</span>
									<span class="font-mono">{{
										formatCurrency(orden.iva, orden.moneda)
									}}</span>
								</div>
							</div>
							<!-- Importe Total -->
							<div
								class="flex flex-col items-start justify-center rounded-lg border bg-muted/30 p-4 md:items-end"
							>
								<span class="text-sm text-muted-foreground">Importe Total</span>
								<span class="text-2xl font-bold text-primary">{{
									formatCurrency(orden.importe, orden.moneda)
								}}</span>
							</div>
						</CardContent>

						<!-- Stepper de Progreso -->
						<div class="px-6 pb-5 pt-2">
							<div class="flex w-full items-center">
								<template
									v-for="(status, index) in statusProgression"
									:key="status"
								>
									<!-- Punto y Etiqueta del Estatus -->
									<div class="z-10 flex flex-col items-center">
										<div
											class="flex h-6 w-6 items-center justify-center rounded-full border-2"
											:class="
												getStatusProgress(orden.estatus).currentIndex >=
												index
													? 'border-primary bg-primary'
													: 'border-muted-foreground bg-card'
											"
										>
											<Check
												v-if="
													getStatusProgress(orden.estatus).currentIndex >
													index
												"
												class="h-4 w-4 text-white"
											/>
											<div
												v-else-if="
													getStatusProgress(orden.estatus)
														.currentIndex === index
												"
												class="h-2.5 w-2.5 rounded-full bg-white"
											></div>
										</div>
										<p
											class="mt-2 text-center text-xs"
											:class="
												getStatusProgress(orden.estatus).currentIndex >=
												index
													? 'font-semibold text-primary'
													: 'text-muted-foreground'
											"
										>
											{{ status }}
										</p>
									</div>
									<!-- Línea de Conexión -->
									<div
										v-if="index < statusProgression.length - 1"
										class="h-1 flex-1"
										:class="
											getStatusProgress(orden.estatus).currentIndex > index
												? 'bg-primary'
												: 'bg-muted'
										"
									></div>
								</template>
							</div>
						</div>
					</Card>
				</div>

				<!-- Mensaje de "No se encontraron resultados" -->
				<div
					v-else
					class="flex h-64 items-center justify-center rounded-lg border-2 border-dashed"
				>
					<p class="text-center text-muted-foreground">
						No se encontraron órdenes de compra. <br />Intenta ajustar los filtros.
					</p>
				</div>

				<!-- Paginación -->
				<div class="mt-6 flex items-center justify-between" v-if="totalPages > 1">
					<div class="text-sm text-muted-foreground">
						Página {{ totalPages > 0 ? currentPage : 0 }} de {{ totalPages }}
					</div>
					<div class="flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							@click="prevPage"
							:disabled="currentPage === 1"
						>
							Anterior
						</Button>
						<Button
							variant="outline"
							size="sm"
							@click="nextPage"
							:disabled="currentPage === totalPages || totalPages === 0"
						>
							Siguiente
						</Button>
					</div>
				</div>
			</div>

			<!-- Columna de Filtros (Sidebar) -->
			<Transition name="slide-fade">
				<div v-if="showFilters" class="w-full md:w-72 md:flex-shrink-0">
					<Card class="sticky top-6">
						<CardHeader>
							<CardTitle>Filtros</CardTitle>
						</CardHeader>
						<CardContent class="flex flex-col gap-6">
							<!-- Filtro por Orden de Compra o Proveedor -->
							<div class="flex flex-col gap-2">
								<Label for="search-filter">Buscar OC o Proveedor</Label>
								<Input
									id="search-filter"
									placeholder="OC-2024-... o Proveedor"
									v-model="searchTerm"
								/>
							</div>

							<!-- Filtro por Proveedor (Select) -->
							<div class="flex flex-col gap-2">
								<Label for="proveedor-filter">Proveedor</Label>
								<Select v-model="selectedProveedor">
									<SelectTrigger id="proveedor-filter">
										<SelectValue placeholder="Filtrar por Proveedor" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Todos</SelectItem>
										<SelectItem
											v-for="proveedor in proveedores"
											:key="proveedor"
											:value="proveedor"
										>
											{{ proveedor }}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<!-- Filtro por Estatus -->
							<div class="flex flex-col gap-2">
								<Label for="estatus-filter">Estatus</Label>
								<Select v-model="selectedEstatus">
									<SelectTrigger id="estatus-filter">
										<SelectValue placeholder="Filtrar por Estatus" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Todos</SelectItem>
										<SelectItem
											v-for="estatus in estatusOptions"
											:key="estatus"
											:value="estatus"
										>
											{{ estatus }}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<!-- Filtro por Fecha -->
							<div class="flex flex-col gap-2">
								<Label>Filtrar por fecha de carga</Label>
								<div class="mt-1 flex flex-col gap-2">
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
																startDate.toDate(
																	getLocalTimeZone(),
																),
															)
														: 'Fecha de inicio'
												}}</span>
											</Button>
										</PopoverTrigger>
										<PopoverContent class="w-auto p-0">
											<Calendar
												v-model="startDate"
												:max-value="today(getLocalTimeZone())"
											/>
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
														? df.format(
																endDate.toDate(getLocalTimeZone()),
															)
														: 'Fecha de fin'
												}}</span>
											</Button>
										</PopoverTrigger>
										<PopoverContent class="w-auto p-0">
											<Calendar
												v-model="endDate"
												:min-value="startDate"
												:max-value="today(getLocalTimeZone())"
											/>
										</PopoverContent>
									</Popover>
								</div>
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
}

/* Ajustes para el layout en pantallas más pequeñas */
@media (max-width: 768px) {
	.slide-fade-enter-from,
	.slide-fade-leave-to {
		transform: translateY(20px);
	}
}
</style>
