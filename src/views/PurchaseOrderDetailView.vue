<script setup lang="ts">
import { ref, onMounted } from 'vue'

import {
	ArrowLeft,
	Building,
	Calendar,
	Download,
	Landmark,
	MapPin,
	PackageCheck,
	Receipt,
	User,
	ChevronDown,
	ListOrdered,
	Globe,
	Factory,
	Check,
	FileText,
	FileCode,
	FileKey,
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
import { Separator } from '@/components/ui/separator'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// --- Tipos y Lógica del Stepper ---
type OrdenEstatus =
	| 'Creada'
	| 'En Tránsito'
	| 'Recibida'
	| 'Facturada'
	| 'Completada por consignación'

const statusProgression: OrdenEstatus[] = ['Creada', 'En Tránsito', 'Recibida', 'Facturada']
const consignmentStatus: OrdenEstatus = 'Completada por consignación'

const getStatusProgress = (currentStatus: OrdenEstatus) => {
	if (currentStatus === consignmentStatus) {
		return { isConsignment: true, currentIndex: statusProgression.length }
	}
	const currentIndex = statusProgression.indexOf(currentStatus)
	return { isConsignment: false, currentIndex }
}

// --- Estado y Datos de Ejemplo ---
const isLoading = ref(true)

const ordenCompra = ref({
	id: '4500018395',
	subtotal: 85000.0,
	impuestos: 13600.0,
	importe: 98600.0,
	moneda: 'MXN',
	tipoPedido: 'NACIONAL',
	estatus: 'Recibida' as OrdenEstatus,
	anticipo: true,
	porcentajeAnticipo: 20,
	montoAnticipo: 19720.0,
	fechaVencimiento: '2024-08-30T00:00:00Z',
})

const sociedad = ref({
	id: '1000',
	rfc: 'MEMS890101ABC',
	calle: 'Av. de la Industria 4',
	municipio: 'Tlalnepantla de Baz',
	ciudad: 'Estado de México',
	codigoPostal: '54060',
})

const proveedor = ref({
	nombre: 'Proveedor Industrial S.A.',
	rfc: 'PISA850101XYZ',
	calle: 'Calle de la Maquinaria',
	numeroExterior: '500',
	municipio: 'Querétaro',
	ciudad: 'Querétaro',
	estado: 'QRO',
	codigoPostal: '76000',
	pais: 'México',
})

const entradasMercancia = ref([
	{
		docMaterial: '5000004521',
		ejercicio: '2024',
		posicionEM: 1,
		posicionOC: 10,
		descripcion: 'Tornillos de acero inoxidable',
		cantidad: 500,
		um: 'PZA',
		valorUnitario: 10.0,
		importe: 5000.0,
		indImpuesto: 'V1',
		porcImpuesto: 16,
		retenciones: 0,
	},
])

const posicionesPedido = ref([
	{
		posicion: 10,
		material: 'TORN-INOX-001',
		cantidad: 500,
		um: 'PZA',
		precioUnitario: 10.0,
		importe: 5000.0,
		numeroMaterial: '100-3001',
		centro: 'MX01',
		textoMaterial: 'Tornillos de acero inoxidable M5x20',
		almacen: 'A01',
		numeroProveedor: 'PROV-MAT-45',
		indicadorImpuesto: 'V1',
		fechaEntrega: '2024-08-15T00:00:00Z',
	},
	{
		posicion: 20,
		material: 'TUERCA-INOX-001',
		cantidad: 800,
		um: 'PZA',
		precioUnitario: 100.0,
		importe: 80000.0,
		numeroMaterial: '100-3002',
		centro: 'MX01',
		textoMaterial: 'Tuerca hexagonal de acero inoxidable M5',
		almacen: 'A01',
		numeroProveedor: 'PROV-MAT-46',
		indicadorImpuesto: 'V1',
		fechaEntrega: '2024-08-20T00:00:00Z',
	},
])

const expandedPositions = ref<number[]>([])

// --- Métodos ---
const downloadPDF = () => {
	console.log(`Descargando PDF de la OC: ${ordenCompra.value.id}`)
	alert(`Iniciando descarga del PDF para la OC ${ordenCompra.value.id}`)
}

const downloadXML = () => {
	console.log(`Descargando XML de la OC: ${ordenCompra.value.id}`)
	alert(`Iniciando descarga del XML para la OC ${ordenCompra.value.id}`)
}

const formatCurrency = (amount: number, currency: string) =>
	new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount)

