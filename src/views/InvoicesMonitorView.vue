<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Building, Fingerprint, Calendar as CalendarIcon } from 'lucide-vue-next'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

// --- INTERFACES Y DATOS ---
// NOTA: En una app real, estos datos vendrían de un store (Pinia) o una llamada a API,
// para no duplicarlos en cada vista.
interface Prorateo {
	id: string
	cuentaContable: string
	centroCosto: string
	indicadorImpuesto: string
	importe: number
	porcentaje: number
}

interface Concepto {
	id: string
	descripcion: string
	cantidad: number
	unidad: string
	valorUnitario: number
	importe: number
	estatus: 'Pendiente' | 'Completado'
	prorrateos: Prorateo[]
}

interface Factura {
	id: string
	folio: string // Este será el "Folio de factura"
	proveedor: string // NUEVO
	sociedad: string
	fecha: string
	rfcEmisor: string
	rfcReceptor: string // NUEVO
	subtotal: number
	impuestos: number // NUEVO
	descuentos: number // NUEVO
	retenciones: number // NUEVO
	total: number
	moneda: string
	conceptos: Concepto[]
}

const allInvoices = ref<Factura[]>([
	// Factura 1: Simple, consultoría
	{
		id: 'inv_001',
		folio: 'F-2024-001',
		proveedor: 'Consultoría Estratégica S.A.',
		sociedad: '1000',
		fecha: '2024-07-01',
		rfcEmisor: 'CES120518XYZ',
		rfcReceptor: 'CLI987654ABC',
		subtotal: 15000,
		impuestos: 2400,
		descuentos: 0,
		retenciones: 900, // Retención por servicios profesionales
		total: 16500,
		moneda: 'MXN',
		conceptos: [
			{
				id: 'cpt_1a',
				descripcion: 'Análisis de Mercado Q3',
				cantidad: 1,
				unidad: 'Servicio',
				valorUnitario: 15000,
				importe: 15000,
				estatus: 'Pendiente',
				prorrateos: [],
			},
		],
	},
	// Factura 2: Múltiples conceptos, productos de TI
	{
		id: 'inv_002',
		folio: 'A-2024-105',
		proveedor: 'Soluciones TI de México S.A. de C.V.',
		sociedad: '2000',
		fecha: '2024-07-05',
		rfcEmisor: 'STM210510ABC',
		rfcReceptor: 'CLI987654ABC',
		subtotal: 8500,
		impuestos: 1360,
		descuentos: 500, // Descuento por paquete
		retenciones: 0,
		total: 9360,
		moneda: 'MXN',
		conceptos: [
			{
				id: 'cpt_2a',
				descripcion: 'Licencia Anual Antivirus (10 Equipos)',
				cantidad: 1,
				unidad: 'Paquete',
				valorUnitario: 5000,
				importe: 5000,
				estatus: 'Pendiente',
				prorrateos: [],
			},
			{
				id: 'cpt_2b',
				descripcion: 'Soporte Técnico Remoto (5 Horas)',
				cantidad: 1,
				unidad: 'Servicio',
				valorUnitario: 3500,
				importe: 3500,
				estatus: 'Pendiente',
				prorrateos: [],
			},
		],
	},
	// Factura 3: En Dólares, materia prima
	{
		id: 'inv_003',
		folio: 'B-2024-033',
		proveedor: 'Aceros del Norte S. de R.L.',
		sociedad: '1000',
		fecha: '2024-07-08',
		rfcEmisor: 'ANO050822DEF',
		rfcReceptor: 'IND456123GHI',
		subtotal: 2500,
		impuestos: 400,
		descuentos: 0,
		retenciones: 0,
		total: 2900,
		moneda: 'USD',
		conceptos: [
			{
				id: 'cpt_3a',
				descripcion: 'Viga de Acero IPR 10"',
				cantidad: 10,
				unidad: 'Pieza',
				valorUnitario: 250,
				importe: 2500,
				estatus: 'Pendiente',
				prorrateos: [],
			},
		],
	},
	// Factura 4: Nota de Crédito (valores negativos)
	{
		id: 'inv_004',
		folio: 'NC-2024-015',
		proveedor: 'Servicios Creativos Digitales',
		sociedad: '3000',
		fecha: '2024-07-15',
		rfcEmisor: 'SCD180115JKL',
		rfcReceptor: 'CLI987654ABC',
		subtotal: -2500,
		impuestos: -400,
		descuentos: 0,
		retenciones: 0,
		total: -2900,
		moneda: 'MXN',
		conceptos: [
			{
				id: 'cpt_4a',
				descripcion: 'Ajuste por campaña publicitaria de Junio',
				cantidad: -1,
				unidad: 'Ajuste',
				valorUnitario: 2500,
				importe: -2500,
				estatus: 'Pendiente',
				prorrateos: [],
			},
		],
	},
	// Factura 5: Flete con retención de IVA
	{
		id: 'inv_005',
		folio: 'L-500-2024',
		proveedor: 'Logística Express del Sureste',
		sociedad: '2000',
		fecha: '2024-07-18',
		rfcEmisor: 'LES150930MNO',
		rfcReceptor: 'IND456123GHI',
		subtotal: 8500,
		impuestos: 1360,
		descuentos: 0,
		retenciones: 340, // 4% de retención de IVA para fletes
		total: 9520,
		moneda: 'MXN',
		conceptos: [
			{
				id: 'cpt_5a',
				descripcion: 'Servicio de Flete Terrestre (Ruta MTY-CDMX)',
				cantidad: 1,
				unidad: 'Viaje',
				valorUnitario: 8500,
				importe: 8500,
				estatus: 'Pendiente',
				prorrateos: [],
			},
		],
	},
])

