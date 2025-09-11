<script setup lang="ts">
import { PlusCircle } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { storeToRefs } from 'pinia';
import type { Concept } from '@/schemas/conceptSchemas';
import type { InvoiceMonitor } from '@/schemas/invoiceSchemas';
import ProrrateoForm from './ProrrateoForm.vue';
import ProrrateoItem from './ProrrateoItem.vue';
import { EPSILON, useProrrateosStore } from '@/stores/prorrateosStore';

defineProps<{
    concept: Concept;
    invoice: InvoiceMonitor;
}>();

const prorrateosStore = useProrrateosStore();
const { showProrateoFormForConceptId, editingProrateoId } = storeToRefs(prorrateosStore);
const { getConceptRemaining, showAddProrateoForm, editProrateo, deleteProrateo } = prorrateosStore;
</script>

<template>
    <div class="space-y-4">
        <!-- Lista de Prorrateos Existentes -->
        <div v-if="concept.prorrateos && concept.prorrateos.length > 0" class="space-y-3">
            <ProrrateoItem v-for="prorateo in concept.prorrateos" :key="prorateo.id_prorrateo" :prorateo="prorateo"
                :concept="concept" :invoice="invoice" :is-editing="prorateo.id_prorrateo === editingProrateoId"
                @edit="editProrateo(concept, prorateo)" @delete="deleteProrateo(concept, prorateo.id_prorrateo)" />
        </div>

        <!-- Mensaje cuando no hay prorrateos -->
        <p v-else-if="!concept.prorrateos || concept.prorrateos.length === 0"
            class="text-center text-sm text-muted-foreground">
            No hay prorrateos para este concepto.
        </p>

        <!-- Formulario de Prorrateo (SOLO para crear nuevos) -->
        <ProrrateoForm v-if="showProrateoFormForConceptId === concept.id_concepto && editingProrateoId === null"
            :concept="concept" :invoice="invoice" mode="create" />

        <!-- Botón para Agregar Prorrateo -->
        <Button v-if="
            showProrateoFormForConceptId !== concept.id_concepto &&
            getConceptRemaining(concept) > EPSILON
        " variant="outline" size="sm" class="w-full" @click="showAddProrateoForm(concept)">
            <PlusCircle class="mr-2 h-4 w-4" /> Agregar Prorrateo
        </Button>
    </div>
</template>