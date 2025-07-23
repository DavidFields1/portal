<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, type FunctionalComponent } from 'vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'vue-sonner'
import {
	UploadCloud,
	CheckCircle,
	FileText,
	Users,
	X,
	ChevronsUpDown,
	Check,
	ClipboardList,
	FileCode,
} from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import { useLayoutStore } from '@/stores/layoutStore'
import InvoiceUploadStepper from '@/components/layout/InvoiceUploadStepper.vue'
// import Label from "@/components/ui/label/Label.vue";
import Input from '@/components/ui/input/Input.vue'
import Select from '@/components/ui/select/Select.vue'
import SelectTrigger from '@/components/ui/select/SelectTrigger.vue'
import SelectValue from '@/components/ui/select/SelectValue.vue'
import SelectContent from '@/components/ui/select/SelectContent.vue'
import SelectItem from '@/components/ui/select/SelectItem.vue'

// --- Estructuras de Datos Enriquecidas ---
interface GoodsReceipt {
	id: string
	number: string
	material: string
	iva: number
	date: string
	amount: number
	itemCount: number
	status: 'Pendiente de Factura' | 'Facturado'
	poNumber: string
}

interface PurchaseOrder {
	id: string
	number: string
	supplier: string
	supplierId: string
	supplierRfc: string // NUEVO
	date: string
	totalAmount: number
	status: 'Abierta' | 'Cerrada Parcialmente' | 'Cerrada'
	goodsReceipts: GoodsReceipt[]
}

// --- Datos Simulados Enriquecidos (MÁS DATOS) ---
const purchaseOrders = ref<PurchaseOrder[]>([
	// Proveedor A Tech
	{
		id: 'po_001',
		number: 'OC-2024-055',
		supplier: 'Proveedor A Tech',
		supplierId: 'supp_A',
		supplierRfc: 'ATE123456XYZ',
		date: '2024-05-01',
		totalAmount: 850.25,
		status: 'Cerrada Parcialmente',
		goodsReceipts: [
			{
				id: 'gr_101',
				number: 'EM-101A',
				material: 'Laptop Pro 15"',
				iva: 80.04,
				date: '2024-05-10',
				amount: 500.25,
				itemCount: 5,
				status: 'Pendiente de Factura',
				poNumber: 'OC-2024-055',
			},
			{
				id: 'gr_102',
				number: 'EM-102A',
				material: 'Mouse Inalámbrico',
				iva: 56.0,
				date: '2024-05-12',
				amount: 350.0,
				itemCount: 1,
				status: 'Facturado',
				poNumber: 'OC-2024-055',
			},
		],
	},
	{
		id: 'po_003',
		number: 'OC-2024-059',
		supplier: 'Proveedor A Tech',
		supplierId: 'supp_A',
		supplierRfc: 'ATE123456XYZ',
		date: '2024-05-05',
		totalAmount: 1102.5,
		status: 'Abierta',
		goodsReceipts: [
			{
				id: 'gr_301',
				number: 'EM-301A',
				material: 'Monitor 4K',
				iva: 96.4,
				date: '2024-05-14',
				amount: 602.5,
				itemCount: 10,
				status: 'Pendiente de Factura',
				poNumber: 'OC-2024-059',
			},
			{
				id: 'gr_302',
				number: 'EM-302A',
				material: 'Teclado Mecánico',
				iva: 80.0,
				date: '2024-05-15',
				amount: 500.0,
				itemCount: 8,
				status: 'Pendiente de Factura',
				poNumber: 'OC-2024-059',
			},
		],
	},
	// Proveedor B Industrial
	{
		id: 'po_002',
		number: 'OC-2024-058',
		supplier: 'Proveedor B Industrial',
		supplierId: 'supp_B',
		supplierRfc: 'BIN456789ABC',
		date: '2024-05-03',
		totalAmount: 1200.0,
		status: 'Abierta',
		goodsReceipts: [
			{
				id: 'gr_201',
				number: 'EM-201B',
				material: 'Torno CNC',
				iva: 192.0,
				date: '2024-05-11',
				amount: 1200.0,
				itemCount: 1,
				status: 'Pendiente de Factura',
				poNumber: 'OC-2024-058',
			},
		],
	},
	// Proveedor C Oficina
	{
		id: 'po_004',
		number: 'OC-2024-060',
		supplier: 'Proveedor C Oficina',
		supplierId: 'supp_C',
		supplierRfc: 'COF789123DEF',
		date: '2024-05-06',
		totalAmount: 300.0,
		status: 'Cerrada',
		goodsReceipts: [
			{
				id: 'gr_401',
				number: 'EM-401C',
				material: 'Sillas de Oficina',
				iva: 48.0,
				date: '2024-05-16',
				amount: 300.0,
				itemCount: 25,
				status: 'Facturado',
				poNumber: 'OC-2024-060',
			},
		],
	},
	{
		id: 'po_005',
		number: 'OC-2024-061',
		supplier: 'Proveedor C Oficina',
		supplierId: 'supp_C',
		supplierRfc: 'COF789123DEF',
		date: '2024-05-08',
		totalAmount: 150.0,
		status: 'Abierta',
		goodsReceipts: [
			{
				id: 'gr_501',
				number: 'EM-501C',
				material: 'Papel Bond (Caja)',
				iva: 24.0,
				date: '2024-05-18',
				amount: 150.0,
				itemCount: 50,
				status: 'Pendiente de Factura',
				poNumber: 'OC-2024-061',
			},
		],
	},
	// Proveedor D Logística
	{
		id: 'po_006',
		number: 'OC-2024-062',
		supplier: 'Proveedor D Logística',
		supplierId: 'supp_D',
		supplierRfc: 'DLO012345GHI',
		date: '2024-05-10',
		totalAmount: 2500.0,
		status: 'Abierta',
		goodsReceipts: [
			{
				id: 'gr_601',
				number: 'EM-601D',
				material: 'Servicio de Flete Nacional',
				iva: 400.0,
				date: '2024-05-20',
				amount: 2500.0,
				itemCount: 1,
				status: 'Pendiente de Factura',
				poNumber: 'OC-2024-062',
			},
		],
	},
])

