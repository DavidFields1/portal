<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { Filter, Calendar as CalendarIcon } from 'lucide-vue-next';
import { type DateValue, getLocalTimeZone } from '@internationalized/date';

// --- Dependencias de la UI (sin cambios) ---
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

// --- 1. Importar el store y el schema ---

import type { InvoiceMonitor } from '@/schemas/invoiceSchemas';
import { useInvoicesStore } from '@/stores/myInvoicesStore';
import MyInvoicesSkeleton from '@/components/skeleton/MyInvoicesSkeleton.vue';

// --- 2. Instanciar el Store y extraer el estado de forma reactiva ---
const invoicesStore = useInvoicesStore();
const {
	invoices,
	isLoading,
	isError,
	error,
	// Filtros para el v-model
	UUId,
	estatus,
	fechaOrigen,
	fechaLimite,
	tipoFechaBusqueda,
} = storeToRefs(invoicesStore);

// --- Estado local para la UI (no para los datos) ---
const showFilters = ref(true);
const startDate = ref<DateValue>();
const endDate = ref<DateValue>();

// --- Estado local para Ordenación ---
const sortKey = ref<keyof InvoiceMonitor | null>('fecha_creacion'); // Adaptado al schema
const sortOrder = ref<'asc' | 'desc'>('desc');

// --- Estado local para Paginación ---
const currentPage = ref(1);
const itemsPerPage = ref(10); // Aumentado a 10 para mejor visualización

// --- Helpers de formato ---
const df = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' });

// --- Lógica Computada Adaptada ---

// 1. Contar filtros activos (leyendo del store)
const activeFilterCount = computed(() => {
	let count = 0;
	if (UUId.value) count++;
	if (estatus.value && estatus.value !== 'all') count++;
	if (fechaOrigen.value || fechaLimite.value) count++;
	return count;
});

// 2. Ordenar Facturas (el filtrado lo hace la API)
const sortedInvoices = computed(() => {
	if (!sortKey.value) return invoices.value;

	return [...invoices.value].sort((a, b) => {
		const valA = a[sortKey.value!];
		const valB = b[sortKey.value!];

		if (valA === null || valA === undefined) return 1;
		if (valB === null || valB === undefined) return -1;

		if (typeof valA === 'number' && typeof valB === 'number') {
			return sortOrder.value === 'asc' ? valA - valB : valB - valA;
		}
		if (typeof valA === 'string' && typeof valB === 'string') {
			return sortOrder.value === 'asc'
				? valA.localeCompare(valB)
				: valB.localeCompare(valA);
		}
		return 0;
	});
});

// 3. Paginar Facturas Ordenadas (sin cambios en la lógica)
const paginatedInvoices = computed(() => {
	const start = (currentPage.value - 1) * itemsPerPage.value;
	const end = start + itemsPerPage.value;
	return sortedInvoices.value.slice(start, end);
});

// 4. Calcular Total de Páginas (sin cambios en la lógica)
const totalPages = computed(() => {
	return Math.ceil(sortedInvoices.value.length / itemsPerPage.value);
});

// --- Watchers para conectar UI con el Store ---

// Sincroniza los calendarios locales con el estado del store
watch(startDate, (newDate) => {
	fechaOrigen.value = newDate
		? newDate.toDate(getLocalTimeZone()).toISOString().split('T')[0]
		: '';
});
watch(endDate, (newDate) => {
	fechaLimite.value = newDate
		? newDate.toDate(getLocalTimeZone()).toISOString().split('T')[0]
		: '';
});

// Reinicia la paginación cuando los filtros del store cambian
watch([UUId, estatus, fechaOrigen, fechaLimite, tipoFechaBusqueda], () => {
	currentPage.value = 1;
});

// --- Métodos Adaptados ---

// Limpiar filtros (actualizando el store y el estado local)
const clearFilters = () => {
	UUId.value = '';
	estatus.value = 'all'; // O el valor por defecto que prefieras
	tipoFechaBusqueda.value = 'timbrado';
	startDate.value = undefined;
	endDate.value = undefined;
	// El watch se encargará de limpiar fechOrigne y fechaLimite en el store
};

