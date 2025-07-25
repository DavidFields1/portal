import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { toast } from 'vue-sonner'
import {
	type GoodsReceipt,
	type Step,
	type InvoiceData,
	GoodsReceiptSchema,
	PurchaseOrderSchema,
	InvoiceDataSchema,
} from '@/schemas/invoiceSchemas'
import { UploadCloud, CheckCircle, FileText, Users, ClipboardList } from 'lucide-vue-next'
// import { SupplierSchema } from '@/schemas/invoiceSchemas'
// import type { Provider } from '@/schemas/providerSchema'
import { useProvidersQuery } from '@/composables/useProviders'
import { ProviderSchema, type Provider } from '@/schemas/providerSchema'
import type { PurchaseOrder } from '@/schemas/purchaseOrder'
import { useOrdenesCompraSAPQuery } from '@/composables/useCatalogoSAP'

export const usePOInvoiceStore = defineStore('po-invoice', () => {
	// Estado

	const steps = ref<Step[]>([
		{ id: 'select_supplier', name: 'Seleccionar Proveedor', icon: Users },
		{ id: 'select_gr', name: 'Seleccionar Entradas', icon: CheckCircle },
		{ id: 'upload_invoice', name: 'Subir Factura', icon: UploadCloud },
		{ id: 'invoice_data', name: 'Datos de Factura', icon: ClipboardList },
		{ id: 'confirm', name: 'Confirmar', icon: FileText },
	])

	const currentStepIndex = ref(0)
	const selectedSupplierId = ref<number | null>(null)
	const selectedPOId = ref<string | null>(null)
	const selectedGRs = ref<GoodsReceipt[]>([] as GoodsReceipt[])
	const currentSupplierName = ref<string | null>(null)
	const selectedPdfFile = ref<File | null>(null)
	const selectedXmlFile = ref<File | null>(null)
	const isSubmitting = ref(false)

	const invoiceData = ref<InvoiceData>({
		folio: '',
		moneda: 'MXN',
		importe: 0,
		sociedad: '',
	})

	// Getters computados
	// const allSuppliers = computed<Provider[]>(() => {
	// 	const suppliers = new Map<string, Supplier>()
	// 	purchaseOrders.value.forEach((po: PurchaseOrder) => {
	// 		if (!suppliers.has(po.supplierId)) {
	// 			suppliers.set(po.supplierId, {
	// 				id: po.supplierId,
	// 				name: po.supplier,
	// 				rfc: po.supplierRfc,
	// 			})
	// 		}
	// 	})
	const providersQuery = useProvidersQuery()
	const allProviders = computed<Provider[]>(() => {
		return providersQuery.data.value?.object.content ?? []
	})

	const selectedSupplierRfc = ref<string>('')

	// const purchaseOrders = ref<PurchaseOrder[]>([])

	const filteredPurchaseOrders = computed<PurchaseOrder[]>(() => {
		if (selectedSupplierId.value === null) return []
		return purchaseOrders.value.filter(
			(po: PurchaseOrder) => Number(po.NoProveedor) === selectedSupplierId.value,
		)
	})

	const selectedPO = computed<PurchaseOrder | undefined>(() =>
		purchaseOrders.value.find((po: PurchaseOrder) => po.NoProveedor === selectedPOId.value),
	)

	const totalSelectedAmount = computed<number>(() =>
		selectedGRs.value.reduce((sum: number, gr: GoodsReceipt) => sum + gr.amount, 0),
	)

	const isSelectionLocked = computed<boolean>(() => currentStepIndex.value > 1)

	const canProceedToStep2 = computed<boolean>(() => selectedGRs.value.length > 0)

	const canProceedToStep3 = computed<boolean>(
		() => selectedPdfFile.value !== null && selectedXmlFile.value !== null,
	)

	const canProceedToStep4 = computed<boolean>(() => {
		try {
			InvoiceDataSchema.parse(invoiceData.value)
			return true
		} catch {
			return false
		}
	})

	const validationErrors = computed(() => {
		try {
			InvoiceDataSchema.parse(invoiceData.value)
			return {}
		} catch (error: unknown) {
			// @ts-expect-error asf
			if (error.errors) {
				// @ts-expect-error asf
				return error.errors.reduce((acc: unknown, err: unknown) => {
					// @ts-expect-error asf
					acc[err.path[0]] = err.message
					return acc
				}, {})
			}
			return {}
		}
	})
	console.log('Component Setup: Calling useOrdenesCompraSAPQuery')
	const purchaseOrdersQuery = useOrdenesCompraSAPQuery(
		// Le pasamos los refs directamente
		selectedSupplierId,
		selectedSupplierRfc,
		// Y le pasamos la opción 'enabled' para controlar cuándo se ejecuta
		{
			enabled: computed(() => {
				const isEnabled = !!selectedSupplierId.value && !!selectedSupplierRfc.value
				// LOG: Estado de 'enabled'
				console.log(
					`Enabled computed: ${isEnabled} (id: ${selectedSupplierId.value}, rfc: ${selectedSupplierRfc.value})`,
				)
				return isEnabled
			}),
		},
	)
	const purchaseOrders = computed(() => purchaseOrdersQuery.data.value?.object.content || [])

	watch(purchaseOrdersQuery.isFetching, (newVal) => {
		if (newVal) {
			console.log('Query State: isFetching changed to TRUE')
		} else {
			console.log('Query State: isFetching changed to FALSE')
		}
	})
	watch([selectedSupplierId, selectedSupplierRfc], ([newId, newRfc], [oldId, oldRfc]) => {
		console.log(
			`Selected Supplier Refs changed: ID from ${oldId} to ${newId}, RFC from ${oldRfc} to ${newRfc}`,
		)
	})

	// Actions
	const selectSupplier = (provider: Provider) => {
		console.log('selectSupplier function called')
		try {
			const validatedSupplier = ProviderSchema.parse(provider)
			console.log(
				`selectSupplier: Setting ID to ${validatedSupplier.id_proveedor}, RFC to ${validatedSupplier.rfc}`,
			)

			selectedSupplierId.value = validatedSupplier.id_proveedor
			selectedSupplierRfc.value = validatedSupplier.rfc
			currentSupplierName.value = validatedSupplier.nombre_razon_social

			console.log('selectSupplier: Refs updated.')

			currentStepIndex.value = 1
			toast.success(`Proveedor seleccionado: ${validatedSupplier.nombre_razon_social}`)
		} catch (error) {
			toast.error('Error al seleccionar proveedor')
			console.error('Invalid supplier data:', error)
		}
	}

	const resetSupplierSelection = () => {
		selectedSupplierId.value = null
		currentSupplierName.value = null
		selectedPOId.value = null
		selectedGRs.value = []
		currentStepIndex.value = 0
		toast.info('Selección reiniciada')
	}

	const selectPO = (poId: string) => {
		const po = purchaseOrders.value.find((p: PurchaseOrder) => p.NoProveedor === poId)
		if (!po) {
			toast.error('Orden de compra no encontrada')
			return
		}

		try {
			PurchaseOrderSchema.parse(po)
			selectedPOId.value = poId
			toast.success(`Orden seleccionada: ${po.DocumentoCompras}`)
		} catch (error) {
			toast.error('Datos de orden de compra inválidos')
			console.error('Invalid PO data:', error)
		}
	}

	const toggleGRSelection = (gr: GoodsReceipt) => {
		if (gr.status === 'Facturado') {
			toast.info('Esta entrada ya ha sido facturada y no se puede seleccionar.')
			return
		}

		try {
			const validatedGR = GoodsReceiptSchema.parse(gr)
			const idx = selectedGRs.value.findIndex((g: GoodsReceipt) => g.id === validatedGR.id)

			if (idx !== -1) {
				selectedGRs.value.splice(idx, 1)
				toast.info(`Entrada ${validatedGR.number} removida`)
			} else {
				selectedGRs.value.push(validatedGR)
				toast.success(`Entrada ${validatedGR.number} agregada`)
			}
		} catch (error) {
			toast.error('Datos de entrada de mercancía inválidos')
			console.error('Invalid GR data:', error)
		}
	}

	const removeSelectedGR = (grId: string) => {
		const idx = selectedGRs.value.findIndex((g: GoodsReceipt) => g.id === grId)
		if (idx !== -1) {
			const removedGR = selectedGRs.value.splice(idx, 1)[0]
			toast.info(`Entrada ${removedGR.number} removida de la selección`)
		}
	}

	const isGRSelected = (grId: string): boolean =>
		selectedGRs.value.some((g: GoodsReceipt) => g.id === grId)

	const handleFileUpload = (files: { pdf?: File; xml?: File }) => {
		if (files.pdf) {
			if (files.pdf.size > 10 * 1024 * 1024) {
				toast.error('El archivo PDF es demasiado grande', {
					description: 'Por favor selecciona un archivo menor a 10MB',
				})
				return
			}

			const allowedPdfTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
			if (!allowedPdfTypes.includes(files.pdf.type)) {
				toast.error('Tipo de archivo PDF no válido', {
					description: 'Solo se permiten archivos PDF, JPG o PNG',
				})
				return
			}

			selectedPdfFile.value = files.pdf
			toast.success('Archivo PDF cargado correctamente', {
				description: `${files.pdf.name} está listo para procesar`,
			})
		}

		if (files.xml) {
			if (files.xml.size > 10 * 1024 * 1024) {
				toast.error('El archivo XML es demasiado grande', {
					description: 'Por favor selecciona un archivo menor a 10MB',
				})
				return
			}

			const allowedXmlTypes = ['text/xml', 'application/xml']
			if (!allowedXmlTypes.includes(files.xml.type)) {
				toast.error('Tipo de archivo XML no válido', {
					description: 'Solo se permiten archivos XML',
				})
				return
			}

			selectedXmlFile.value = files.xml
			toast.success('XML cargado correctamente', {
				description: `${files.xml.name} está listo para procesar`,
			})
		}
	}

	const removeFile = (type: 'pdf' | 'xml') => {
		if (type === 'pdf') {
			selectedPdfFile.value = null
			const fileInput = document.getElementById('invoice-upload-pdf') as HTMLInputElement
			if (fileInput) fileInput.value = ''
			toast.info('Archivo PDF removido')
		} else {
			selectedXmlFile.value = null
			const fileInput = document.getElementById('invoice-upload-xml') as HTMLInputElement
			if (fileInput) fileInput.value = ''
			toast.info('Archivo XML removido')
		}
	}

	const updateInvoiceData = (data: Partial<InvoiceData>) => {
		invoiceData.value = { ...invoiceData.value, ...data }
	}

	const nextStep = () => {
		// Validaciones antes de avanzar
		if (currentStepIndex.value === 1 && !canProceedToStep2.value) {
			toast.error('Selecciona al menos una entrada de mercancía')
			return
		}

		if (currentStepIndex.value === 2 && !canProceedToStep3.value) {
			toast.error('Sube tanto el archivo PDF como el XML')
			return
		}

		if (currentStepIndex.value === 3 && !canProceedToStep4.value) {
			toast.error('Completa todos los datos requeridos de la factura')
			return
		}

		if (currentStepIndex.value < steps.value.length - 1) {
			currentStepIndex.value++
		}
	}

	const prevStep = () => {
		if (currentStepIndex.value > 0) {
			currentStepIndex.value--
		}
	}

	const submitInvoice = async () => {
		if (isSubmitting.value) return

		try {
			// Validar datos finales
			InvoiceDataSchema.parse(invoiceData.value)

			if (!canProceedToStep3.value) {
				throw new Error('Archivos faltantes')
			}

			if (selectedGRs.value.length === 0) {
				throw new Error('No hay entradas seleccionadas')
			}

			isSubmitting.value = true

			// Simular API call
			await new Promise((resolve) => setTimeout(resolve, 2000))

			toast.success('Factura cargada exitosamente', {
				description: `Se procesaron ${selectedGRs.value.length} entradas de mercancía.`,
			})

			// Reset del estado
			resetInvoiceProcess()
		} catch (error: unknown) {
			console.error('Error submitting invoice:', error)
			toast.error('Error al cargar la factura', {
				// @ts-expect-error asf
				description: error.message || 'Por favor, inténtalo de nuevo más tarde.',
			})
		} finally {
			isSubmitting.value = false
		}
	}

	const resetInvoiceProcess = () => {
		selectedSupplierId.value = null
		currentSupplierName.value = null
		selectedPOId.value = null
		selectedGRs.value = []
		selectedPdfFile.value = null
		selectedXmlFile.value = null
		currentStepIndex.value = 0
		invoiceData.value = {
			folio: '',
			moneda: 'MXN',
			importe: 0,
			sociedad: '',
		}
	}

	const formatCurrency = (amount: number): string =>
		new Intl.NumberFormat('es-ES', {
			style: 'currency',
			currency: 'EUR',
		}).format(amount)

	return {
		// Estado
		purchaseOrders,
		steps,
		currentStepIndex,
		selectedSupplierId,
		selectedPOId,
		selectedGRs,
		currentSupplierName,
		selectedPdfFile,
		selectedXmlFile,
		invoiceData,
		isSubmitting,

		allProviders,
		allProvidersLoading: providersQuery.isPending,

		// Getters
		filteredPurchaseOrders,
		selectedPO,
		totalSelectedAmount,
		isSelectionLocked,
		canProceedToStep2,
		canProceedToStep3,
		canProceedToStep4,
		validationErrors,

		// Actions
		selectSupplier,
		resetSupplierSelection,
		selectPO,
		toggleGRSelection,
		removeSelectedGR,
		isGRSelected,
		handleFileUpload,
		removeFile,
		updateInvoiceData,
		nextStep,
		prevStep,
		submitInvoice,
		resetInvoiceProcess,
		formatCurrency,
	}
})
