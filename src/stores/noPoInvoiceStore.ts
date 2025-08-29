// src/stores/noPoInvoiceStore.ts

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { toast } from 'vue-sonner';
import { UploadCloud, FileText, ClipboardList, Users } from 'lucide-vue-next';
import { useAuthStore } from './authStore';
import { useProvidersQuery } from '@/composables/useProviders';
import { ProviderSchema, type Provider } from '@/schemas/providerSchema';
import { readFileAsText } from '@/helpers/ReadFilesAsText';
import { convertXMLtoJSON } from '@/helpers/ConvertXmlToJson';
import { mapXmlData } from '@/helpers/MapXmlData';
import { InvoiceDataSchema, type InvoiceData, type Step } from '@/schemas/invoiceSchemas';
import axiosInstance from '@/config/axiosInstance';
import { ValidateRfcResponseSchema, type ValidateRfcResponse } from '@/schemas/validateRfc';
import { queryClient } from '@/main';
import type { ExtractedXmlData } from './poInvoiceStore';

export const useNoPOInvoiceStore = defineStore('no-po-invoice', () => {
	const authStore = useAuthStore();

	// --- ESTADO ---
	const allSteps = ref<Step[]>([
		{ id: 'select_supplier', name: 'Seleccionar Proveedor', icon: Users },
		{ id: 'upload_files', name: 'Subir Archivos', icon: UploadCloud },
		{ id: 'invoice_data', name: 'Datos de Factura', icon: ClipboardList },
		{ id: 'confirm', name: 'Confirmar', icon: FileText },
	]);
	const currentStepIndex = ref(0);
	const selectedSupplierId = ref<string | null>(null);
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
	const selectedProvider = ref<Provider | null>(null);

	// --- GETTERS (COMPUTED) ---
	const isUserProvider = computed(() => {
		return authStore.user?.proveedor !== null && authStore.user?.proveedor !== undefined;
	});
	const userProvider = computed(() => {
		return authStore.user?.proveedor;
	});

	const steps = computed<Step[]>(() => {
		const baseSteps = [allSteps.value[0], allSteps.value[1]];
		if (invoiceData.value.moneda !== 'MXN') {
			baseSteps.push(allSteps.value[2]);
		}
		baseSteps.push(allSteps.value[3]);
		return baseSteps;
	});

	// --- WATCHER CORRECTO PARA PREVENIR ERRORES DE REACTIVIDAD ---
	watch(
		() => invoiceData.value.moneda,
		(newMoneda, oldMoneda) => {
			if (oldMoneda !== 'MXN' && newMoneda === 'MXN') {
				if (currentStepIndex.value >= steps.value.length) {
					currentStepIndex.value = steps.value.length - 1;
				}
			}
		},
	);

	const getCurrentStepId = computed<string>(
		() => steps.value[currentStepIndex.value]?.id || 'select_supplier',
	);

	const providersQuery = useProvidersQuery();
	const allProviders = computed<Provider[]>(() => {
		return providersQuery.data.value?.object.content ?? [];
	});
	const isSelectionLocked = computed<boolean>(() => currentStepIndex.value > 0);
	const needsInvoiceDataStep = computed<boolean>(() => invoiceData.value.moneda !== 'MXN');
	const canProceed = computed<boolean>(() => {
		const currentId = getCurrentStepId.value;
		if (currentId === 'upload_files') {
			return (
				selectedPdfFile.value !== null &&
				selectedXmlFile.value !== null &&
				xmlValidationStatus.value === 'success'
			);
		}
		if (currentId === 'invoice_data') {
			return InvoiceDataSchema.safeParse(invoiceData.value).success;
		}
		return true;
	});

	// --- ACCIONES ---
	const resetProcess = () => {
		currentStepIndex.value = 0;
		selectedSupplierId.value = null;
		currentSupplierName.value = null;
		selectedProvider.value = null;
		selectedPdfFile.value = null;
		selectedXmlFile.value = null;
		isSubmitting.value = false;
		invoiceData.value = { folio: '', moneda: 'MXN', importe: 0, sociedad: '' };
		invoiceExtractedData.value = null;
		xmlValidationStatus.value = 'idle';
		xmlValidationError.value = null;
	};
	const selectSupplier = (provider: Provider) => {
		try {
			const validatedSupplier = ProviderSchema.parse(provider);
			selectedSupplierId.value = validatedSupplier.id_proveedor_sap;
			currentSupplierName.value = validatedSupplier.nombre_razon_social;
			selectedProvider.value = validatedSupplier;
			toast.success(`Proveedor seleccionado: ${validatedSupplier.nombre_razon_social}`);
			// 1. REQUERIMIENTO: AVANZAR AUTOMÁTICAMENTE
			currentStepIndex.value = 1;
		} catch (error) {
			console.error('Invalid supplier data:', error);
			toast.error('Error al seleccionar proveedor');
		}
	};
	const resetSupplierSelection = () => {
		selectedSupplierId.value = null;
		currentSupplierName.value = null;
		currentStepIndex.value = 0;
		selectedProvider.value = null;
		// Limpiar también los archivos, ya que dependen del contexto del proveedor
		selectedPdfFile.value = null;
		selectedXmlFile.value = null;
		xmlValidationStatus.value = 'idle';
		xmlValidationError.value = null;
		toast.info('Selección de proveedor reiniciada.');
	};
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
			selectedProvider.value = provider;
			selectedSupplierId.value = provider.id_proveedor_sap;
			currentSupplierName.value = provider.nombre_razon_social;
		}
	};
	const nextStep = () => {
		if (currentStepIndex.value === 0 && !selectedSupplierId.value) {
			toast.error('Debes seleccionar un proveedor para continuar.');
			return;
		}
		if (!canProceed.value && currentStepIndex.value > 0) {
			toast.error('Completa los requisitos del paso actual para continuar.');
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
	const handleFileUpload = async (files: { pdf?: File; xml?: File }) => {
		if (files.pdf) {
			selectedPdfFile.value = files.pdf;
			toast.success('Archivo PDF cargado.');
		}
		if (files.xml) {
			await validateAndProcessXml(files.xml);
		}
	};
	const removeFile = (type: 'pdf' | 'xml') => {
		if (type === 'pdf') {
			selectedPdfFile.value = null;
			toast.info('Archivo PDF removido.');
		} else {
			selectedXmlFile.value = null;
			xmlValidationStatus.value = 'idle';
			xmlValidationError.value = null;
			toast.info('Archivo XML removido.');
		}
	};
	const updateInvoiceData = (data: Partial<InvoiceData>) => {
		invoiceData.value = { ...invoiceData.value, ...data };
	};
	const validateAndProcessXml = async (xmlFile: File) => {
		xmlValidationStatus.value = 'loading';
		xmlValidationError.value = null;
		try {
			const xmlString = await readFileAsText(xmlFile);
			const xmlObject = convertXMLtoJSON(xmlString);
			const extractedData = mapXmlData(xmlObject);
			if (extractedData.tipo_comprobante !== 'I') {
				throw new Error('El tipo de comprobante debe ser de Ingreso (I).');
			}
			const dateStamped = new Date(extractedData.fecha_timbrado);
			const currentDate = new Date();
			if (
				dateStamped.getMonth() !== currentDate.getMonth() ||
				dateStamped.getFullYear() !== currentDate.getFullYear()
			) {
				throw new Error('La fecha de la factura no corresponde al mes y año actual.');
			}
			const rfcQueryOptions = {
				queryKey: ['validate-rfc', extractedData.rfc_receptor],
				queryFn: async (): Promise<ValidateRfcResponse> => {
					const { data } = await axiosInstance.post(
						`/validate/rfc?rfc=${extractedData.rfc_receptor}`,
					);
					return ValidateRfcResponseSchema.parse(data);
				},
			};
			const response = await queryClient.fetchQuery(rfcQueryOptions);
			if (response.status !== 'OK') {
				throw new Error(
					response.errorDescription ||
						response.message ||
						'El RFC del receptor no es válido.',
				);
			}
			updateInvoiceData({
				folio: extractedData.folio,
				moneda: extractedData.moneda,
				importe: extractedData.total,
			});
			invoiceExtractedData.value = extractedData;
			selectedXmlFile.value = xmlFile;
			xmlValidationStatus.value = 'success';
			toast.success('XML validado correctamente.');
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			xmlValidationStatus.value = 'error';
			xmlValidationError.value = errorMessage;
			selectedXmlFile.value = null;
			toast.error('Error en la validación del XML', { description: errorMessage });
		}
	};
	const createFactura = async () => {
		if (!invoiceExtractedData.value || !selectedPdfFile.value || !selectedXmlFile.value) {
			throw new Error('Faltan datos o archivos para crear la factura.');
		}
		const factura = {
			id_factura: 0,
			uuid: invoiceExtractedData.value.uuid,
			moneda: invoiceData.value.moneda,
			total: invoiceData.value.importe,
			fecha_expedicion: invoiceExtractedData.value.fecha_expedicion,
			fecha_timbrado: invoiceExtractedData.value.fecha_timbrado,
			fecha_creacion: new Date().toISOString(),
			razonsocial_emisor: invoiceExtractedData.value.razonsocial_emisor,
			rfc_emisor: invoiceExtractedData.value.rfc_emisor,
			razonsocial_receptor: invoiceExtractedData.value.razonsocial_receptor,
			rfc_receptor: invoiceExtractedData.value.rfc_receptor,
			domicilio_fiscal: invoiceExtractedData.value.domicilio_fiscal_receptor,
			metodo_pago: invoiceExtractedData.value.metodo_pago,
			forma_pago: invoiceExtractedData.value.forma_pago,
			estatus: 'NUEVA',
			file_path: '',
			sello: invoiceExtractedData.value.sello,
			no_certificado: invoiceExtractedData.value.no_certificado,
			certificado: invoiceExtractedData.value.certificado,
			subtotal: invoiceExtractedData.value.subtotal,
			tipo_comprobante: invoiceExtractedData.value.tipo_comprobante,
			regimen_fiscal_receptor: invoiceExtractedData.value.regimen_fiscal_receptor,
			uso_cfdi: invoiceExtractedData.value.uso_cfdi,
			total_impuestos_trasladados: invoiceExtractedData.value.total_impuestos_trasladados,
			total_impuestos_retenidos: invoiceExtractedData.value.total_impuestos_retenidos,
			sello_sat: invoiceExtractedData.value.sello_sat,
			no_certificado_sat: invoiceExtractedData.value.no_certificado_sat,
			tipo_factura: invoiceExtractedData.value.tipo_comprobante,
			serie: invoiceExtractedData.value.serie,
			folio: invoiceData.value.folio,
			documento_contable: '',
			ejercicio_fiscal: '',
			sociedad: invoiceData.value.sociedad,
			conceptos: invoiceExtractedData.value.conceptos,
			id_proveedor_sap: selectedSupplierId.value,
		};
		const formData = new FormData();
		formData.append(
			'factura',
			new Blob([JSON.stringify(factura)], { type: 'application/json' }),
		);
		formData.append('files', selectedPdfFile.value, selectedPdfFile.value.name);
		formData.append('files', selectedXmlFile.value, selectedXmlFile.value.name);
		const createFacturaQueryOptions = {
			queryKey: ['create-soc-factura', factura.uuid, factura.folio],
			queryFn: async () => {
				const { data } = await axiosInstance.post('/factura/soc', formData, {
					headers: { 'Content-Type': 'multipart/form-data' },
				});
				return data;
			},
		};
		return await queryClient.fetchQuery(createFacturaQueryOptions);
	};
	const submitInvoice = async () => {
		if (isSubmitting.value) return;
		isSubmitting.value = true;
		try {
			if (needsInvoiceDataStep.value) {
				const validation = InvoiceDataSchema.safeParse(invoiceData.value);
				if (!validation.success) {
					throw new Error('Los datos de la factura son inválidos.');
				}
			}
			await createFactura();
			toast.success('Factura cargada exitosamente', {
				description: 'La factura sin OC fue enviada correctamente.',
			});
			resetProcess();
		} catch (error) {
			console.error('Error al enviar la factura:', error);
			const errorMessage =
				error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
			toast.error('Error al cargar la factura', { description: errorMessage });
		} finally {
			isSubmitting.value = false;
		}
	};

	return {
		steps,
		currentStepIndex,
		selectedSupplierId,
		currentSupplierName,
		selectedPdfFile,
		selectedXmlFile,
		isSubmitting,
		invoiceData,
		invoiceExtractedData,
		xmlValidationStatus,
		xmlValidationError,
		isUserProvider,
		userProvider,
		allProviders,
		providersQuery,
		isSelectionLocked,
		getCurrentStepId,
		needsInvoiceDataStep,
		canProceed,
		resetProcess,
		selectSupplier,
		resetSupplierSelection,
		autoConfigureProvider,
		nextStep,
		prevStep,
		handleFileUpload,
		removeFile,
		updateInvoiceData,
		submitInvoice,
		createFactura,
		selectedProvider,
	};
});