// Cambiar ordenación (la lógica no cambia)
const setSort = (key: keyof InvoiceMonitor) => {
	if (sortKey.value === key) {
		sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
	} else {
		sortKey.value = key;
		sortOrder.value = 'asc';
	}
	currentPage.value = 1;
};

// Paginación (la lógica no cambia)
const prevPage = () => {
	if (currentPage.value > 1) currentPage.value--;
};
const nextPage = () => {
	if (currentPage.value < totalPages.value) currentPage.value++;
};

// --- Helpers de UI (sin cambios, solo se adaptan a nuevos nombres de props) ---
const formatDate = (dateString: string) => {
	try {
		return new Intl.DateTimeFormat('es-ES', { dateStyle: 'short' }).format(new Date(dateString));
	} catch {
		return 'N/A';
	}
};
const formatCurrency = (amount: number, currency: string) =>
	new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount);

const getFiltersButtonVariant = () => {
	if (showFilters.value) return 'default';
	if (!showFilters.value && activeFilterCount.value === 0) return 'outline';
	return 'default'; // Mantenerlo resaltado si hay filtros activos
};

const getBadgeVariant = (estatus: string | null) => {
	if (estatus === 'PENDIENTE') return 'secondary';
	if (estatus === 'PROCESADA') return 'default';
	if (estatus === 'PAGADA TOTALMENTE') return 'success';
	if (estatus === 'PAGADA PARCIALMENTE') return 'destructive';
	if (estatus === 'CON COMPLEMENTO') return 'outline';
	return 'outline';
};
</script>

