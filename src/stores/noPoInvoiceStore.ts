// src/stores/noPoInvoiceStore.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { toast } from 'vue-sonner';
import { UploadCloud, FileText, ClipboardList } from 'lucide-vue-next';
import { readFileAsText } from '@/helpers/ReadFilesAsText';
import { convertXMLtoJSON } from '@/helpers/ConvertXmlToJson';
import { mapXmlData } from '@/helpers/MapXmlData';
import { InvoiceDataSchema, type InvoiceData, type Step } from '@/schemas/invoiceSchemas';
import axiosInstance from '@/config/axiosInstance';
import { ValidateRfcResponseSchema, type ValidateRfcResponse } from '@/schemas/validateRfc';
import { queryClient } from '@/main';

// Copiamos la interfaz del store de PO, ya que es muy útil
interface ExtractedXmlData {
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

export const useNoPOInvoiceStore = defineStore('no-po-invoice', () => {
	// --- ESTADO ---
	const allSteps = ref<Step[]>([
		{ id: 'upload_files', name: 'Subir Archivos', icon: UploadCloud },
		{ id: 'invoice_data', name: 'Datos de Factura', icon: ClipboardList },
		{ id: 'confirm', name: 'Confirmar', icon: FileText },
	]);

	const currentStepIndex = ref(0);
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

	// --- GETTERS (COMPUTED) ---

	// Lógica de pasos dinámicos
	const steps = computed<Step[]>(() => {
		const baseSteps = [allSteps.value[0]]; // upload_files

		// Solo agregar el paso de datos de factura si la moneda NO es MXN
		if (invoiceData.value.moneda !== 'MXN') {
			baseSteps.push(allSteps.value[1]); // invoice_data
		}

		baseSteps.push(allSteps.value[2]); // confirm
		return baseSteps;
	});

	const getCurrentStepId = computed<string>(
		() => steps.value[currentStepIndex.value]?.id || 'upload_files',
	);

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
		return true; // Para el paso de confirmación
	});

	// --- ACCIONES ---

	const resetProcess = () => {
		currentStepIndex.value = 0;
		selectedPdfFile.value = null;
		selectedXmlFile.value = null;
		isSubmitting.value = false;
		invoiceData.value = { folio: '', moneda: 'MXN', importe: 0, sociedad: '' };
		invoiceExtractedData.value = null;
		xmlValidationStatus.value = 'idle';
		xmlValidationError.value = null;
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

	const nextStep = () => {
		if (!canProceed.value) {
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

	const validateAndProcessXml = async (xmlFile: File) => {
		xmlValidationStatus.value = 'loading';
		xmlValidationError.value = null;

		try {
			const xmlString = await readFileAsText(xmlFile);
			const xmlObject = convertXMLtoJSON(xmlString);
			const extractedData = mapXmlData(xmlObject);

			// --- CADENA DE VALIDACIÓN (versión sin OC) ---

			// 1. Tipo de Comprobante
			if (extractedData.tipo_comprobante !== 'I') {
				throw new Error('El tipo de comprobante debe ser de Ingreso (I).');
			}

			// 2. Fecha de Timbrado (mismo mes y año)
			const dateStamped = new Date(extractedData.fecha_timbrado);
			const currentDate = new Date();
			if (
				dateStamped.getMonth() !== currentDate.getMonth() ||
				dateStamped.getFullYear() !== currentDate.getFullYear()
			) {
				throw new Error('La fecha de la factura no corresponde al mes y año actual.');
			}

			// 3. RFC del Receptor
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

			// --- VALIDACIONES PASARON ---
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

		// 1. Construir el objeto de factura a partir de los datos del store
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
			file_path: '', // Asignado por el backend
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
			documento_contable: '', // No aplica en este flujo
			ejercicio_fiscal: '', // No aplica en este flujo
			sociedad: invoiceData.value.sociedad,
			conceptos: invoiceExtractedData.value.conceptos,
			// El proveedor se identifica por el RFC emisor, no se envía un ID SAP
			id_proveedor_sap: null,
		};

		// 2. Crear el objeto FormData
		const formData = new FormData();

		// Adjuntar el JSON de la factura como un Blob
		formData.append(
			'factura',
			new Blob([JSON.stringify(factura)], { type: 'application/json' }),
		);

		// Adjuntar los archivos PDF y XML
		formData.append('files', selectedPdfFile.value, selectedPdfFile.value.name);
		formData.append('files', selectedXmlFile.value, selectedXmlFile.value.name);

		// 3. Definir y ejecutar la query con TanStack Query
		const createFacturaQueryOptions = {
			queryKey: ['create-soc-factura', factura.uuid, factura.folio],
			queryFn: async () => {
				const { data } = await axiosInstance.post('/factura/soc', formData, {
					headers: {
						// Axios establece esto automáticamente para FormData, pero es bueno saberlo
						'Content-Type': 'multipart/form-data',
					},
				});
				return data;
			},
		};

		// Usamos fetchQuery para una mutación "one-off"
		return await queryClient.fetchQuery(createFacturaQueryOptions);
	};

	const submitInvoice = async () => {
		if (isSubmitting.value) return;
		isSubmitting.value = true;

		try {
			await createFactura();

			toast.success('Factura cargada exitosamente', {
				description: 'La factura sin OC fue enviada correctamente.',
			});
			resetProcess();
		} catch (error) {
			console.error('Error submitting invoice:', error);
			toast.error('Error al cargar la factura', {
				description: 'Por favor, inténtalo de nuevo más tarde.',
			});
		} finally {
			isSubmitting.value = false;
		}
	};

	return {
		// Estado
		steps,
		currentStepIndex,
		selectedPdfFile,
		selectedXmlFile,
		isSubmitting,
		invoiceData,
		invoiceExtractedData,
		xmlValidationStatus,
		xmlValidationError,

		// Getters
		getCurrentStepId,
		needsInvoiceDataStep,
		canProceed,

		// Acciones
		resetProcess,
		handleFileUpload,
		removeFile,
		updateInvoiceData,
		nextStep,
		prevStep,
		submitInvoice,
	};
});
