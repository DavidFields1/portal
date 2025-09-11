<script setup lang="ts">
import { ref, watch } from 'vue';
import { Calendar as CalendarIcon } from 'lucide-vue-next';
import {
    type DateValue,
    getLocalTimeZone,
    today,
} from '@internationalized/date';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { InvoiceMonitor } from '@/schemas/invoiceSchemas';

const props = defineProps<{
    invoice: InvoiceMonitor;
}>();

const descripcion = ref('');
const fechaContabilizacion = ref<DateValue>(today(getLocalTimeZone()));

watch(
    () => props.invoice,
    (newInvoice) => {
        if (newInvoice) {
            descripcion.value = `Factura ${newInvoice.folio || newInvoice.uuid}`;
        }
    },
    { immediate: true }
);

const df = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' });
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle>Datos de Contabilización</CardTitle>
        </CardHeader>
        <CardContent class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div class="space-y-2">
                <Label for="descripcion">Descripción</Label>
                <Input id="descripcion" v-model="descripcion" />
            </div>
            <div class="space-y-2">
                <Label>Fecha</Label>
                <Popover>
                    <PopoverTrigger as-child>
                        <Button variant="outline" class="w-full justify-start text-left font-normal"
                            :class="!fechaContabilizacion && 'text-muted-foreground'">
                            <CalendarIcon class="mr-2 h-4 w-4" />
                            <span>{{
                                fechaContabilizacion
                                    ? df.format(fechaContabilizacion.toDate(getLocalTimeZone()))
                                : 'Seleccionar fecha'
                                }}</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-auto p-0">
                        <Calendar v-model="fechaContabilizacion as DateValue" />
                    </PopoverContent>
                </Popover>
            </div>
        </CardContent>
    </Card>
</template>