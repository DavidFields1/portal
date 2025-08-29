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
import { DeviationsResponseSchema, type Deviation } from '@/schemas/deviationSchema';
import { formatCurrency } from '@/lib/utils';

// Interfaz para la información de desviación

// Interfaz para los datos extraídos del XML
export interface ExtractedXmlData {
	uuid: string;
	fecha_timbrado: string;
	sello_sat: string;
	no_certificado_sat: string;
	moneda: string;
	total: number;
	subtotal: number;
	fecha_expedicion: string;
	metodo_pago: string;
	forma_pago: string;
	sello: string;
	no_certificado: string;
	certificado: string;
	tipo_comprobante: string;
	serie: string;
	folio: string;
	lugar_expedicion: string;
	razonsocial_emisor: string;
	rfc_emisor: string;
	regimen_fiscal_emisor: string;
	razonsocial_receptor: string;
	rfc_receptor: string;
	domicilio_fiscal_receptor: string;
	regimen_fiscal_receptor: string;
	uso_cfdi: string;
	total_impuestos_trasladados: number;
	total_impuestos_retenidos: number;
	conceptos: Array<{
		id_concepto: number;
		uuid_factura: string;
		clave_prod_serv: string;
		cantidad: number;
		clave_unidad: string;
		unidad: string;
		descripcion: string;
		valor_unitario: number;
		importe: number;
		estatus: string;
		fecha_creacion: string;
		fecha_modificacion: string;
	}>;
	retenciones?: Array<{
		Base: string;
		Impuesto: string;
		TipoFactor: string;
		TasaOCuota: string;
		Importe: string;
	}>;
}

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

	const invoiceExtractedData = ref<ExtractedXmlData | null>(null);

	const xmlValidationStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle');
	const xmlValidationError = ref<string | null>(null);

	const deviationInfo = ref<Deviation | null>(null);

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

	// Usar la función de utilidad importada
	const formatCurrencyStore = (amount: number, currency: string) => {
		return formatCurrency(amount, currency);
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

	const resetInvoiceProcess = () => {
		selectedPdfFile.value = null;
		selectedXmlFile.value = null;

		xmlValidationStatus.value = 'idle';
		xmlValidationError.value = null;
		deviationInfo.value = null;

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
			if (extractedData.moneda !== selectedPO.value?.Moneda) {
				throw new Error('La moneda del XML no coincide con la de la Orden de Compra.');
			}

			// Validación #3: Importes (Subtotal vs Entradas de Mercancía)
			const difference = Math.abs(extractedData.subtotal - totalSelectedAmount.value);
			console.log('subtotal', extractedData.subtotal);
			console.log('total entradas', totalSelectedAmount.value);
			console.log('DIFFERENCE', difference);

			if (difference > 0) {
				// Consultar servicio de desviaciones por moneda
				try {
					const deviationResponse = await queryClient.fetchQuery({
						queryKey: ['deviations', extractedData.moneda],
						queryFn: async () => {
							const { data } = await axiosInstance.get(
								`/configuracion/desviacion/moneda?moneda=${extractedData.moneda}`,
							);
							console.log('DEVIATION DATA', data);
							const parsedData = DeviationsResponseSchema.parse(data);
							return parsedData.object;
						},
					});

					// Si la diferencia excede la tolerancia, lanzar error
					if (difference > deviationResponse[0].desviacion_permitida) {
						throw new Error(
							`La diferencia entre el subtotal del XML (${extractedData.subtotal}) y las entradas seleccionadas (${totalSelectedAmount.value}) excede la tolerancia permitida de ${deviationResponse[0].desviacion_permitida}.`,
						);
					}

					// Si está dentro de la tolerancia, guardar información de desviación
					deviationInfo.value = {
						id_desviacion_moneda: deviationResponse[0].id_desviacion_moneda,
						descripcion: deviationResponse[0].descripcion,
						moneda: extractedData.moneda,
						desviacion_permitida: deviationResponse[0].desviacion_permitida,
						estatus: deviationResponse[0].estatus,
						fecha_creacion: deviationResponse[0].fecha_creacion,
						fecha_modificacion: deviationResponse[0].fecha_modificacion,
					};

					toast.warning(
						`Diferencia de ${formatCurrency(difference, extractedData.moneda)} detectada, pero dentro de la tolerancia permitida.`,
					);
				} catch (error) {
					// Si el servicio de desviaciones falla, usar validación estricta
					console.error('Error al consultar desviaciones:', error);
					if (difference > 0) {
						throw new Error(
							'El subtotal del XML no coincide con la suma de las entradas seleccionadas.',
						);
					}
				}
			} else {
				// Limpiar información de desviación si no hay diferencia
				deviationInfo.value = null;
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

	const createFactura = async () => {
		try {
			// Construir el objeto de factura (ver comentarios para campos a mapear)
			const factura = {
				id_factura: 0,
				uuid: invoiceExtractedData.value?.uuid || '', // Mapear del XML
				moneda: invoiceData.value.moneda,
				total: invoiceData.value.importe,
				fecha_expedicion: invoiceExtractedData.value?.fecha_expedicion || '', // Mapear del XML
				fecha_timbrado: invoiceExtractedData.value?.fecha_timbrado || '', // Mapear del XML
				fecha_creacion: new Date().toISOString(),
				razonsocial_emisor: invoiceExtractedData.value?.razonsocial_emisor || '', // Mapear del XML
				rfc_emisor: invoiceExtractedData.value?.rfc_emisor || selectedSupplierRfc.value,
				razonsocial_receptor: invoiceExtractedData.value?.razonsocial_receptor || '', // Mapear del XML
				rfc_receptor: invoiceExtractedData.value?.rfc_receptor || '', // Mapear del XML
				domicilio_fiscal: invoiceExtractedData.value?.domicilio_fiscal_receptor || '', // Mapear del XML
				metodo_pago: invoiceExtractedData.value?.metodo_pago || '', // Mapear del XML
				forma_pago: invoiceExtractedData.value?.forma_pago || '', // Mapear del XML
				estatus: 'NUEVA',
				file_path: '', // El backend lo asigna
				sello: invoiceExtractedData.value?.sello || '', // Mapear del XML
				no_certificado: invoiceExtractedData.value?.no_certificado || '', // Mapear del XML
				certificado: invoiceExtractedData.value?.certificado || '', // Mapear del XML
				subtotal: invoiceExtractedData.value?.subtotal || 0,
				tipo_comprobante: invoiceExtractedData.value?.tipo_comprobante || '', // Mapear del XML
				regimen_fiscal_receptor: invoiceExtractedData.value?.regimen_fiscal_receptor || '', // Mapear del XML
				uso_cfdi: invoiceExtractedData.value?.uso_cfdi || '', // Mapear del XML
				total_impuestos_trasladados:
					invoiceExtractedData.value?.total_impuestos_trasladados || 0, // Mapear del XML
				total_impuestos_retenidos:
					invoiceExtractedData.value?.total_impuestos_retenidos || 0, // Mapear del XML
				sello_sat: invoiceExtractedData.value?.sello_sat || '', // Mapear del XML
				no_certificado_sat: invoiceExtractedData.value?.no_certificado_sat || '', // Mapear del XML
				tipo_factura: invoiceExtractedData.value?.tipo_comprobante || '', // Mapear del XML
				serie: invoiceExtractedData.value?.serie || '', // Mapear del XML
				folio: invoiceData.value.folio,
				documento_contable: '', // ¿De dónde se obtiene?
				ejercicio_fiscal: '', // ¿De dónde se obtiene?
				sociedad: invoiceData.value.sociedad,
				conceptos: invoiceExtractedData.value?.conceptos || [], // Mapear del XML
				id_proveedor_sap: selectedSupplierId.value,
			};

			const orden_compra = selectedPO.value ? [selectedPO.value] : [];
			const entradas_mercancia = selectedGRs.value;
			const retenciones = invoiceExtractedData.value?.retenciones || [];

			// Crear FormData
			const formData = new FormData();
			formData.append(
				'factura',
				new Blob([JSON.stringify(factura)], { type: 'application/json' }),
			);
			formData.append(
				'orden_compra',
				new Blob([JSON.stringify(orden_compra)], { type: 'application/json' }),
			);
			formData.append(
				'entradas_mercancia',
				new Blob([JSON.stringify(entradas_mercancia)], { type: 'application/json' }),
			);
			formData.append(
				'retenciones',
				new Blob([JSON.stringify(retenciones)], { type: 'application/json' }),
			);

			// Adjuntar archivos PDF y XML como blobs
			if (selectedPdfFile.value) {
				formData.append('files', selectedPdfFile.value, selectedPdfFile.value.name);
			}
			if (selectedXmlFile.value) {
				formData.append('files', selectedXmlFile.value, selectedXmlFile.value.name);
			}

			// Usar TanStack Query para la petición
			const createFacturaQueryOptions = {
				queryKey: ['create-factura', factura.uuid, factura.folio],
				queryFn: async () => {
					const { data } = await axiosInstance.post('/factura', formData, {
						headers: {
							'Content-Type': 'multipart/form-data',
						},
					});
					return data;
				},
			};

			const response = await queryClient.fetchQuery(createFacturaQueryOptions);

			toast.success('Factura creada correctamente');
			return response;
		} catch (error) {
			console.error('Error al crear la factura:', error);
			toast.error('Error al crear la factura');
			throw error;
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
		createFactura,

		purchaseOrdersQuery,
		goodsReceiptsQuery,
		providersQuery,
		allProviders,
		purchaseOrders,
		goodsReceipts,
		xmlValidationStatus,
		xmlValidationError,
		validateAndProcessXml,
		deviationInfo,

		// Getters
		selectedPO,
		totalSelectedAmount,
		isSelectionLocked,
		canProceedToStep2,
		canProceedToStep3,
		canProceedToStep4,
		isUserProvider,
		userProvider,
		formatCurrency: formatCurrencyStore,
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
		// submitInvoice,
		resetInvoiceProcess,
		autoConfigureProvider,
	};
});
