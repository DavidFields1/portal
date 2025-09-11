<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue';
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
import type { Prorrateo } from '@/schemas/prorrateoSchemas';
import { useProrrateosStore } from '@/stores/prorrateosStore';
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
} = storeToRefs(prorrateosStore);
const { cancelProrateoForm, saveProrateo } = prorrateosStore;

const sociedadFactura = computed(() => props.invoice?.sociedad ?? '');
const areCatalogsEnabled = ref(false);

onMounted(() => {
    areCatalogsEnabled.value = true;
    if (props.mode === 'edit' && props.prorateo) {
        nextTick(() => {
            newProrateoCuenta.value = props.prorateo!.cuenta_contable;
            newProrateoCentroCosto.value = props.prorateo!.centro_costo;
            newProrateoImpuesto.value = props.prorateo!.indicador_impuesto;
            newProrateoImporte.value = props.prorateo!.valor_importe;
            newProrateoPorcentaje.value = props.prorateo!.valor_porcentaje;
        });
    }
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

const handleSave = () => saveProrateo(props.concept, props.invoice.moneda);
const handleCancel = () => cancelProrateoForm();
const formTitle = computed(() => (props.mode === 'edit' ? 'Editar Prorrateo' : 'Nuevo Prorrateo'));
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
                    <Input type="number" step="0.01" :model-value="newProrateoImporte?.toString() ?? ''"
                        @update:model-value="handleImporteChange" :disabled="prorationType === 'porcentaje'"
                        placeholder="0.00" />
                </div>
                <div class="space-y-1">
                    <Label>Porcentaje (%)</Label>
                    <Input type="number" step="0.01" :model-value="newProrateoPorcentaje?.toString() ?? ''"
                        @update:model-value="handlePorcentajeChange" :disabled="prorationType === 'importe'"
                        placeholder="0.00" />
                </div>
            </div>

            <!-- Botones -->
            <div class="flex justify-end gap-2">
                <Button variant="ghost" type="button" @click.stop="handleCancel">Cancelar</Button>
                <Button type="button" @click="handleSave">{{ mode === 'edit' ? 'Guardar Cambios' : 'Guardar Prorrateo'
                }}</Button>
            </div>
        </div>
    </div>
</template>