export interface Step {
	id: string
	name: string
	icon: FunctionalComponent<unknown>
}

// --- Estado del Stepper ---
const steps = ref([
	{ id: 'select_supplier', name: 'Seleccionar Proveedor', icon: Users },
	{ id: 'select_gr', name: 'Seleccionar Entradas', icon: CheckCircle },
	{ id: 'upload_invoice', name: 'Subir Factura', icon: UploadCloud },
	{ id: 'invoice_data', name: 'Datos de Factura', icon: ClipboardList },
	{ id: 'confirm', name: 'Confirmar', icon: FileText },
])
const currentStepIndex = ref(0)

// --- Estado de Selección ---
const isSupplierPopoverOpen = ref(false)
const selectedSupplierId = ref<string | null>(null)
const selectedPOId = ref<string | null>(null)
const selectedGRs = ref<GoodsReceipt[]>([])
const currentSupplierName = ref<string | null>(null)

// --- Variables para subida de archivos ---
const selectedPdfFile = ref<File | null>(null)
const selectedXmlFile = ref<File | null>(null)

// --- Lógica Computada ---
const allSuppliers = computed(() => {
	const suppliers = new Map<string, { id: string; name: string; rfc: string }>()
	purchaseOrders.value.forEach((po) => {
		if (!suppliers.has(po.supplierId)) {
			suppliers.set(po.supplierId, {
				id: po.supplierId,
				name: po.supplier,
				rfc: po.supplierRfc,
			})
		}
	})
	return Array.from(suppliers.values())
})

const filteredPurchaseOrders = computed(() => {
	if (!selectedSupplierId.value) return []
	return purchaseOrders.value.filter((po) => po.supplierId === selectedSupplierId.value)
})

const selectedPO = computed(() => purchaseOrders.value.find((po) => po.id === selectedPOId.value))
const totalSelectedAmount = computed(() =>
	selectedGRs.value.reduce((sum, gr) => sum + gr.amount, 0),
)

