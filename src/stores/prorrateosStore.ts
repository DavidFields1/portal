import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { toast } from 'vue-sonner';
import type { Concept } from '@/schemas/conceptSchemas';
import type { Prorrateo } from '@/schemas/prorrateosSchema';
import {
	useCreateProrrateoMutation,
	useDeleteProrrateoMutation,
	useUpdateProrrateoMutation,
} from '@/composables/useProrrateos';
import { useInvoiceMonitorStore } from './invoiceMonitorStore';
import { useQueryClient } from '@tanstack/vue-query';

// Exportamos la constante para que pueda ser usada en otros archivos
export const EPSILON = 0.005;

export const useProrrateosStore = defineStore('prorrateos', () => {
	// --- ESTADO ---
	const showProrateoFormForConceptId = ref<number | null>(null);
	const editingProrateoId = ref<number | null>(null);
	const prorationType = ref<'importe' | 'porcentaje'>('importe');
	const newProrateoCuenta = ref('');
	const newProrateoCentroCosto = ref('');
	const newProrateoImpuesto = ref('');
	const newProrateoImporte = ref<number | null>(null);
	const newProrateoPorcentaje = ref<number | null>(null);
	const formRemainingSnapshot = ref<number>(0);

	const createMutation = useCreateProrrateoMutation();
	const updateMutation = useUpdateProrrateoMutation();
	const deleteMutation = useDeleteProrrateoMutation();

	// --- GETTERS ---
	const isPorcentaje = computed({
		get: () => prorationType.value === 'porcentaje',
		set: (val: boolean) => {
			prorationType.value = val ? 'porcentaje' : 'importe';
		},
	});

	const invoiceMonitorStore = useInvoiceMonitorStore();
	const queryClient = useQueryClient();

	const isSaving = computed(
		() => createMutation.isPending.value || updateMutation.isPending.value,
	);
	const isDeleting = computed(() => deleteMutation.isPending.value);

	const invalidateProrrateosQuery = () => {
		queryClient.invalidateQueries({
			queryKey: ['prorrateos', invoiceMonitorStore.selectedInvoiceUuid],
		});
	};

	// --- ACCIONES ---
	function sumProrrateosImporte(concept: Concept): number {
		const list = concept?.prorrateos ?? [];
		return list.reduce((acc, p) => acc + (p?.valor_importe ?? 0), 0);
	}

	function getConceptRemaining(concept: Concept): number {
		const total = concept?.importe ?? 0;
		const used = sumProrrateosImporte(concept);
		return Math.max(total - used, 0);
	}

	function resetProrateoFormFields() {
		newProrateoCuenta.value = '';
		newProrateoCentroCosto.value = '';
		newProrateoImpuesto.value = '';
		newProrateoImporte.value = null;
		newProrateoPorcentaje.value = null;
		prorationType.value = 'importe';
		formRemainingSnapshot.value = 0;
	}

	function cancelProrateoForm() {
		showProrateoFormForConceptId.value = null;
		editingProrateoId.value = null;
		resetProrateoFormFields();
	}

	function showAddProrateoForm(concept: Concept) {
		editingProrateoId.value = null;
		resetProrateoFormFields();
		showProrateoFormForConceptId.value = concept.id_concepto;
		formRemainingSnapshot.value = getConceptRemaining(concept);
	}

	function editProrateo(concept: Concept, prorateo: Prorrateo) {
		showProrateoFormForConceptId.value = concept.id_concepto;
		editingProrateoId.value = prorateo.id_prorrateo;

		// --- ESTA ES LA PARTE CRUCIAL QUE FALTABA ---
		// Rellenar los campos del formulario del store con los datos del prorrateo a editar
		newProrateoCuenta.value = prorateo.cuenta_contable;
		newProrateoCentroCosto.value = prorateo.centro_costo;
		newProrateoImpuesto.value = prorateo.indicador_impuesto;
		newProrateoImporte.value = prorateo.valor_importe;
		newProrateoPorcentaje.value = prorateo.valor_porcentaje;

		// Lógica mejorada para el "restante" en modo edición:
		// El "restante" es el importe total del concepto MENOS la suma de
		// TODOS los otros prorrateos (excluyendo el que se está editando).
		const totalProrrateado = sumProrrateosImporte(concept);
		const importeDelProrrateoActual = prorateo.valor_importe ?? 0;
		const totalDeOtrosProrrateos = totalProrrateado - importeDelProrrateoActual;
		formRemainingSnapshot.value = (concept.importe ?? 0) - totalDeOtrosProrrateos;
	}

	function deleteProrateo(prorateoId: number) {
		deleteMutation.mutate(prorateoId, {
			onSuccess: () => {
				toast.success('Prorrateo eliminado correctamente.');
				invalidateProrrateosQuery();
			},
			onError: (error) => {
				toast.error(`Error al eliminar: ${error.message}`);
			},
		});
	}

	function saveProrateo(concept: Concept) {
		// ... (Validaciones iniciales sin cambios)

		const prorateoData: Prorrateo = {
			id_prorrateo: editingProrateoId.value ?? 0, // El backend lo ignora en POST
			id_concepto: concept.id_concepto,
			cuenta_contable: newProrateoCuenta.value,
			centro_costo: newProrateoCentroCosto.value,
			indicador_impuesto: newProrateoImpuesto.value,
			valor_importe: newProrateoImporte.value ?? 0,
			valor_porcentaje: newProrateoPorcentaje.value ?? 0,
			// El backend debería manejar fechas y estatus
			fecha_creacion: new Date().toISOString(),
			fecha_modificacion: new Date().toISOString(),
			estatus: 'Activo',
		};

		if (editingProrateoId.value !== null) {
			// --- ACTUALIZAR ---
			updateMutation.mutate(prorateoData, {
				onSuccess: () => {
					toast.success('Prorrateo actualizado correctamente.');
					invalidateProrrateosQuery();
					cancelProrateoForm();
				},
				onError: (error) => {
					toast.error(`Error al actualizar: ${error.message}`);
				},
			});
		} else {
			// --- CREAR ---
			createMutation.mutate(prorateoData, {
				onSuccess: () => {
					toast.success('Prorrateo creado correctamente.');
					invalidateProrrateosQuery();
					cancelProrateoForm();
				},
				onError: (error) => {
					toast.error(`Error al crear: ${error.message}`);
				},
			});
		}
	}

	return {
		// Estado y Getters
		showProrateoFormForConceptId,
		editingProrateoId,
		prorationType,
		newProrateoCuenta,
		newProrateoCentroCosto,
		newProrateoImpuesto,
		newProrateoImporte,
		newProrateoPorcentaje,
		formRemainingSnapshot,
		isPorcentaje,
		isSaving,
		isDeleting,
		// Acciones
		cancelProrateoForm,
		saveProrateo,
		editProrateo,
		showAddProrateoForm,
		getConceptRemaining,
		deleteProrateo,
	};
});
