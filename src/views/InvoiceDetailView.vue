<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'


// --- Schemas (Asegúrate de tener estos schemas definidos) ---
import type {
	InvoiceMonitor,
} from '@/schemas/invoiceSchemas'


// --- Dependencias (composables y queries) ---
import { useInvoicesQuery } from '@/composables/useInvoiceQuery'

// --- Componentes UI ---
import {
	ArrowLeft,
	Building,
	Calendar,
	Clock,
	CreditCard,
	FileText,
	Fingerprint,
	Download,
	ChevronDown,
	FileCode,
} from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import DropdownMenu from '@/components/ui/dropdown-menu/DropdownMenu.vue'
import DropdownMenuTrigger from '@/components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import DropdownMenuContent from '@/components/ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuItem from '@/components/ui/dropdown-menu/DropdownMenuItem.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils' // Asumo que tienes formatDate
import InvoiceDetailSkeleton from '@/components/skeleton/InvoiceDetailSkeleton.vue'
import { ConceptResponseSchema, type Concept } from '@/schemas/conceptSchemas'
import axiosInstance from '@/config/axiosInstance'
import { GoodsReceiptResponseSchema, type GoodsReceipt } from '@/schemas/goodReceiptSchema'
import { formatDate } from '@vueuse/core'
import InvoiceHeader from '@/components/invoice-monitor/InvoiceHeader.vue'

// --- Lógica de la Vista ---
const route = useRoute()
const router = useRouter()
const uuid = computed(() => route.params.uuid as string)

// 1. Query principal para la factura
const {
	data: invoiceData,
	isLoading: isLoadingInvoice,
	isError: isErrorInvoice,
	error: errorInvoice,
	refetch: refetchInvoice,
} = useInvoicesQuery({ UUId: uuid.value })

const invoice = computed<InvoiceMonitor | undefined>(
	() => invoiceData.value?.object?.[0],
)

// 2. Query para Conceptos
const {
	data: conceptsData,
	isLoading: isLoadingConcepts,
	isError: isErrorConcepts,
} = useQuery({
	queryKey: ['concepts', uuid],
	queryFn: async (): Promise<Concept[]> => {
		if (!uuid.value) throw new Error('UUID no disponible para buscar conceptos.')

		const params = new URLSearchParams({ uuid_factura: uuid.value })
		const { data } = await axiosInstance.get('/factura/concepto', { params })

		const parsedData = ConceptResponseSchema.parse(data)
		return parsedData.object ?? []
	},
	enabled: computed(() => !!invoice.value?.uuid),
})
const concepts = computed(() => conceptsData.value ?? [])

// 3. Query para Entradas de Mercancía
const {
	data: entriesData,
	isLoading: isLoadingEntries,
	isError: isErrorEntries,
} = useQuery({
	queryKey: ['entries', uuid],
	queryFn: async (): Promise<GoodsReceipt[]> => {
		if (!uuid.value) throw new Error('UUID no disponible para buscar entradas.')
		const params = new URLSearchParams({ uuid_factura: uuid.value })
		// ❗ RECUERDA: Reemplaza '/factura/entradas-mercancia' por tu endpoint real
		const { data } = await axiosInstance.get('/factura/entradas-mercancia', {
			params,
		})
		const parsedData = GoodsReceiptResponseSchema.parse(data)
		return parsedData.object ?? []
	},
	enabled: computed(
		() => !!invoice.value?.uuid && invoice.value?.tipo_factura === 'SOC',
	),
})
const entries = computed(() => entriesData.value ?? [])

// --- Helpers ---
// const getStatusBadgeVariant = (status?: string) => {
// 	if (!status) return 'outline'
// 	switch (status) {
// 		case 'Pagada':
// 			return 'success'
// 		case 'Validada':
// 			return 'default'
// 		case 'Cargada':
// 			return 'secondary'
// 		case 'Rechazada':
// 			return 'destructive'
// 		default:
// 			return 'outline'
// 	}
// }

const downloadPDF = () => {
	console.log(`Descargando PDF para la Factura ${invoice.value?.uuid}`)
	alert(`Iniciando descarga del PDF`)
}

const downloadXML = () => {
	console.log(`Descargando XML para la Factura ${invoice.value?.uuid}`)
	alert(`Iniciando descarga del XML`)
}
</script>