// --- Métodos ---
const selectSupplier = (supplier: { id: string; name: string; rfc: string }) => {
	selectedSupplierId.value = supplier.id
	currentSupplierName.value = supplier.name
	isSupplierPopoverOpen.value = false
	currentStepIndex.value = 1 // Avanza al siguiente paso
}

const resetSupplierSelection = () => {
	selectedSupplierId.value = null
	currentSupplierName.value = null
	selectedPOId.value = null
	selectedGRs.value = []
	currentStepIndex.value = 0
}

const selectPO = (poId: string) => {
	selectedPOId.value = poId
}

const toggleGRSelection = (gr: GoodsReceipt) => {
	if (gr.status === 'Facturado') {
		toast.info('Esta entrada ya ha sido facturada y no se puede seleccionar.')
		return
	}
	const idx = selectedGRs.value.findIndex((g) => g.id === gr.id)
	if (idx !== -1) {
		selectedGRs.value.splice(idx, 1)
	} else {
		selectedGRs.value.push(gr)
	}
}

const removeSelectedGR = (grId: string) => {
	const idx = selectedGRs.value.findIndex((g) => g.id === grId)
	if (idx !== -1) {
		selectedGRs.value.splice(idx, 1)
	}
}

const handlePdfUpload = (event: Event) => {
	const target = event.target as HTMLInputElement
	const file = target.files?.[0]
	if (file) {
		if (file.size > 10 * 1024 * 1024) {
			toast.error('El archivo es demasiado grande', {
				description: 'Por favor selecciona un archivo menor a 10MB',
			})
			return
		}
		const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
		if (!allowedTypes.includes(file.type)) {
			toast.error('Tipo de archivo no válido', {
				description: 'Solo se permiten archivos PDF, JPG o PNG',
			})
			return
		}
		selectedPdfFile.value = file
		toast.success('Archivo cargado correctamente', {
			description: `${file.name} está listo para procesar`,
		})
	}
}
const handleXmlUpload = (event: Event) => {
	const target = event.target as HTMLInputElement
	const file = target.files?.[0]
	if (file) {
		if (file.size > 10 * 1024 * 1024) {
			toast.error('El archivo es demasiado grande', {
				description: 'Por favor selecciona un archivo menor a 10MB',
			})
			return
		}
		const allowedTypes = ['text/xml']
		if (!allowedTypes.includes(file.type)) {
			toast.error('Tipo de archivo no válido', {
				description: 'Solo se permiten archivos XML',
			})
			return
		}
		selectedXmlFile.value = file
		toast.success('XML cargado correctamente', {
			description: `${file.name} está listo para procesar`,
		})
	}
}

const removePdfFile = () => {
	selectedPdfFile.value = null
	const fileInput = document.getElementById('invoice-upload-pdf') as HTMLInputElement
	if (fileInput) fileInput.value = ''
}
const removeXmlFile = () => {
	selectedXmlFile.value = null
	const fileInput = document.getElementById('invoice-upload-xml') as HTMLInputElement
	if (fileInput) fileInput.value = ''
}

const isSubmitting = ref(false)
const isSelectionLocked = computed(() => currentStepIndex.value > 1)

const fakeApiService = () =>
	new Promise((resolve) => setTimeout(() => resolve({ success: true }), 2000))

const isGRSelected = (grId: string) => selectedGRs.value.some((g) => g.id === grId)

const submitInvoice = async () => {
	if (isSubmitting.value) return
	isSubmitting.value = true
	try {
		await fakeApiService()
		toast.success('Factura cargada exitosamente', {
			description: `Se procesaron ${selectedGRs.value.length} entradas de mercancía.`,
		})
		resetSupplierSelection()
		selectedPdfFile.value = null
		selectedXmlFile.value = null
	} catch (error) {
		console.log(error)
		toast.error('Error al cargar la factura', {
			description: 'Por favor, inténtalo de nuevo más tarde.',
		})
	} finally {
		isSubmitting.value = false
	}
}

const formatCurrency = (amount: number) =>
	new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
const nextStep = () => {
	if (currentStepIndex.value < steps.value.length - 1) currentStepIndex.value++
}
const prevStep = () => {
	if (currentStepIndex.value > 0) currentStepIndex.value--
}

