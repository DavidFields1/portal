<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { LoaderCircle } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import SearchableSelect from './SearchableSelect.vue';
import { formatCurrency } from '@/lib/utils';
import type { Concept } from '@/schemas/conceptSchemas';
import type { InvoiceMonitor } from '@/schemas/invoiceSchemas';
import type { Prorrateo } from '@/schemas/prorrateosSchema';
import { EPSILON, useProrrateosStore } from '@/stores/prorrateosStore';
import { useCentrosCostoSAPQuery, useCuentasGastoSAPQuery, useIndicadoresIvaSAPQuery } from '@/composables/useCatalogoSAP';

const props = withDefaults(
    defineProps<{
        concept: Concept;
        invoice: InvoiceMonitor;
        mode?: 'create' | 'edit';
        prorateo?: Prorrateo;
    }>(),
    {
        mode: 'create',
    }
);

const prorrateosStore = useProrrateosStore();
const {
    isPorcentaje,
    prorationType,
    newProrateoCuenta,
    newProrateoCentroCosto,
    newProrateoImpuesto,
    newProrateoImporte,
    newProrateoPorcentaje,
    formRemainingSnapshot,
    isSaving,
    editingProrateoId,
} = storeToRefs(prorrateosStore);
const { cancelProrateoForm, saveProrateo } = prorrateosStore;

const sociedadFactura = computed(() => props.invoice?.sociedad ?? '');
const areCatalogsEnabled = ref(false);

onMounted(() => {
	areCatalogsEnabled.value = true;
});

const { data: cuentasGasto, isLoading: isCuentasGastoLoading } =
    useCuentasGastoSAPQuery(
        { enabled: computed(() => areCatalogsEnabled.value && !!sociedadFactura.value) },
        sociedadFactura
    );
const { data: centrosCosto, isLoading: isCentrosCostoLoading } =
    useCentrosCostoSAPQuery(
        { enabled: computed(() => areCatalogsEnabled.value && !!sociedadFactura.value) },
        sociedadFactura
    );
const { data: indicadoresIva, isLoading: isIndicadoresIvaLoading } =
    useIndicadoresIvaSAPQuery({ enabled: areCatalogsEnabled });

const areCatalogsLoading = computed(() => isCuentasGastoLoading.value || isCentrosCostoLoading.value || isIndicadoresIvaLoading.value);
const areCatalogsInError = computed(() => !cuentasGasto.value?.object || !centrosCosto.value?.object || !indicadoresIva.value?.object);

const currentConceptImporte = computed(() => props.concept?.importe ?? 0);

function handleImporteChange(value: string | number) {
    const numValue = value === '' ? null : Number(value);
    newProrateoImporte.value = numValue;

    if (numValue !== null && currentConceptImporte.value > 0) {
        const percent = (numValue / currentConceptImporte.value) * 100;
        newProrateoPorcentaje.value = Math.round(percent * 100) / 100;
    } else {
        newProrateoPorcentaje.value = null;
    }
}

function handlePorcentajeChange(value: string | number) {
    const numValue = value === '' ? null : Number(value);
    newProrateoPorcentaje.value = numValue;

    if (numValue !== null && currentConceptImporte.value > 0) {
        const amount = (numValue / 100) * currentConceptImporte.value;
        newProrateoImporte.value = Math.round(amount * 100) / 100;
    } else {
        newProrateoImporte.value = null;
    }
}

const handleSave = () => saveProrateo(props.concept);
const handleCancel = () => cancelProrateoForm();
const formTitle = computed(() => (props.mode === 'edit' ? 'Editar Prorrateo' : 'Nuevo Prorrateo'));

const validationStatus = computed(() => {
	const totalConcepto = props.concept?.importe ?? 0;
	const candidatoImporte = newProrateoImporte.value ?? 0;

	if (candidatoImporte <= 0) {
		// No validar si el campo está vacío o es cero,
		// la validación de campos obligatorios se hace al guardar.
		return { isValid: true, message: '' };
	}

	// 1. Suma total de los prorrateos ya existentes en el concepto.
	const sumaActualProrrateos = (props.concept.prorrateos ?? []).reduce(
		(acc, p) => acc + (p?.valor_importe ?? 0),
		0,
	);

	// 2. Base para el cálculo. Por defecto es la suma actual.
	let sumaBase = sumaActualProrrateos;

	// 3. Si estamos editando, la base es la suma actual MENOS el valor original
	//    del prorrateo que estamos editando.
	if (props.mode === 'edit' && editingProrateoId.value !== null) {
		const prorrateoOriginal = props.concept.prorrateos?.find(
			(p) => p.id_prorrateo === editingProrateoId.value,
		);
		sumaBase = sumaActualProrrateos - (prorrateoOriginal?.valor_importe ?? 0);
	}

	// 4. La nueva suma propuesta es la base + el nuevo valor del formulario.
	const nuevaSumaPropuesta = sumaBase + candidatoImporte;

	// 5. Comparamos contra el total del concepto.
	if (nuevaSumaPropuesta > totalConcepto + EPSILON) {
		const restanteReal = Math.max(totalConcepto - sumaBase, 0);
		return {
			isValid: false,
			message: `El importe excede el límite. Máximo disponible: ${formatCurrency(
				restanteReal,
				props.invoice.moneda,
			)}`,
		};
	}

	// Si todo está bien
	return { isValid: true, message: '' };
});
</script>

