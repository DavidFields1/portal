<script setup lang="ts">
import { Pencil, Trash2 } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

import type { Prorrateo } from '@/schemas/prorrateosSchema';
import type { Concept } from '@/schemas/conceptSchemas';
import type { InvoiceMonitor } from '@/schemas/invoiceSchemas';
import ProrrateoForm from './ProrrateoForm.vue';

defineProps<{
    prorateo: Prorrateo;
    concept: Concept;
    invoice: InvoiceMonitor;
    isEditing: boolean;
}>();

defineEmits<{
    edit: [];
    delete: [];
}>();
</script>

<template>
    <div class="space-y-3">
        <!-- Información del Prorrateo -->
        <div class="grid grid-cols-1 items-center gap-4 rounded-lg border bg-card p-4 transition-all md:grid-cols-[2fr_1fr_auto]"
            :class="{
                'border-2 border-primary': isEditing,
            }">
            <div class="space-y-3">
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                        <p class="text-xs text-muted-foreground">Cta. Contable</p>
                        <p class="font-semibold">{{ prorateo.cuenta_contable }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-muted-foreground">Centro Costo</p>
                        <p class="font-semibold">{{ prorateo.centro_costo }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-muted-foreground">Ind. Impuesto</p>
                        <p class="font-semibold">{{ prorateo.indicador_impuesto }}</p>
                    </div>
                </div>
            </div>
            <div class="text-left md:text-right">
                <p class="text-xl font-bold">
                    {{ formatCurrency(prorateo.valor_importe, invoice.moneda) }}
                </p>
                <p class="text-muted-foreground">
                    {{ prorateo.valor_porcentaje.toFixed(2) }}%
                </p>
            </div>
            <div class="flex items-center gap-2 self-start">
                <Button variant="outline" size="icon" class="h-8 w-8" @click="$emit('edit')">
                    <Pencil class="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" class="h-8 w-8" @click="$emit('delete')">
                    <Trash2 class="h-4 w-4" />
                </Button>
            </div>
        </div>

        <!-- Formulario de Edición (SOLO cuando isEditing es true) -->
        <ProrrateoForm v-if="isEditing" :concept="concept" :invoice="invoice" :prorateo="prorateo" mode="edit" />
    </div>
</template>