const formatDate = (dateString: string) => {
	try {
		return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(
			new Date(dateString),
		)
	} catch {
		return dateString
	}
}

const togglePosition = (posicion: number) => {
	const index = expandedPositions.value.indexOf(posicion)
	if (index > -1) {
		expandedPositions.value.splice(index, 1)
	} else {
		expandedPositions.value.push(posicion)
	}
}

const isPositionExpanded = (posicion: number) => expandedPositions.value.includes(posicion)

onMounted(() => {
	setTimeout(() => {
		isLoading.value = false
	}, 500)
})
</script>

<template>
	<div class="container mx-auto py-6 md:py-10">
		<!-- Fila de botones de acción -->
		<div class="mb-6 flex items-center justify-between">
			<Button
				variant="outline"
				class="flex cursor-pointer items-center gap-2"
				@click="$router.push('/purchase-order')"
			>
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

		<div class="space-y-6">
			<!-- Sección 1: Encabezado y datos principales -->
			<Card>
				<CardHeader>
					<!-- Stepper de Progreso -->
					<div class="px-6 pb-6 pt-2">
						<div class="flex w-full items-center">
							<template v-for="(status, index) in statusProgression" :key="status">
								<div class="z-10 flex flex-col items-center">
									<div
										class="flex h-6 w-6 items-center justify-center rounded-full border-2"
										:class="
											getStatusProgress(ordenCompra.estatus).currentIndex >=
											index
												? 'border-primary bg-primary'
												: 'border-muted-foreground bg-card'
										"
									>
										<Check
											v-if="
												getStatusProgress(ordenCompra.estatus)
													.currentIndex > index
											"
											class="h-4 w-4 text-white"
										/>
										<div
											v-else-if="
												getStatusProgress(ordenCompra.estatus)
													.currentIndex === index
											"
											class="h-2.5 w-2.5 rounded-full bg-white"
										></div>
									</div>
									<p
										class="mt-2 text-center text-xs"
										:class="
											getStatusProgress(ordenCompra.estatus).currentIndex >=
											index
												? 'font-semibold text-primary'
												: 'text-muted-foreground'
										"
									>
										{{ status }}
									</p>
								</div>
								<div
									v-if="index < statusProgression.length - 1"
									class="h-1 flex-1"
									:class="
										getStatusProgress(ordenCompra.estatus).currentIndex > index
											? 'bg-primary'
											: 'bg-muted'
									"
								></div>
							</template>
						</div>
					</div>
					<Separator class="my-4" />
					<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<CardTitle class="text-2xl">
							Orden de Compra:
							<span class="text-primary">{{ ordenCompra.id }}</span>
						</CardTitle>
						<Badge
							:variant="
								ordenCompra.tipoPedido === 'NACIONAL' ? 'secondary' : 'outline'
							"
							class="text-base capitalize"
						>
							<Globe class="mr-2 h-4 w-4" />
							{{ ordenCompra.tipoPedido }}
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<!-- Columna Izquierda: Detalles de Pago -->
						<div class="space-y-6">
							<!-- Grupo: Detalles del Anticipo -->
							<div class="space-y-2">
								<h3 class="flex items-center gap-2 font-semibold">
									<Receipt class="h-5 w-5 text-primary" />
									Detalles del Anticipo
								</h3>
								<div class="flex items-center justify-between text-sm">
									<span class="text-muted-foreground">Condición</span>
									<span class="font-medium">{{
										ordenCompra.anticipo ? 'Aplica Anticipo' : 'Sin Anticipo'
									}}</span>
								</div>
								<div
									v-if="ordenCompra.anticipo"
									class="flex items-center justify-between text-sm"
								>
									<span class="text-muted-foreground">Porcentaje</span>
									<span class="font-medium"
										>{{ ordenCompra.porcentajeAnticipo }}%</span
									>
								</div>
								<div
									v-if="ordenCompra.anticipo"
									class="flex items-center justify-between text-sm"
								>
									<span class="text-muted-foreground">Monto a pagar</span>
									<span class="font-mono font-medium">{{
										formatCurrency(
											ordenCompra.montoAnticipo,
											ordenCompra.moneda,
										)
									}}</span>
								</div>
							</div>

							<!-- Grupo: Fecha de Vencimiento -->
							<div class="space-y-2">
								<h3 class="flex items-center gap-2 font-semibold">
									<Calendar class="h-5 w-5 text-primary" />
									Fecha de Vencimiento
								</h3>
								<div class="flex items-center justify-between text-sm">
									<span class="text-muted-foreground">Fecha límite de pago</span>
									<span class="font-medium">{{
										formatDate(ordenCompra.fechaVencimiento)
									}}</span>
								</div>
							</div>
						</div>

						<!-- Columna Derecha: Resumen Financiero -->
						<div
							class="flex flex-col justify-center space-y-3 rounded-lg border bg-muted/30 p-4"
						>
							<div class="flex items-baseline justify-between">
								<span class="text-muted-foreground">Subtotal</span>
								<span class="font-mono text-lg font-semibold">{{
									formatCurrency(ordenCompra.subtotal, ordenCompra.moneda)
								}}</span>
							</div>
							<div class="flex items-baseline justify-between">
								<span class="text-muted-foreground">Impuestos</span>
								<span class="font-mono text-lg font-semibold">{{
									formatCurrency(ordenCompra.impuestos, ordenCompra.moneda)
								}}</span>
							</div>
							<Separator />
							<div class="flex items-baseline justify-between">
								<span class="text-xl font-bold">Importe Total</span>
								<span class="font-mono text-3xl font-bold text-primary">{{
									formatCurrency(ordenCompra.importe, ordenCompra.moneda)
								}}</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<!-- Sección 2: Datos de la Sociedad -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<Landmark class="h-5 w-5 text-primary" />
							Datos de la Sociedad
						</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-2 text-muted-foreground">
								<Factory class="h-4 w-4" /> Sociedad
							</span>
							<span class="text-right font-semibold">{{ sociedad.id }}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-2 text-muted-foreground">
								<FileKey class="h-4 w-4" /> RFC
							</span>
							<span class="font-mono text-sm">{{ sociedad.rfc }}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-2 text-muted-foreground">
								<MapPin class="h-4 w-4" /> Dirección
							</span>
							<span class="text-right text-sm">
								{{ sociedad.calle }}, {{ sociedad.municipio }}, CP
								{{ sociedad.codigoPostal }}
							</span>
						</div>
					</CardContent>
				</Card>

				<!-- Sección 3: Datos del Proveedor (CON UBICACIÓN COMPLETA) -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<Building class="h-5 w-5 text-primary" />
							Datos del Proveedor
						</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-2 text-muted-foreground">
								<User class="h-4 w-4" /> Proveedor
							</span>
							<span class="text-right font-semibold">{{ proveedor.nombre }}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-2 text-muted-foreground">
								<FileKey class="h-4 w-4" /> RFC
							</span>
							<span class="font-mono text-sm">{{ proveedor.rfc }}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-2 text-muted-foreground">
								<MapPin class="h-4 w-4" /> Dirección
							</span>
							<span class="text-right text-sm">
								{{ proveedor.calle }} {{ proveedor.numeroExterior }},
								{{ proveedor.municipio }}
							</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-2 text-muted-foreground">
								<Globe class="h-4 w-4" /> Ubicación
							</span>
							<span class="text-right text-sm">
								{{ proveedor.ciudad }}, {{ proveedor.estado }}, CP
								{{ proveedor.codigoPostal }}, {{ proveedor.pais }}
							</span>
						</div>
					</CardContent>
				</Card>
			</div>

			<!-- Sección 5: Posiciones del Pedido (Desplegable) -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<ListOrdered class="h-5 w-5 text-primary" />
						Posiciones del Pedido
					</CardTitle>
				</CardHeader>
				<CardContent class="p-0">
					<div class="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead class="w-[50px]"></TableHead>
									<TableHead>Pos.</TableHead>
									<TableHead>Material</TableHead>
									<TableHead class="text-right">Cantidad</TableHead>
									<TableHead class="text-right">Precio Unitario</TableHead>
									<TableHead class="text-right">Importe</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<template v-for="pos in posicionesPedido" :key="pos.posicion">
									<TableRow
										class="cursor-pointer"
										@click="togglePosition(pos.posicion)"
									>
										<TableCell>
											<Button variant="ghost" size="sm">
												<ChevronDown
													class="h-4 w-4 transition-transform"
													:class="
														isPositionExpanded(pos.posicion)
															? 'rotate-180'
															: ''
													"
												/>
											</Button>
										</TableCell>
										<TableCell class="font-medium">{{
											pos.posicion
										}}</TableCell>
										<TableCell>{{ pos.material }}</TableCell>
										<TableCell class="text-right"
											>{{ pos.cantidad }} {{ pos.um }}</TableCell
										>
										<TableCell class="text-right font-mono">{{
											formatCurrency(pos.precioUnitario, ordenCompra.moneda)
										}}</TableCell>
										<TableCell class="text-right font-mono font-semibold">{{
											formatCurrency(pos.importe, ordenCompra.moneda)
										}}</TableCell>
									</TableRow>
									<!-- Fila desplegable -->
									<TableRow v-if="isPositionExpanded(pos.posicion)">
										<TableCell colspan="6" class="p-0">
											<div
												class="grid grid-cols-2 gap-4 bg-muted/50 p-4 md:grid-cols-3"
											>
												<div class="flex flex-col gap-1">
													<span class="text-xs text-muted-foreground"
														>No. Material</span
													>
													<span class="font-mono text-sm">{{
														pos.numeroMaterial
													}}</span>
												</div>
												<div class="flex flex-col gap-1">
													<span class="text-xs text-muted-foreground"
														>Texto Material</span
													>
													<span class="text-sm">{{
														pos.textoMaterial
													}}</span>
												</div>
												<div class="flex flex-col gap-1">
													<span class="text-xs text-muted-foreground"
														>No. Proveedor</span
													>
													<span class="font-mono text-sm">{{
														pos.numeroProveedor
													}}</span>
												</div>
												<div class="flex flex-col gap-1">
													<span class="text-xs text-muted-foreground"
														>Centro</span
													>
													<span class="text-sm">{{ pos.centro }}</span>
												</div>
												<div class="flex flex-col gap-1">
													<span class="text-xs text-muted-foreground"
														>Almacén</span
													>
													<span class="text-sm">{{ pos.almacen }}</span>
												</div>
												<div class="flex flex-col gap-1">
													<span class="text-xs text-muted-foreground"
														>Fecha Entrega</span
													>
													<span class="text-sm">{{
														formatDate(pos.fechaEntrega)
													}}</span>
												</div>
											</div>
										</TableCell>
									</TableRow>
								</template>
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			<!-- Sección 4: Entradas de Mercancía -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<PackageCheck class="h-5 w-5 text-primary" />
						Entradas de Mercancía
					</CardTitle>
				</CardHeader>
				<CardContent class="p-0">
					<div class="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Doc. Material</TableHead>
									<TableHead>Pos.</TableHead>
									<TableHead>Descripción</TableHead>
									<TableHead class="text-right">Cantidad</TableHead>
									<TableHead class="text-right">Importe</TableHead>
									<TableHead class="text-center">Impuesto</TableHead>
									<TableHead class="text-right">Retenciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<TableRow v-for="em in entradasMercancia" :key="em.docMaterial">
									<TableCell class="font-mono text-xs"
										>{{ em.docMaterial }}/{{ em.ejercicio }}</TableCell
									>
									<TableCell class="text-center"
										>{{ em.posicionEM }}/{{ em.posicionOC }}</TableCell
									>
									<TableCell>{{ em.descripcion }}</TableCell>
									<TableCell class="text-right"
										>{{ em.cantidad }} {{ em.um }}</TableCell
									>
									<TableCell class="text-right font-mono">{{
										formatCurrency(em.importe, ordenCompra.moneda)
									}}</TableCell>
									<TableCell class="text-center"
										>{{ em.indImpuesto }} ({{ em.porcImpuesto }}%)</TableCell
									>
									<TableCell class="text-right font-mono">{{
										formatCurrency(em.retenciones, ordenCompra.moneda)
									}}</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</template>
