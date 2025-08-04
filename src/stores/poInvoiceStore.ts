import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { toast } from 'vue-sonner';
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
import { useAuthStore } from './authStore';

export const usePOInvoiceStore = defineStore('po-invoice', () => {
	// Estado
	const allSteps = ref<Step[]>([
		{ id: 'select_supplier', name: 'Seleccionar Proveedor', icon: Users },
		{ id: 'select_gr', name: 'Seleccionar Entradas', icon: ListIcon },
		{ id: 'upload_invoice', name: 'Subir Factura', icon: UploadCloud },
		{ id: 'invoice_data', name: 'Datos de Factura', icon: ClipboardList },
		{ id: 'confirm', name: 'Confirmar', icon: FileText },
	]);

	// Pasos dinámicos basados en la moneda
	const steps = computed<Step[]>(() => {
		const baseSteps = [
			allSteps.value[0], // select_supplier
			allSteps.value[1], // select_gr
			allSteps.value[2], // upload_invoice
		];

		// Solo agregar el paso de datos de factura si la moneda no es MXN
		if (invoiceData.value.moneda !== 'MXN') {
			baseSteps.push(allSteps.value[3]); // invoice_data
		}

		baseSteps.push(allSteps.value[4]); // confirm
		return baseSteps;
	});

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

	const invoiceExtractedData = ref<unknown | null>(null);

	const xmlValidationStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle');
	const xmlValidationError = ref<string | null>(null);

	const authStore = useAuthStore();

	// Detectar si el usuario es un proveedor y configurar automáticamente
	const isUserProvider = computed(() => {
		return authStore.user?.proveedor !== null && authStore.user?.proveedor !== undefined;
	});

	const userProvider = computed(() => {
		return authStore.user?.proveedor;
	});

	// Auto-configurar proveedor si el usuario es un proveedor
	const autoConfigureProvider = () => {
		if (isUserProvider.value && userProvider.value) {
			const provider: Provider = {
				usuario: null,
				id_proveedor: userProvider.value.id_proveedor,
				id_usuario: userProvider.value.id_usuario,
				id_proveedor_sap: userProvider.value.id_proveedor_sap,
				id_bloqueo: userProvider.value.id_bloqueo,
				nombre_razon_social: userProvider.value.nombre_razon_social,
				rfc: userProvider.value.rfc,
				pais_clave: userProvider.value.pais_clave,
				file_path: userProvider.value.file_path,
				fecha_creacion: userProvider.value.fecha_creacion,
				fecha_modificacion: userProvider.value.fecha_modificacion,
			};

			selectSupplier(provider);
			// Saltar al siguiente paso automáticamente
			currentStepIndex.value = 1;
		}
	};

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

	const formatCurrency = (amount: number, currency: string) => {
		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: currency,
		}).format(amount);
	};

	const isSelectionLocked = computed<boolean>(() => currentStepIndex.value > 1);

	const canProceedToStep2 = computed<boolean>(() => selectedGRs.value.length > 0);

	const canProceedToStep3 = computed<boolean>(
		() => selectedPdfFile.value !== null && selectedXmlFile.value !== null,
	);

	// Determinar si necesitamos el paso de datos de factura
	const needsInvoiceDataStep = computed<boolean>(() => invoiceData.value.moneda !== 'MXN');

	// Ajustar la validación del paso 4 basado en si existe o no
	const canProceedToStep4 = computed<boolean>(() => {
		// Si no necesitamos el paso de datos de factura, siempre retornar true
		if (!needsInvoiceDataStep.value) {
			return true;
		}

		try {
			InvoiceDataSchema.parse(invoiceData.value);
			return true;
		} catch {
			return false;
		}
	});

	// Obtener el índice real del paso actual considerando los pasos dinámicos
	const getCurrentStepId = computed<string>(() => {
		return steps.value[currentStepIndex.value]?.id || 'select_supplier';
	});

	// Verificar si estamos en el paso de datos de factura
	const isInvoiceDataStep = computed<boolean>(() => {
		return getCurrentStepId.value === 'invoice_data';
	});

	// Watcher para manejar cambios en la moneda y ajustar el paso actual si es necesario
	watch(
		() => invoiceData.value.moneda,
		(newMoneda, oldMoneda) => {
			// Si estamos en el paso de confirmación y la moneda cambió de no-MXN a MXN
			// necesitamos retroceder un paso porque el paso de datos de factura desapareció
			if (
				oldMoneda !== 'MXN' &&
				newMoneda === 'MXN' &&
				currentStepIndex.value === steps.value.length - 1
			) {
				currentStepIndex.value = Math.max(0, currentStepIndex.value - 1);
			}
		},
	);

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

			// Solo avanzar al siguiente paso si no es auto-configuración
			if (!isUserProvider.value) {
				currentStepIndex.value = 1;
			}

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

		// Validación para el paso de datos de factura (solo si existe)
		if (isInvoiceDataStep.value && !canProceedToStep4.value) {
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
			// Validar datos finales solo si necesitamos el paso de datos de factura
			if (needsInvoiceDataStep.value) {
				InvoiceDataSchema.parse(invoiceData.value);
			}

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
			if (extractedData.tipo_comprobante !== 'I') {
				throw new Error('El tipo de comprobante debe ser de Ingreso (I).');
			}

			// Validación #2: Moneda
			// if (extractedData.moneda !== selectedPO.value?.Moneda) {
			// 	throw new Error('La moneda del XML no coincide con la de la Orden de Compra.');
			// }

			// Validación #3: Importes (Subtotal vs Entradas de Mercancía)
			if (extractedData.subtotal !== totalSelectedAmount.value) {
				throw new Error(
					'El subtotal del XML no coincide con la suma de las entradas seleccionadas.',
				);
			}

			// Validación #4: Fecha de Timbrado (mismo mes y año)
			const dateStamped = new Date(extractedData.fecha_timbrado);
			const currentDate = new Date();
			if (
				dateStamped.getMonth() !== currentDate.getMonth() ||
				dateStamped.getFullYear() !== currentDate.getFullYear()
			) {
				throw new Error('La fecha de la factura no corresponde al mes y año actual.');
			}

			// Validación #5: RFC del Receptor
			console.log(`Validando RFC Receptor: ${extractedData.rfc_receptor}`);
			const rfcQueryOptions = {
				queryKey: ['validate-rfc', extractedData.rfc_receptor],
				queryFn: async (): Promise<ValidateRfcResponse> => {
					const { data } = await axiosInstance.post(
						`/validate/rfc?rfc=${extractedData.rfc_receptor}`,
					);
					return ValidateRfcResponseSchema.parse(data);
				},
			};

			// RFC EMISOR ES EL DEL PROVEEDOR SELECCIONADO
			// const rfcEmisor = selectedSupplierRfc.value;
			// console.log(`RFC Emisor: ${rfcEmisor}`);
			// if (rfcEmisor !== extractedData.rfc_emisor) {
			// 	throw new Error(
			// 		'El RFC del emisor en el XML no coincide con el del proveedor seleccionado.',
			// 	);
			// }

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
				if (extractedData.rfc_emisor !== selectedSupplierRfc.value) {
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

			invoiceExtractedData.value = extractedData;
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
		invoiceExtractedData,

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
		isUserProvider,
		userProvider,
		formatCurrency,
		needsInvoiceDataStep,
		getCurrentStepId,
		isInvoiceDataStep,

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
		autoConfigureProvider,
	};
});