<template>
	<div class="container mx-auto py-6 md:py-10">
		<!-- Estado de Carga Principal -->
		<InvoiceDetailSkeleton v-if="isLoadingInvoice" />

		<!-- Estado de Error Principal -->
		<div v-else-if="isErrorInvoice" class="py-10 text-center text-red-500">
			<p>
				Error al cargar la factura:
				{{
					errorInvoice instanceof Error ? errorInvoice.message : 'Error desconocido'
				}}
			</p>
			<Button variant="outline" class="mt-4" @click="refetchInvoice()">
				Reintentar
			</Button>
		</div>

		<!-- Contenido Principal (cuando la factura existe) -->
		<div v-else-if="invoice" class="space-y-6">
			<!-- Botones de Acción (Regresar y Descargar) -->
			<div class="flex justify-between">
				<Button variant="outline" class="flex items-center gap-2" @click="router.push('/invoices')">
					<ArrowLeft class="h-4 w-4" />
					Regresar
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger as-child>
						<Button>
							<Download class="mr-2 h-4 w-4" />
							Descargar
							<ChevronDown class="ml-2 h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem @click="downloadPDF" class="cursor-pointer">
							<FileText class="mr-2 h-4 w-4 text-red-600" />
							<span>Descargar PDF</span>
						</DropdownMenuItem>
						<DropdownMenuItem @click="downloadXML" class="cursor-pointer">
							<FileCode class="mr-2 h-4 w-4 text-blue-600" />
							<span>Descargar XML</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<!-- Sección 1: Encabezado y datos principales -->
			<!-- <Card>
				<CardHeader>
					<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<div class="flex items-center gap-3">
							<CardTitle class="text-2xl">
								Factura:
								<span class="text-primary">{{
									invoice.uuid || invoice.serie || 'N/A'
								}}</span>
							</CardTitle>
						</div>
						<Badge :variant="getStatusBadgeVariant(invoice.estatus)" class="text-base capitalize">
							{{ invoice.estatus }}
						</Badge>
					</div>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div class="flex flex-col gap-2">
							<h4 class="flex items-center gap-2 font-semibold text-muted-foreground">
								<User class="h-5 w-5" /> Emisor
							</h4>
							<p class="text-lg font-medium">
								{{ invoice.razonsocial_emisor }}
							</p>
							<p class="font-mono text-sm text-muted-foreground">
								{{ invoice.rfc_emisor }}
							</p>
						</div>
						<div class="flex flex-col gap-2">
							<h4 class="flex items-center gap-2 font-semibold text-muted-foreground">
								<Building2 class="h-5 w-5" /> Receptor
							</h4>
							<p class="text-lg font-medium">
								{{ invoice.razonsocial_receptor }}
							</p>
							<p class="font-mono text-sm text-muted-foreground">
								{{ invoice.rfc_receptor }}
							</p>
						</div>
					</div>
					<Separator />
					<div class="flex flex-col items-end justify-center gap-2 pt-2">
						<h4 class="text-sm font-semibold text-muted-foreground">
							IMPORTE TOTAL
						</h4>
						<p class="flex items-center gap-2 text-4xl font-bold tracking-tight">
							<CircleDollarSign class="h-8 w-8 text-primary" />
							{{ formatCurrency(invoice.total, invoice.moneda) }}
						</p>
					</div>
				</CardContent>
			</Card> -->
			<InvoiceHeader :invoice="invoice" />

			<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<!-- Sección 2: Datos de la factura -->
				<Card>
					<CardHeader>
						<CardTitle>Datos de la Factura</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-2 text-muted-foreground">
								<Fingerprint class="h-4 w-4" /> UUID
							</span>
							<span class="font-mono text-sm">{{ invoice.uuid }}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-2 text-muted-foreground">
								<Calendar class="h-4 w-4" /> Fecha Emisión
							</span>
							<span class="font-semibold">{{
								formatDate(new Date(invoice.fecha_expedicion), 'dd/MM/yyyy')
							}}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-2 text-muted-foreground">
								<Clock class="h-4 w-4" /> Fecha Timbrado
							</span>
							<span class="font-semibold">{{
								formatDate(new Date(invoice.fecha_timbrado), 'dd/MM/yyyy')
							}}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-2 text-muted-foreground">
								<FileText class="h-4 w-4" /> Tipo de Factura
							</span>
							<Badge variant="outline" class="capitalize">{{
								invoice.tipo_factura
							}}</Badge>
						</div>
					</CardContent>
				</Card>

				<!-- Sección 3: Datos del pago -->
				<Card>
					<CardHeader>
						<CardTitle>Datos del Pago</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-2 text-muted-foreground">
								<CreditCard class="h-4 w-4" /> Forma de Pago
							</span>
							<span class="font-semibold">{{ invoice.forma_pago }}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-2 text-muted-foreground">
								<Calendar class="h-4 w-4" /> Fecha de Carga
							</span>
							<span class="font-semibold">{{
								formatDate(new Date(invoice.fecha_creacion), 'dd/MM/yyyy')
							}}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-2 text-muted-foreground">
								<Building class="h-4 w-4" /> Sociedad
							</span>
							<span class="font-semibold">{{ invoice.sociedad }}</span>
						</div>
					</CardContent>
				</Card>
			</div>

			<!-- Sección 4: Conceptos -->
			<Card>
				<CardHeader>
					<CardTitle>Conceptos</CardTitle>
				</CardHeader>
				<CardContent>
					<div v-if="isLoadingConcepts" class="space-y-2 pt-2">
						<Skeleton v-for="i in 3" :key="i" class="h-8 w-full" />
					</div>
					<div v-else-if="isErrorConcepts" class="py-4 text-center text-red-500">
						No se pudieron cargar los conceptos.
					</div>
					<Table v-else-if="concepts.length > 0">
						<TableHeader>
							<TableRow>
								<TableHead>Descripción</TableHead>
								<TableHead>Clave</TableHead>
								<TableHead class="text-center">Cantidad</TableHead>
								<TableHead class="text-right">Valor Unitario</TableHead>
								<TableHead class="text-right">Importe</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow v-for="c in concepts" :key="c.id_concepto">
								<TableCell class="font-medium">{{
									c.descripcion
								}}</TableCell>
								<TableCell>{{ c.clave_prod_serv }}</TableCell>
								<TableCell class="text-center">{{ c.cantidad }}</TableCell>
								<TableCell class="text-right font-mono">{{
									formatCurrency(c.valor_unitario, invoice.moneda)
								}}</TableCell>
								<TableCell class="text-right font-mono">{{
									formatCurrency(c.importe, invoice.moneda)
								}}</TableCell>
							</TableRow>
						</TableBody>
					</Table>
					<div v-else class="py-4 text-center text-muted-foreground">
						Esta factura no tiene conceptos registrados.
					</div>
				</CardContent>
			</Card>

			<!-- Sección 5: Entradas de mercancía -->
			<Card v-if="invoice.tipo_factura === 'SOC'">
				<CardHeader>
					<CardTitle>Entradas de Mercancía</CardTitle>
				</CardHeader>
				<CardContent>
					<div v-if="isLoadingEntries" class="space-y-2 pt-2">
						<Skeleton v-for="i in 2" :key="i" class="h-8 w-full" />
					</div>
					<div v-else-if="isErrorEntries" class="py-4 text-center text-red-500">
						No se pudieron cargar las entradas de mercancía.
					</div>
					<Table v-else-if="entries.length > 0">
						<TableHeader>
							<TableRow>
								<TableHead>Orden Compra</TableHead>
								<TableHead>Entrada de Mercancía</TableHead>
								<TableHead class="text-center">Posición EM</TableHead>
								<TableHead class="text-center">Ejercicio Fiscal</TableHead>
								<TableHead class="text-center">Posición OC</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow v-for="em in entries" :key="em.DocMaterial">
								<TableCell class="font-medium">{{
									em.OrdenCompra
								}}</TableCell>
								<TableCell>{{ em.DocMaterial }}</TableCell>
								<TableCell class="text-center">{{ em.Posicion }}</TableCell>
								<TableCell class="text-center">{{
									em.EjercicioDocMat
								}}</TableCell>
								<TableCell class="text-center">{{ em.PosDocRef }}</TableCell>
							</TableRow>
						</TableBody>
					</Table>
					<div v-else class="py-4 text-center text-muted-foreground">
						No se encontraron entradas de mercancía para esta factura.
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- Estado de Factura no encontrada -->
		<div v-else class="py-10 text-center text-muted-foreground">
			No se encontró la factura solicitada.
		</div>
	</div>
</template>