<template>
	<div class="container mx-auto py-6 md:py-10">
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-2xl font-bold md:text-3xl">Mis Facturas</h1>
			<Button :variant="getFiltersButtonVariant()" @click="showFilters = !showFilters" :class="activeFilterCount > 0 && !showFilters
				? 'bg-primary font-bold text-white hover:bg-purple-600'
				: ''
				">
				<Filter class="mr-2 h-4 w-4" />
				Filtros
				<Badge v-if="activeFilterCount > 0" variant="secondary" class="ml-2">{{
					activeFilterCount
				}}</Badge>
			</Button>
		</div>

		<!-- 5. Manejo de estados de Carga y Error -->
		<MyInvoicesSkeleton v-if="isLoading" />
		<div v-else-if="isError" class="py-10 text-center text-red-500">
			<p>Error al cargar las facturas: {{ error?.message }}</p>
			<Button variant="outline" class="mt-4" @click="invoicesStore.refetch()">
				Reintentar
			</Button>
		</div>

		<!-- Contenido principal cuando hay datos -->
		<div v-else class="flex gap-6">
			<div class="flex-1">
				<Card>
					<CardContent class="p-0">
						<div class="overflow-x-auto">
							<Table>
								<TableHeader>
									<!-- 6. Cabeceras adaptadas al nuevo schema -->
									<TableRow>
										<TableHead>
											<Button variant="ghost" @click="setSort('uuid')" class="px-1">
												UUID
											</Button>
										</TableHead>
										<TableHead>Emisor</TableHead>
										<TableHead class="text-center">Estatus</TableHead>
										<TableHead class="text-right">
											<Button variant="ghost" @click="setSort('total')" class="px-1">
												Importe
											</Button>
										</TableHead>
										<TableHead class="text-center">Moneda</TableHead>
										<TableHead class="w-28 text-center">
											<Button variant="ghost" @click="setSort('fecha_timbrado')" class="px-1">
												Fecha timbrado
											</Button>
										</TableHead>
										<TableHead class="w-28 text-center">
											<Button variant="ghost" @click="setSort('fecha_creacion')" class="px-1">
												Fecha carga
											</Button>
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									<template v-if="paginatedInvoices.length > 0">
										<TableRow v-for="inv in paginatedInvoices" :key="inv.uuid"
											class="cursor-pointer transition-colors duration-150 hover:bg-muted/50"
											@click="
												$router.push({
													name: 'invoice-detail', // Ajusta el nombre de la ruta si es necesario
													params: { uuid: inv.uuid },
												})
												">
											<!-- 7. Celdas adaptadas al nuevo schema -->
											<TableCell class="py-4 font-mono text-xs">{{ inv.uuid }}</TableCell>
											<TableCell class="py-4">{{ inv.razonsocial_emisor }}</TableCell>
											<TableCell class="py-4 text-center">
												<Badge :variant="getBadgeVariant(inv.estatus)">{{ inv.estatus }}</Badge>
											</TableCell>
											<TableCell class="py-4 font-mono text-right">
												{{ formatCurrency(inv.total, inv.moneda) }}
											</TableCell>
											<TableCell class="py-4 text-center">{{ inv.moneda }}</TableCell>
											<TableCell class="py-4 text-center">
												{{ formatDate(inv.fecha_timbrado) }}
											</TableCell>
											<TableCell class="py-4 text-center">
												{{ formatDate(inv.fecha_creacion) }}
											</TableCell>
										</TableRow>
									</template>
									<TableRow v-else>
										<TableCell colspan="7" class="py-10 text-center text-muted-foreground">
											No se encontraron facturas con los filtros seleccionados.
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</div>
					</CardContent>
					<CardFooter class="flex items-center justify-between border-t px-6 py-4">
						<div class="text-sm text-muted-foreground">
							Mostrando {{ paginatedInvoices.length }} de {{ sortedInvoices.length }} facturas.
						</div>
						<div class="flex items-center space-x-2">
							<Button variant="outline" size="sm" @click="prevPage" :disabled="currentPage === 1">
								Anterior
							</Button>
							<span class="text-sm font-medium">
								Página {{ totalPages > 0 ? currentPage : 0 }} de {{ totalPages }}
							</span>
							<Button variant="outline" size="sm" @click="nextPage"
								:disabled="currentPage === totalPages || totalPages === 0">
								Siguiente
							</Button>
						</div>
					</CardFooter>
				</Card>
			</div>

			<!-- Columna de Filtros (Sidebar) -->
			<Transition name="slide-fade">
				<div v-if="showFilters" class="w-72 flex-shrink-0">
					<Card class="sticky top-6">
						<CardHeader>
							<CardTitle>Filtros</CardTitle>
						</CardHeader>
						<!-- 8. Filtros conectados al store -->
						<CardContent class="flex flex-col gap-6">
							<div class="flex flex-col gap-2">
								<Label for="search-filter">Buscar por UUID</Label>
								<Input id="search-filter" placeholder="UUID..." v-model="UUId" />
							</div>
							<div class="flex flex-col gap-2">
								<Label for="estatus-filter">Estatus</Label>
								<Select v-model="estatus">
									<SelectTrigger id="estatus-filter">
										<SelectValue placeholder="Filtrar por Estatus" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Todos</SelectItem>
										<SelectItem value="Cargada">Cargada</SelectItem>
										<SelectItem value="Validada">Validada</SelectItem>
										<SelectItem value="Pagada">Pagada</SelectItem>
										<SelectItem value="Rechazada">Rechazada</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div class="flex flex-col gap-2">
								<Label>Filtrar por fecha de</Label>
								<Select v-model="tipoFechaBusqueda">
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="timbrado">Timbrado</SelectItem>
										<SelectItem value="carga">Carga</SelectItem>
									</SelectContent>
								</Select>
								<div class="mt-2 flex flex-col gap-2">
									<Popover>
										<PopoverTrigger as-child>
											<Button variant="outline" class="w-full justify-start text-left font-normal"
												:class="!startDate && 'text-muted-foreground'">
												<CalendarIcon class="mr-2 h-4 w-4" />
												<span>{{
													startDate
														? df.format(startDate.toDate(getLocalTimeZone()))
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
											<Button variant="outline" class="w-full justify-start text-left font-normal"
												:class="!endDate && 'text-muted-foreground'">
												<CalendarIcon class="mr-2 h-4 w-4" />
												<span>{{
													endDate
														? df.format(endDate.toDate(getLocalTimeZone()))
														: 'Fecha de fin' }}</span>
											</Button>
										</PopoverTrigger>
										<PopoverContent class="w-auto p-0">
											<Calendar v-model="endDate" />
										</PopoverContent>
									</Popover>
								</div>
							</div>
						</CardContent>
						<CardFooter>
							<Button variant="ghost" class="w-full cursor-pointer" @click="clearFilters"
								:disabled="activeFilterCount === 0">
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
</style>