<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ChevronsUpDown, LoaderCircle } from 'lucide-vue-next';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useProrrateosQuery } from '@/composables/useProrrateos';

import type { InvoiceMonitor } from '@/schemas/invoiceSchemas';
import type { Concept } from '@/schemas/conceptSchemas';
import ConceptExpansion from './ConceptExpansion.vue';

const props = defineProps<{
    invoice: InvoiceMonitor;
}>();

const expandedConceptId = ref<number | null>(null);
const areProrateosEnabled = ref(false);

const invoiceUuid = computed(() => props.invoice?.uuid ?? null);

const {
    data: prorateosResponse,
    isLoading: isProrateosLoading,
    isError: isProrateosError,
} = useProrrateosQuery(invoiceUuid, {
    enabled: areProrateosEnabled,
});

// Watch para actualizar prorrateos cuando se cargan
watch(prorateosResponse, (newResponse) => {
    if (newResponse?.object && props.invoice?.conceptos) {
        const allProrateos = newResponse.object;
        props.invoice.conceptos.forEach((concept) => {
            concept.prorrateos = allProrateos.filter(
                (p) => p.id_concepto === concept.id_concepto,
            );
        });
    }
});

const toggleConceptExpansion = (conceptId: number) => {
    const isOpening = expandedConceptId.value !== conceptId;
    expandedConceptId.value = isOpening ? conceptId : null;

    if (isOpening && !areProrateosEnabled.value) {
        areProrateosEnabled.value = true;
    }
};
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle>Prorrateo de Conceptos</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead class="w-10"></TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead class="text-center">Cantidad</TableHead>
                        <TableHead class="text-center">Unidad</TableHead>
                        <TableHead>Importe</TableHead>
                        <TableHead>Estatus</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-for="concept in (invoice.conceptos as Concept[])" :key="concept.id_concepto">
                        <TableRow @click="toggleConceptExpansion(concept.id_concepto)" class="cursor-pointer">
                            <TableCell>
                                <Button variant="ghost" size="icon" class="h-8 w-8">
                                    <ChevronsUpDown class="h-4 w-4" />
                                </Button>
                            </TableCell>
                            <TableCell class="font-medium">
                                {{ concept.descripcion }}
                            </TableCell>
                            <TableCell class="text-center">{{ concept.cantidad }}</TableCell>
                            <TableCell class="text-center">{{ concept.unidad }}</TableCell>
                            <TableCell>
                                {{ formatCurrency(concept.importe, invoice.moneda) }}
                            </TableCell>
                            <TableCell>
                                <Badge :variant="concept.estatus === 'Completado' ? 'success' : 'destructive'
                                    ">
                                    {{ concept.estatus }}
                                </Badge>
                            </TableCell>
                        </TableRow>

                        <TableRow v-if="expandedConceptId === concept.id_concepto">
                            <TableCell colspan="6" class="bg-muted/50 p-4">
                                <div v-if="isProrateosLoading" class="flex items-center justify-center py-4">
                                    <LoaderCircle class="h-6 w-6 animate-spin text-primary" />
                                    <span class="ml-2">Cargando prorrateos...</span>
                                </div>
                                <div v-else-if="isProrateosError" class="text-center text-red-500">
                                    Error al cargar los prorrateos.
                                </div>
                                <ConceptExpansion v-else :concept="concept" :invoice="invoice" />
                            </TableCell>
                        </TableRow>
                    </template>
                </TableBody>
            </Table>
        </CardContent>
    </Card>
</template>