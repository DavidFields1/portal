<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import {
	Search,
	Building,
	Fingerprint,
	Calendar as CalendarIcon,
} from 'lucide-vue-next';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
// 1. Importar el store que creamos
import { useInvoiceMonitorStore } from '@/stores/invoiceMonitorStore';

// --- ESTADO DE LA VISTA ---
const invoiceSearchTerm = ref('');
const router = useRouter();

// 2. Instanciar el store. La llamada a la API se ejecuta automáticamente.
const invoiceMonitorStore = useInvoiceMonitorStore();

// 3. Extraer los datos y estados del store de forma reactiva
const { invoices, isLoading, isError, error } = storeToRefs(invoiceMonitorStore);

// --- LÓGICA COMPUTADA ---
// 4. Adaptar la propiedad computada para que filtre los datos del store
const filteredInvoices = computed(() => {
	if (!invoices.value) return []; // Devolver array vacío si no hay datos
	if (!invoiceSearchTerm.value) return invoices.value;

	const lowerSearch = invoiceSearchTerm.value.toLowerCase();
	return invoices.value.filter(
		(inv) =>
			inv.folio.toLowerCase().includes(lowerSearch) ||
			inv.razonsocial_emisor.toLowerCase().includes(lowerSearch),
	);
});

// --- MÉTODOS ---
// 5. Asegurarse de que el método de navegación use el UUID
const goToDetail = (invoiceUuid: string) => {
	router.push({
		name: 'invoice-monitor-detail',
		params: { uuid: invoiceUuid },
	});
};

// Funciones de formato (se mantienen igual)
const formatCurrency = (amount: number, currency: string) =>
	new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(
		amount,
	);
const df = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' });
</script>

<template>
	<div class="container mx-auto py-6 md:py-10">
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-2xl font-bold md:text-3xl">Monitor de Facturas</h1>
		</div>

		<!-- 6. Manejar los estados de carga y error -->
		<div v-if="isLoading" class="text-center py-10">
			<p>Cargando facturas...</p>
		</div>
		<div v-else-if="isError" class="text-center py-10 text-red-500">
			<p>Error al cargar las facturas: {{ error?.message }}</p>
		</div>

		<!-- 7. Mostrar el contenido solo cuando la carga ha finalizado y no hay error -->
		<div v-else class="space-y-4">
			<div class="relative">
				<Search
					class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
				/>
				<Input
					v-model="invoiceSearchTerm"
					placeholder="Buscar por folio o proveedor..."
					class="pl-10"
				/>
			</div>
			<div
				class="grid grid-cols-1 gap-4 p-1 max-h-[75vh] overflow-y-auto md:grid-cols-2"
			>
				<!-- 8. Actualizar el v-for y los bindings de datos -->
				<Card
					v-for="invoice in filteredInvoices"
					:key="invoice.id_factura"
					class="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
					@click="goToDetail(invoice.uuid)"
				>
					<div class="flex items-stretch justify-between">
						<div class="flex-1 p-4">
							<h3 class="font-bold text-primary">{{ invoice.uuid }}</h3>
							<p class="text-sm text-muted-foreground">
								{{ invoice.razonsocial_emisor }}
							</p>
							<Separator class="my-2" />
							<div class="space-y-1 text-xs text-muted-foreground">
								<p class="flex items-center gap-2">
									<Building class="h-3 w-3" /> Sociedad:
									{{ invoice.sociedad }}
								</p>
								<p class="flex items-center gap-2">
									<Fingerprint class="h-3 w-3" /> RFC:
									{{ invoice.rfc_emisor }}
								</p>
								<p class="flex items-center gap-2">
									<CalendarIcon class="h-3 w-3" /> Fecha:
									{{ df.format(new Date(invoice.fecha_expedicion)) }}
								</p>
							</div>
						</div>
						<div
							class="flex w-32 flex-col items-center justify-center rounded-r-lg p-4"
						>
							<span class="text-xs text-muted-foreground">{{
								invoice.moneda
							}}</span>
							<span class="text-lg font-bold">{{
								formatCurrency(invoice.total, invoice.moneda).replace(
									/[A-Z$]+/g,
									'',
								)
							}}</span>
						</div>
					</div>
				</Card>
			</div>
		</div>
	</div>
</template>