import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { toast } from 'vue-sonner';
// import { type Step, type InvoiceData, InvoiceDataSchema } from '@/schemas/invoiceSchemas';
import { UploadCloud, FileText, Users, ClipboardList, ListIcon } from 'lucide-vue-next';
import { useProvidersQuery } from '@/composables/useProviders';
import { ProviderSchema, type Provider } from '@/schemas/providerSchema';
import { PurchaseOrderSchema, type PurchaseOrder } from '@/schemas/purchaseOrder';
import {
	useEntradasMercanciaSAPQuery,
	useOrdenesCompraSAPQuery,
} from '@/composables/useCatalogoSAP';
import { GoodsReceiptSchema, type GoodsReceipt } from '@/schemas/goodReceiptSchema';
import { readFileAsText } from '@/helpers/ReadFilesAsText';
import { convertXMLtoJSON } from '@/helpers/ConvertXmlToJson';
import { mapXmlData } from '@/helpers/MapXmlData';
import { InvoiceDataSchema, type InvoiceData, type Step } from '@/schemas/invoiceSchemas';
import axiosInstance from '@/config/axiosInstance';
import { ValidateRfcResponseSchema, type ValidateRfcResponse } from '@/schemas/validateRfc';
import { queryClient } from '@/main';

export const usePOInvoiceStore = defineStore('po-invoice', () => {
	// Estado
	const steps = ref<Step[]>([
		{ id: 'select_supplier', name: 'Seleccionar Proveedor', icon: Users },
		{ id: 'select_gr', name: 'Seleccionar Entradas', icon: ListIcon },
		{ id: 'upload_invoice', name: 'Subir Factura', icon: UploadCloud },
		{ id: 'invoice_data', name: 'Datos de Factura', icon: ClipboardList },
		{ id: 'confirm', name: 'Confirmar', icon: FileText },
	]);

	const currentStepIndex = ref(0);
	const selectedSupplierId = ref<string | null>(null);
	const selectedPOId = ref<string | null>(null);
	const selectedGRs = ref<GoodsReceipt[]>([]);
	const currentSupplierName = ref<string | null>(null);
	const selectedPdfFile = ref<File | null>(null);
	const selectedXmlFile = ref<File | null>(null);
	const isSubmitting = ref(false);

	const invoiceData = ref<InvoiceData>({
		folio: '',
		moneda: 'MXN',
		importe: 0,
		sociedad: '',
	});

	const xmlValidationStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle');
	const xmlValidationError = ref<string | null>(null);

	const providersQuery = useProvidersQuery();
	const allProviders = computed<Provider[]>(() => {
		return providersQuery.data.value?.object.content ?? [];
	});

	const selectedSupplierRfc = ref<string>('');

	const selectedPO = computed<PurchaseOrder | undefined>(() =>
		purchaseOrders.value.find(
			(po: PurchaseOrder) => po.DocumentoCompras === selectedPOId.value,
		),
	);

	const totalSelectedAmount = computed<number>(() =>
		selectedGRs.value.reduce((sum: number, gr: GoodsReceipt) => sum + Number(gr.ImporteMl), 0),
	);

	const isSelectionLocked = computed<boolean>(() => currentStepIndex.value > 1);

	const canProceedToStep2 = computed<boolean>(() => selectedGRs.value.length > 0);

	const canProceedToStep3 = computed<boolean>(
		() => selectedPdfFile.value !== null && selectedXmlFile.value !== null,
	);

	const canProceedToStep4 = computed<boolean>(() => {
		try {
			InvoiceDataSchema.parse(invoiceData.value);
			return true;
		} catch {
			return false;
		}
	});

	const purchaseOrdersQuery = useOrdenesCompraSAPQuery(selectedSupplierId, selectedSupplierRfc, {
		enabled: computed(() => !!selectedSupplierId.value && !!selectedSupplierRfc.value),
	});
	const purchaseOrders = computed(() => purchaseOrdersQuery.data.value?.object || []);

	const selectedPODocumentoCompras = computed<string | null>(
		() => selectedPO.value?.DocumentoCompras ?? null,
	);

	const goodsReceiptsQuery = useEntradasMercanciaSAPQuery(
		selectedSupplierId,
		selectedPODocumentoCompras,
		{
			enabled: computed(() => !!selectedSupplierId.value && !!selectedPO.value),
		},
	);
	const goodsReceipts = computed(() => goodsReceiptsQuery.data.value?.object || []);

	// Actions
	const selectSupplier = (provider: Provider) => {
		try {
			const validatedSupplier = ProviderSchema.parse(provider);

			selectedSupplierId.value = validatedSupplier.id_proveedor_sap;
			selectedSupplierRfc.value = validatedSupplier.rfc;
			currentSupplierName.value = validatedSupplier.nombre_razon_social;

			currentStepIndex.value = 1;
			toast.success(`Proveedor seleccionado: ${validatedSupplier.nombre_razon_social}`);
		} catch (error) {
			console.error('Invalid supplier data:', error);
			toast.error('Error al seleccionar proveedor');
		}
	};

	const resetSupplierSelection = () => {
		selectedSupplierId.value = null;
		currentSupplierName.value = null;
		selectedPOId.value = null;
		selectedGRs.value = [];
		currentStepIndex.value = 0;
		toast.info('Selección reiniciada');
	};

	const selectPO = (docCompras: string) => {
		const po = purchaseOrders.value.find(
			(p: PurchaseOrder) => p.DocumentoCompras === docCompras,
		);
		if (!po) {
			toast.error('Orden de compra no encontrada');
			return;
		}

		try {
			PurchaseOrderSchema.parse(po);
			selectedPOId.value = docCompras;
			toast.success(`Orden seleccionada: ${po.DocumentoCompras}`);
		} catch (error) {
			toast.error('Datos de orden de compra inválidos');
			console.error('Invalid PO data:', error);
		}
	};

	const toggleGRSelection = (gr: GoodsReceipt) => {
		try {
			const validatedGR = GoodsReceiptSchema.parse(gr);
			const idx = selectedGRs.value.findIndex(
				(g: GoodsReceipt) => g.DocMaterial === validatedGR.DocMaterial,
			);

			if (idx !== -1) {
				selectedGRs.value.splice(idx, 1);
				toast.info(`Entrada ${validatedGR.DocMaterial} removida`);
			} else {
				selectedGRs.value.push(validatedGR);
				toast.success(`Entrada ${validatedGR.DocMaterial} agregada`);
			}
		} catch (error) {
			toast.error('Datos de entrada de mercancía inválidos');
			console.error('Invalid GR data:', error);
		}
	};

	const removeSelectedGR = (grDocMaterial: string) => {
		const idx = selectedGRs.value.findIndex(
			(g: GoodsReceipt) => g.DocMaterial === grDocMaterial,
		);
		if (idx !== -1) {
			const removedGR = selectedGRs.value.splice(idx, 1)[0];
			toast.info(`Entrada ${removedGR.DocMaterial} removida de la selección`);
		}
	};

	const isGRSelected = (grDocMaterial: string): boolean =>
		selectedGRs.value.some((g: GoodsReceipt) => g.DocMaterial === grDocMaterial);

	const handleFileUpload = async (files: { pdf?: File; xml?: File }) => {
		if (files.pdf) {
			// Lógica de validación de PDF
			if (files.pdf.size > 10 * 1024 * 1024) {
				return;
			}
			const allowedPdfTypes = ['application/pdf'];
			if (!allowedPdfTypes.includes(files.pdf.type)) {
				return;
			}

			selectedPdfFile.value = files.pdf;
			toast.success('Archivo PDF cargado correctamente');
		}

		if (files.xml) {
			await validateAndProcessXml(files.xml);
			// // Lógica de validación de XML
			// if (files.xml.size > 10 * 1024 * 1024) {
			// 	/* ... */ return;
			// }
			// const allowedXmlTypes = ['text/xml', 'application/xml'];
			// if (!allowedXmlTypes.includes(files.xml.type)) {
			// 	/* ... */ return;
			// }

			// selectedXmlFile.value = files.xml;
			// xmlValidationStatus.value = 'loading';

			// try {
			// 	// --- AQUÍ VA TU LÓGICA DE VALIDACIÓN REAL ---
			// 	// Por ejemplo, una llamada a tu backend para validar el UUID
			// 	console.log('Simulando validación de XML en el backend...');
			// 	await new Promise((resolve) => setTimeout(resolve, 1500));

			// 	// Simula un error para probar
			// 	if (Math.random() < 0.3) {
			// 		throw new Error('El UUID de este XML ya fue registrado.');
			// 	}
			// 	// --- FIN DE LA LÓGICA DE VALIDACIÓN ---

			// 	xmlValidationStatus.value = 'success';
			// 	toast.success('XML validado correctamente');
			// } catch (error: unknown) {
			// 	xmlValidationStatus.value = 'error';
			// 	let errorMessage = 'Ocurrió un error desconocido.';
			// 	if (error instanceof Error) {
			// 		errorMessage = error.message;
			// 	}
			// 	xmlValidationError.value = errorMessage;
			// 	toast.error('Error en la validación del XML', {
			// 		description: xmlValidationError.value || 'Ocurrió un error desconocido',
			// 	});
			// }
		}
	};

	const removeFile = (type: 'pdf' | 'xml') => {
		if (type === 'pdf') {
			selectedPdfFile.value = null;
			toast.info('Archivo PDF removido');
		} else {
			selectedXmlFile.value = null;
			selectedPdfFile.value = null;
			// Reiniciar el estado de validación del XML
			xmlValidationStatus.value = 'idle';
			xmlValidationError.value = null;
			toast.info('Archivo XML y PDF removidos');
		}
	};

	const updateInvoiceData = (data: Partial<InvoiceData>) => {
		invoiceData.value = { ...invoiceData.value, ...data };
	};

	const nextStep = () => {
		// Validaciones antes de avanzar
		if (currentStepIndex.value === 1 && !canProceedToStep2.value) {
			toast.error('Selecciona al menos una entrada de mercancía');
			return;
		}

		if (currentStepIndex.value === 2 && !canProceedToStep3.value) {
			toast.error('Sube tanto el archivo PDF como el XML');
			return;
		}

		if (currentStepIndex.value === 3 && !canProceedToStep4.value) {
			toast.error('Completa todos los datos requeridos de la factura');
			return;
		}

		if (currentStepIndex.value < steps.value.length - 1) {
			currentStepIndex.value++;
		}
	};

	const prevStep = () => {
		if (currentStepIndex.value > 0) {
			currentStepIndex.value--;
		}
	};

	const submitInvoice = async () => {
		if (isSubmitting.value) return;

		try {
			// Validar datos finales
			InvoiceDataSchema.parse(invoiceData.value);

			if (!canProceedToStep3.value) {
				throw new Error('Archivos faltantes');
			}

			if (selectedGRs.value.length === 0) {
				throw new Error('No hay entradas seleccionadas');
			}

			isSubmitting.value = true;

			// Simular API call
			// await new Promise((resolve) => setTimeout(resolve, 2000));

			toast.success('Factura cargada exitosamente', {
				description: `Se procesaron ${selectedGRs.value.length} entradas de mercancía.`,
			});

			// Reset del estado
			resetInvoiceProcess();
		} catch (error: unknown) {
			console.error('Error submitting invoice:', error);
			toast.error('Error al cargar la factura', {
				// @ts-expect-error asf
				description: error.message || 'Por favor, inténtalo de nuevo más tarde.',
			});
		} finally {
			isSubmitting.value = false;
		}
	};

	const resetInvoiceProcess = () => {
		selectedPdfFile.value = null;
		selectedXmlFile.value = null;

		xmlValidationStatus.value = 'idle';
		xmlValidationError.value = null;

		selectedSupplierId.value = null;
		currentSupplierName.value = null;
		selectedPOId.value = null;
		selectedGRs.value = [];
		selectedPdfFile.value = null;
		selectedXmlFile.value = null;
		currentStepIndex.value = 0;
		invoiceData.value = {
			folio: '',
			moneda: 'MXN',
			importe: 0,
			sociedad: '',
		};
	};

	const validateAndProcessXml = async (xmlFile: File) => {
		// 1. Iniciar el estado de carga
		xmlValidationStatus.value = 'loading';
		xmlValidationError.value = null;

		try {
			// 2. Leer y convertir el archivo
			const xmlString = await readFileAsText(xmlFile);
			const xmlObject = convertXMLtoJSON(xmlString);

			// 3. Mapear los datos necesarios del XML
			const extractedData = mapXmlData(xmlObject);

			// 4. Iniciar la CADENA DE VALIDACIÓN
			// Si alguna de estas funciones falla, lanzará un error que será capturado por el `catch`.

			// Validación #1: Tipo de Comprobante
			if (extractedData.tipoDeComprobante !== 'I') {
				throw new Error('El tipo de comprobante debe ser de Ingreso (I).');
			}

			// Validación #2: Moneda
			if (extractedData.moneda !== selectedPO.value?.Moneda) {
				throw new Error('La moneda del XML no coincide con la de la Orden de Compra.');
			}

			// Validación #3: Importes (Subtotal vs Entradas de Mercancía)
			if (extractedData.subtotal !== totalSelectedAmount.value) {
				throw new Error(
					'El subtotal del XML no coincide con la suma de las entradas seleccionadas.',
				);
			}

			// Validación #4: Fecha de Timbrado (mismo mes y año)
			const dateStamped = new Date(extractedData.fechaTimbrado);
			const currentDate = new Date();
			if (
				dateStamped.getMonth() !== currentDate.getMonth() ||
				dateStamped.getFullYear() !== currentDate.getFullYear()
			) {
				throw new Error('La fecha de la factura no corresponde al mes y año actual.');
			}

			// Validación #5: RFC del Receptor (simulando llamada a API)
			// TODO: Reemplazar esto con tu llamada real a la API
			console.log(`Validando RFC Receptor en backend: ${extractedData.rfcReceptor}`);
			const rfcQueryOptions = {
				queryKey: ['validate-rfc', extractedData.rfcReceptor],
				queryFn: async (): Promise<ValidateRfcResponse> => {
					const { data } = await axiosInstance.post(
						`/validate/rfc?rfc=${extractedData.rfcReceptor}`,
					);
					return ValidateRfcResponseSchema.parse(data);
				},
			};

			// RFC EMISOR ES EL DEL PROVEEDOR SELECCIONADO

			const response = await queryClient.fetchQuery(rfcQueryOptions);
			if (response.status != 'OK') {
				throw new Error(
					response.errorDescription ||
						response.message ||
						'El RFC del receptor no es válido.',
				);
			}

			// Validación #6: RFC del Emisor (basado en rol)
			// TODO: Implementar la lógica para obtener el rol del usuario
			const userRole = 'EMPL'; // Simular rol de empleado
			if (userRole === 'EMPL') {
				if (extractedData.rfcEmisor !== selectedSupplierRfc.value) {
					throw new Error(
						'El RFC del emisor en el XML no coincide con el del proveedor seleccionado.',
					);
				}
			}

			// 5. Todas las validaciones pasaron.
			// Actualizar el estado del store con los datos validados y enriquecidos.
			updateInvoiceData({
				folio: extractedData.folio,
				moneda: extractedData.moneda,
				importe: extractedData.total,
				sociedad: '',
			});

			selectedXmlFile.value = xmlFile;
			xmlValidationStatus.value = 'success';
			toast.success('XML validado correctamente.');
		} catch (error) {
			// 6. FALLO: Alguna de las validaciones lanzó un error.
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error('Error en la validación del XML:', errorMessage);
			xmlValidationStatus.value = 'error';
			xmlValidationError.value = errorMessage;
			selectedXmlFile.value = null; // Limpiar el archivo si la validación falla

			// @ts-expect-error err
			toast.error('Error en la validación del XML', { description: error.message });
		}
	};

	return {
		// Estado
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

		purchaseOrdersQuery,
		goodsReceiptsQuery,
		providersQuery,
		allProviders,
		purchaseOrders,
		goodsReceipts,
		xmlValidationStatus,
		xmlValidationError,
		validateAndProcessXml,

		// Getters
		selectedPO,
		totalSelectedAmount,
		isSelectionLocked,
		canProceedToStep2,
		canProceedToStep3,
		canProceedToStep4,

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
	};
});