watch(selectedSupplierId, (newVal) => {
	if (!newVal) {
		resetSupplierSelection()
	}
})

const stepperProps = computed(() => ({
	steps: steps.value,
	currentStepIndex: currentStepIndex.value,
	selectedGRs: selectedGRs.value,
	totalSelectedAmount: totalSelectedAmount.value,
	currentSupplierName: currentSupplierName.value,
	selectedPdfFile: selectedPdfFile.value,
	selectedXmlFile: selectedXmlFile.value,
	isSubmitting: isSubmitting.value,
	formatCurrency: formatCurrency,
}))

const layoutStore = useLayoutStore()
// Cuando el componente se monta, mostramos la barra lateral.
onMounted(() => {
	layoutStore.showRightSidebar(InvoiceUploadStepper, stepperProps.value)
})

// Cuando el componente se destruye, la ocultamos. ¡MUY IMPORTANTE!
onUnmounted(() => {
	layoutStore.hideRightSidebar()
})

watch(stepperProps, (newProps) => {
	layoutStore.updateRightSidebarProps(newProps)
})

const invoiceData = ref({
	folio: '',
	moneda: 'MXN', // Valor por defecto
	importe: 0,
	sociedad: '',
})
</script>

<template>
	<Toaster richColors position="top-right" />
	<div class="container mx-auto py-6 md:py-10">
		<h1 class="mb-6 text-2xl font-bold md:text-3xl">Carga de Factura con OC</h1>
		<div class="grid grid-cols-1 lg:grid-cols-10 gap-6">
			<!-- COLUMNA IZQUIERDA: Selección de Proveedor y OC -->
			<div class="lg:col-span-3">
				<Card>
					<!-- Vista de Selección de Proveedor -->
					<template v-if="!selectedSupplierId">
						<CardHeader>
							<CardTitle>Proveedores</CardTitle>
							<CardDescription>Busca y selecciona un proveedor</CardDescription>
						</CardHeader>
						<CardContent>
							<Popover v-model:open="isSupplierPopoverOpen">
								<PopoverTrigger as-child>
									<Button variant="outline" role="combobox" :aria-expanded="isSupplierPopoverOpen"
										class="w-full justify-between">
										{{ currentSupplierName || 'Seleccionar proveedor...' }}
										<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent class="w-[--radix-popover-trigger-width] p-0">
									<Command>
										<CommandInput placeholder="Buscar proveedor..." />
										<CommandList>
											<CommandEmpty>No se encontró el proveedor.</CommandEmpty>
											<CommandGroup>
												<CommandItem v-for="supplier in allSuppliers" :key="supplier.id"
													:value="supplier.name" @select="() => selectSupplier(supplier)"
													class="flex items-center">
													<Check class="mr-2 h-4 w-4" :class="selectedSupplierId === supplier.id
															? 'opacity-100'
															: 'opacity-0'
														" />
													<div class="flex flex-col">
														<span>{{ supplier.name }}</span>
														<span class="text-xs text-muted-foreground">{{ supplier.rfc
															}}</span>
													</div>
												</CommandItem>
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						</CardContent>
					</template>
					<!-- Vista de Selección de OC -->
					<template v-else>
						<CardHeader>
							<div class="flex justify-between items-center">
								<div>
									<CardTitle>Órdenes de Compra</CardTitle>
									<CardDescription>{{ currentSupplierName }}</CardDescription>
								</div>
								<Button variant="outline" size="sm" @click="resetSupplierSelection">Cambiar</Button>
							</div>
						</CardHeader>
						<CardContent class="space-y-2 max-h-[60vh] overflow-y-auto">
							<Button v-for="po in filteredPurchaseOrders" :key="po.id" variant="ghost"
								class="w-full justify-start text-left h-auto flex-col items-start p-3 hover:shadow-sm"
								:class="{
									'bg-accent border-l-4 border-l-primary': selectedPOId === po.id,
								}" @click="selectPO(po.id)">
								<div class="flex w-full justify-between items-center">
									<span class="font-semibold text-sm">{{ po.number }}</span>
									<Badge variant="outline" class="text-xs">{{ po.status }}</Badge>
								</div>
								<div class="flex w-full justify-between text-xs text-muted-foreground mt-1">
									<span>{{ po.date }}</span>
									<span class="font-mono">{{
										formatCurrency(po.totalAmount)
									}}</span>
								</div>
							</Button>
						</CardContent>
					</template>
				</Card>
			</div>

			<!-- COLUMNA CENTRAL: Entradas y Selección -->
			<div class="lg:col-span-4 space-y-4" :class="{ 'opacity-60 pointer-events-none': isSelectionLocked }">
				<Card>
					<CardHeader v-if="selectedPO">
						<CardTitle class="text-lg">Entradas de Mercancía</CardTitle>
						<CardDescription>
							<span class="font-medium">{{ selectedPO.number }}</span> -
							{{ selectedPO.supplier }}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div v-if="!selectedPO" class="text-center py-8 text-muted-foreground">
							<FileText class="h-12 w-12 mx-auto mb-4 opacity-50" />
							<p class="text-lg font-medium">Selecciona una orden de compra</p>
							<p class="text-sm">para ver sus entradas de mercancía</p>
						</div>
						<div v-else-if="selectedPO.goodsReceipts.length > 0" class="space-y-3">
							<div v-for="gr in selectedPO.goodsReceipts" :key="gr.id"
								class="rounded-lg border p-3 transition-all hover:shadow-sm" :class="{
									'opacity-50 cursor-not-allowed': gr.status === 'Facturado',
								}">
								<Label :for="`native-${gr.id}`"
									class="flex items-start space-x-3 w-full cursor-pointer">
									<input type="checkbox" :id="`native-${gr.id}`" :checked="isGRSelected(gr.id)"
										:disabled="gr.status === 'Facturado'"
										class="w-4 h-4 rounded border-input bg-background text-primary accent-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
										@change="toggleGRSelection(gr)" />
									<div class="flex-1 min-w-0">
										<div class="flex justify-between items-start mb-1">
											<span class="font-medium text-sm">{{ gr.number }}</span>
											<span class="font-mono text-sm font-semibold">{{
												formatCurrency(gr.amount)
											}}</span>
										</div>
										<p class="font-bold text-sm text-foreground">
											{{ gr.material }}
										</p>
										<div class="flex justify-between text-xs text-muted-foreground mt-2">
											<span>{{ gr.date }}</span>
											<span>IVA: {{ formatCurrency(gr.iva) }}</span>
										</div>
									</div>
								</Label>
							</div>
						</div>
						<div v-else class="text-center py-6 text-muted-foreground">
							<p>Esta orden no tiene entradas de mercancía</p>
						</div>
					</CardContent>
				</Card>

				<Card v-if="selectedGRs.length > 0">
					<CardHeader>
						<CardTitle class="text-lg flex items-center justify-between">
							<span>Selección Actual</span>
							<Badge variant="secondary">{{ selectedGRs.length }} entrada(s)</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="space-y-2 mb-4">
							<div v-for="gr in selectedGRs" :key="gr.id"
								class="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted/50">
								<div class="flex-1 min-w-0">
									<p class="font-medium truncate">
										{{ gr.number }} - {{ gr.material }}
									</p>
									<p class="font-mono text-xs text-muted-foreground">
										{{ formatCurrency(gr.amount) }}
									</p>
								</div>
								<Button variant="ghost" size="icon" class="h-7 w-7 shrink-0"
									@click="removeSelectedGR(gr.id)">
									<X class="h-4 w-4" />
								</Button>
							</div>
						</div>
						<Separator class="my-3" />
						<div class="flex justify-between items-center font-semibold">
							<span>Total Seleccionado:</span>
							<span class="text-lg">{{ formatCurrency(totalSelectedAmount) }}</span>
						</div>
					</CardContent>
				</Card>
			</div>

			<!-- COLUMNA DERECHA: Stepper -->
			<div class="lg:col-span-3">
				<Card>
					<CardHeader>
						<CardTitle>Proceso de Carga</CardTitle>
						<nav aria-label="Progreso de carga" class="mt-4">
							<ol class="space-y-4">
								<li v-for="(step, index) in steps" :key="step.id" class="flex items-center text-sm">
									<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full mr-3"
										:class="{
											'bg-primary text-primary-foreground':
												index === currentStepIndex,
											'bg-green-600 text-white': index < currentStepIndex,
											'bg-muted text-muted-foreground border':
												index > currentStepIndex,
										}">
										<component v-if="index < currentStepIndex" :is="CheckCircle" class="h-4 w-4" />
										<component v-else :is="step.icon" class="h-4 w-4" />
									</span>
									<span class="font-medium" :class="{
										'text-primary': index === currentStepIndex,
										'text-green-700': index < currentStepIndex,
										'text-muted-foreground': index > currentStepIndex,
									}">
										{{ step.name }}
									</span>
								</li>
							</ol>
						</nav>
					</CardHeader>
					<Separator />
					<CardContent class="mt-4">
						<!-- Paso 0 y 1: Seleccionar Proveedor y Entradas -->
						<div v-if="currentStepIndex === 0" class="text-center text-muted-foreground py-4">
							<p class="text-sm">Selecciona un proveedor para comenzar.</p>
						</div>

						<!-- Paso 1: Seleccionar Entradas (CORREGIDO) -->
						<div v-if="currentStepIndex === 1" class="space-y-4">
							<div v-if="selectedGRs.length === 0" class="text-center text-muted-foreground py-4">
								<p class="text-sm">
									Selecciona una o más entradas de mercancía para continuar.
								</p>
							</div>
							<div v-else class="space-y-4">
								<div class="text-center">
									<div class="text-2xl font-bold text-primary">
										{{ selectedGRs.length }}
									</div>
									<div class="text-xs text-muted-foreground">
										entrada(s) seleccionada(s)
									</div>
								</div>
								<Button size="sm" class="w-full" @click="nextStep">Continuar →</Button>
							</div>
						</div>
						<!-- Paso 2: Subir Factura -->
						<div v-if="currentStepIndex === 2" class="space-y-4">
							<h4 class="font-semibold">Subir Factura</h4>
							<div class="text-sm text-muted-foreground space-y-2">
								<p>
									Total:
									<span class="font-bold text-foreground">{{
										formatCurrency(totalSelectedAmount)
									}}</span>
								</p>
								<p>
									Proveedor:
									<span class="font-medium text-foreground">{{
										currentSupplierName
									}}</span>
								</p>
							</div>
							<div
								class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
								<input type="file" id="invoice-upload-pdf" accept=".pdf" class="sr-only"
									@change="handlePdfUpload" />
								<label for="invoice-upload-pdf" class="cursor-pointer">
									<FileText class="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
									<p class="text-sm font-medium mb-1">
										Haz clic para subir la factura (PDF)
									</p>
									<p class="text-xs text-muted-foreground">PDF hasta 10MB</p>
								</label>
							</div>
							<div
								class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
								<input type="file" id="invoice-upload-xml" accept=".xml" class="sr-only"
									@change="handleXmlUpload" />
								<label for="invoice-upload-xml" class="cursor-pointer">
									<FileCode class="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
									<p class="text-sm font-medium mb-1">
										Haz clic para subir la factura (XML)
									</p>
									<p class="text-xs text-muted-foreground">XML hasta 10MB</p>
								</label>
							</div>
							<div v-if="selectedPdfFile"
								class="flex items-center justify-between p-3 bg-muted rounded-lg">
								<div class="flex items-center space-x-2">
									<FileText class="h-4 w-4 text-muted-foreground" />
									<span class="text-sm font-medium">{{
										selectedPdfFile.name
									}}</span>
									<Badge variant="secondary" class="text-xs">{{ (selectedPdfFile.size / 1024 /
										1024).toFixed(1) }}
										MB
									</Badge>
								</div>
								<Button variant="ghost" size="sm" @click="removePdfFile">✕</Button>
							</div>
							<div v-if="selectedXmlFile"
								class="flex items-center justify-between p-3 bg-muted rounded-lg">
								<div class="flex items-center space-x-2">
									<FileText class="h-4 w-4 text-muted-foreground" />
									<span class="text-sm font-medium">{{
										selectedXmlFile.name
									}}</span>
									<Badge variant="secondary" class="text-xs">{{ (selectedXmlFile.size / 1024 /
										1024).toFixed(1) }}
										MB
									</Badge>
								</div>
								<Button variant="ghost" size="sm" @click="removeXmlFile">✕</Button>
							</div>
							<div class="flex space-x-2 pt-4">
								<Button variant="outline" size="sm" class="flex-1" @click="prevStep">← Volver</Button>
								<Button size="sm" class="flex-1" :disabled="!selectedPdfFile || !selectedXmlFile"
									@click="nextStep">Continuar →</Button>
							</div>
						</div>
						<!-- Paso 3: Datos de Factura -->
						<div v-if="currentStepIndex === 3" class="space-y-4">
							<h4 class="font-semibold">Datos de Factura</h4>
							<div class="space-y-3">
								<div class="space-y-1">
									<Label for="folio">Folio</Label>
									<Input id="folio" type="text" v-model="invoiceData.folio"
										placeholder="Ej: F-12345" />
								</div>
								<div class="space-y-1">
									<Label for="moneda">Moneda</Label>
									<Select v-model="invoiceData.moneda">
										<SelectTrigger id="moneda">
											<SelectValue placeholder="Selecciona una moneda" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
											<SelectItem value="USD">USD - Dólar Americano</SelectItem>
											<SelectItem value="EUR">EUR - Euro</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div class="space-y-1">
									<Label for="importe">Importe Total</Label>
									<Input id="importe" type="number" v-model="invoiceData.importe"
										placeholder="Ej: 1160.00" />
								</div>
								<div class="space-y-1">
									<Label for="sociedad">Sociedad</Label>
									<Input id="sociedad" v-model="invoiceData.sociedad" placeholder="Ej: 1000" />
								</div>
							</div>
							<div class="flex space-x-2 pt-4">
								<Button variant="outline" size="sm" class="flex-1" @click="prevStep">← Volver</Button>
								<Button size="sm" class="flex-1" :disabled="!invoiceData.folio || !invoiceData.importe"
									@click="nextStep">Continuar →</Button>
							</div>
						</div>
						<!-- Paso 4: Confirmar -->
						<div v-if="currentStepIndex === 4" class="space-y-4">
							<h4 class="font-semibold">Confirmación Final</h4>
							<div class="space-y-3 text-sm">
								<div class="flex justify-between">
									<span class="text-muted-foreground">Proveedor:</span>
									<span class="font-medium">{{ currentSupplierName }}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted-foreground">Entradas:</span>
									<span class="font-medium">{{ selectedGRs.length }}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted-foreground">Total Seleccionado:</span>
									<span class="font-semibold">{{
										formatCurrency(totalSelectedAmount)
									}}</span>
								</div>
								<Separator />
								<div class="flex justify-between">
									<span class="text-muted-foreground">Archivo PDF:</span>
									<span class="font-medium">{{ selectedPdfFile?.name }}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted-foreground">Archivo XML:</span>
									<span class="font-medium">{{ selectedXmlFile?.name }}</span>
								</div>
								<Separator />
								<div class="flex justify-between">
									<span class="text-muted-foreground">Folio:</span>
									<span class="font-medium">{{ invoiceData.folio }}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted-foreground">Moneda:</span>
									<span class="font-medium">{{ invoiceData.moneda }}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted-foreground">Importe:</span>
									<span class="font-semibold">{{
										formatCurrency(invoiceData.importe || 0)
									}}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted-foreground">Sociedad:</span>
									<span class="font-medium">{{ invoiceData.sociedad }}</span>
								</div>
							</div>
							<div class="flex space-x-2 pt-4">
								<Button variant="outline" size="sm" class="flex-1" @click="prevStep"
									:disabled="isSubmitting">
									← Volver
								</Button>
								<Button size="sm" class="flex-1" @click="submitInvoice" :disabled="isSubmitting">
									<svg v-if="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
										xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
											stroke-width="4">
										</circle>
										<path class="opacity-75" fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
										</path>
									</svg>
									<span v-if="isSubmitting">Procesando...</span>
									<span v-else>Confirmar Carga</span>
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
</template>
