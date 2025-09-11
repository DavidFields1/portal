import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { toast } from 'vue-sonner';
import type { Concept } from '@/schemas/conceptSchemas';
import type { Prorrateo } from '@/schemas/prorrateoSchemas';
import { formatCurrency } from '@/lib/utils';

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

	// --- GETTERS ---
	const isPorcentaje = computed({
		get: () => prorationType.value === 'porcentaje',
		set: (val: boolean) => {
			prorationType.value = val ? 'porcentaje' : 'importe';
		},
	});

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
		editingProrateoId.value = prorateo.id_prorrateo;
		showProrateoFormForConceptId.value = concept.id_concepto;
		formRemainingSnapshot.value = getConceptRemaining(concept);
	}

	function deleteProrateo(concept: Concept, prorateoId: number) {
		if (!concept.prorrateos) return;
		const index = concept.prorrateos.findIndex((p) => p.id_prorrateo === prorateoId);
		if (index !== -1) {
			concept.prorrateos.splice(index, 1);
			toast.info('Prorrateo eliminado.');
		}
	}

	function saveProrateo(concept: Concept, moneda: string) {
		if (
			!newProrateoCuenta.value ||
			!newProrateoCentroCosto.value ||
			!newProrateoImpuesto.value
		) {
			toast.error('Todos los campos son obligatorios.');
			return;
		}

		const totalConcepto = concept.importe ?? 0;
		const sumaActual = sumProrrateosImporte(concept);
		const candidatoImporte = Number(newProrateoImporte.value ?? 0);

		let sumaBase = sumaActual;
		if (editingProrateoId.value !== null) {
			const original = concept.prorrateos?.find(
				(p) => p.id_prorrateo === editingProrateoId.value,
			);
			sumaBase = sumaActual - (original?.valor_importe ?? 0);
		}

		const nuevaSuma = sumaBase + candidatoImporte;
		if (nuevaSuma > totalConcepto + EPSILON) {
			toast.error(
				`El total de prorrateos excede el importe del concepto. Restante: ${formatCurrency(
					Math.max(totalConcepto - sumaBase, 0),
					moneda,
				)}`,
			);
			return;
		}

		if (editingProrateoId.value !== null) {
			const prorateoToUpdate = concept.prorrateos?.find(
				(p) => p.id_prorrateo === editingProrateoId.value,
			);
			if (prorateoToUpdate) {
				prorateoToUpdate.cuenta_contable = newProrateoCuenta.value;
				prorateoToUpdate.centro_costo = newProrateoCentroCosto.value;
				prorateoToUpdate.indicador_impuesto = newProrateoImpuesto.value;
				prorateoToUpdate.valor_importe = newProrateoImporte.value ?? 0;
				prorateoToUpdate.valor_porcentaje = newProrateoPorcentaje.value ?? 0;
				toast.success('Prorrateo actualizado.');
			}
		} else {
			const newProrateo: Prorrateo = {
				id_prorrateo: Date.now(),
				id_concepto: concept.id_concepto,
				cuenta_contable: newProrateoCuenta.value,
				centro_costo: newProrateoCentroCosto.value,
				indicador_impuesto: newProrateoImpuesto.value,
				valor_importe: newProrateoImporte.value ?? 0,
				valor_porcentaje: newProrateoPorcentaje.value ?? 0,
				fecha_creacion: new Date().toISOString(),
				fecha_modificacion: new Date().toISOString(),
				estatus: 'Activo',
			};
			concept.prorrateos?.push(newProrateo);
			toast.success('Prorrateo agregado.');
		}
		cancelProrateoForm();
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
		// Acciones
		cancelProrateoForm,
		saveProrateo,
		editProrateo,
		showAddProrateoForm,
		getConceptRemaining,
		deleteProrateo,
	};
});