// --- ESTADO DE LA VISTA ---
const invoiceSearchTerm = ref('')
const router = useRouter()

// --- LÓGICA COMPUTADA ---
const filteredInvoices = computed(() => {
	if (!invoiceSearchTerm.value) return allInvoices.value
	const lowerSearch = invoiceSearchTerm.value.toLowerCase()
	return allInvoices.value.filter(
		(inv) =>
			inv.folio.toLowerCase().includes(lowerSearch) ||
			inv.proveedor.toLowerCase().includes(lowerSearch),
	)
})

// --- MÉTODOS ---
const goToDetail = (invoiceId: string) => {
	// Añade la barra al principio
	router.push({
		name: 'invoice-monitor-detail',
		params: { uuid: invoiceId },
	})
}

const formatCurrency = (amount: number, currency: string) =>
	new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount)
const df = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' })
</script>

<template>
	<div class="container mx-auto py-6 md:py-10">
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-2xl font-bold md:text-3xl">Monitor de Facturas</h1>
		</div>

		<div class="space-y-4">
			<div class="relative">
				<Search
					class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
				/>
				<Input
					v-model="invoiceSearchTerm"
					placeholder="Buscar por folio o proveedor..."
					class="pl-10"
				/>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto p-1">
				<Card
					v-for="invoice in filteredInvoices"
					:key="invoice.id"
					class="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
					@click="goToDetail(invoice.id)"
				>
					<div class="flex justify-between items-stretch">
						<div class="p-4 flex-1">
							<h3 class="font-bold text-primary">{{ invoice.folio }}</h3>
							<p class="text-sm text-muted-foreground">{{ invoice.proveedor }}</p>
							<Separator class="my-2" />
							<div class="text-xs space-y-1 text-muted-foreground">
								<p class="flex items-center gap-2">
									<Building class="h-3 w-3" /> Sociedad: {{ invoice.sociedad }}
								</p>
								<p class="flex items-center gap-2">
									<Fingerprint class="h-3 w-3" /> RFC: {{ invoice.rfcEmisor }}
								</p>
								<p class="flex items-center gap-2">
									<CalendarIcon class="h-3 w-3" /> Fecha:
									{{ df.format(new Date(invoice.fecha)) }}
								</p>
							</div>
						</div>
						<div
							class="flex flex-col justify-center items-center p-4 w-32 rounded-r-lg"
						>
							<span class="text-xs text-muted-foreground">{{ invoice.moneda }}</span>
							<span class="font-bold text-lg">{{
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