<template>
    <div class="space-y-4 rounded-md border-t p-4">
        <!-- Encabezado del Formulario -->
        <div class="flex items-center justify-between gap-4">
            <h4 class="flex flex-wrap items-center gap-2 font-semibold">
                {{ formTitle }}
                <span class="text-sm font-normal text-muted-foreground">
                    Restante:
                    {{ formatCurrency(formRemainingSnapshot, invoice.moneda) }}
                </span>
            </h4>
            <div class="flex items-center gap-2">
                <Label for="form-proration-type">Importe</Label>
                <Switch id="form-proration-type" :model-value="isPorcentaje"
                    @update:model-value="isPorcentaje = $event" />
                <Label for="form-proration-type">Porcentaje</Label>
            </div>
        </div>

        <!-- Loading / Error -->
        <div v-if="areCatalogsLoading" class="flex items-center justify-center py-4">
            <LoaderCircle class="h-6 w-6 animate-spin text-primary" />
            <span class="ml-2">Cargando catálogos...</span>
        </div>
        <div v-else-if="areCatalogsInError" class="text-center text-red-500">
            Error al cargar los catálogos. Intenta de nuevo.
        </div>

        <!-- Formulario -->
        <div v-else class="space-y-4">
            <!-- Campos de Catálogo con el nuevo componente -->
            <div class="grid grid-cols-1 gap-4">
                <div class="space-y-1">
                    <Label>Cuenta Contable</Label>
                    <SearchableSelect v-model="newProrateoCuenta" :items="cuentasGasto?.object || []"
                        item-key="NumCuentaMayor" item-value="NumCuentaMayor" item-description="Denominacion"
                        placeholder="Seleccionar cuenta..." search-placeholder="Buscar cuenta..."
                        empty-message="No se encontró la cuenta." />
                </div>
                <div class="space-y-1">
                    <Label>Centro de Costo</Label>
                    <SearchableSelect v-model="newProrateoCentroCosto" :items="centrosCosto?.object || []"
                        item-key="CentroCosto" item-value="CentroCosto" item-description="Descripcion"
                        placeholder="Seleccionar centro de costo..." search-placeholder="Buscar centro de costo..."
                        empty-message="No se encontró el centro de costo." />
                </div>
                <div class="space-y-1">
                    <Label>Indicador Impuesto</Label>
                    <SearchableSelect v-model="newProrateoImpuesto" :items="indicadoresIva?.object || []"
                        item-key="IndImpuesto" item-value="IndImpuesto" item-description="Denominacion"
                        placeholder="Seleccionar indicador..." search-placeholder="Buscar indicador..."
                        empty-message="No se encontró el indicador." />
                </div>
            </div>

            <!-- Campos de Valor -->
            <div class="grid grid-cols-2 gap-4">
				<div class="space-y-1">
					<Label>Importe</Label>
					<Input
						type="number"
						step="0.01"
						:model-value="newProrateoImporte?.toString() ?? ''"
						@update:model-value="handleImporteChange"
						:disabled="prorationType === 'porcentaje'"
						placeholder="0.00"
					/>
				</div>
				<div class="space-y-1">
					<Label>Porcentaje (%)</Label>
					<Input
						type="number"
						step="0.01"
						:model-value="newProrateoPorcentaje?.toString() ?? ''"
						@update:model-value="handlePorcentajeChange"
						:disabled="prorationType === 'importe'"
						placeholder="0.00"
					/>
				</div>
			</div>

            <!-- Validación -->
            <p
				v-if="!validationStatus.isValid"
				class="text-sm text-red-600 dark:text-red-500"
			>
				{{ validationStatus.message }}
			</p>

            <!-- Botones -->
            <div class="flex justify-end gap-2">
				<Button
					variant="ghost"
					type="button"
					@click.stop="handleCancel"
					:disabled="isSaving"
					>Cancelar</Button
				>
				<Button
					type="button"
					@click="handleSave"
					:disabled="isSaving || !validationStatus.isValid"
				>
					<LoaderCircle v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
					{{ mode === 'edit' ? 'Guardar Cambios' : 'Guardar Prorrateo' }}
				</Button>
			</div>
        </div>
    </div>
</template>