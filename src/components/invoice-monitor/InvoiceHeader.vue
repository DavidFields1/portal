<script setup lang="ts">
import {
    Building,
    CircleDollarSign,
    Fingerprint,
    FileText,
} from 'lucide-vue-next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import type { InvoiceMonitor } from '@/schemas/invoiceSchemas';

defineProps<{
    invoice: InvoiceMonitor;
}>();
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle class="text-2xl">
                Factura: <span class="text-primary">{{ invoice.uuid }}</span>
            </CardTitle>
            <CardDescription class="text-lg">
                Proveedor: {{ invoice.razonsocial_emisor }}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div class="grid grid-cols-1 gap-x-6 gap-y-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                <div class="space-y-2">
                    <div class="flex items-start gap-3">
                        <Fingerprint class="mt-1 h-5 w-5 text-muted-foreground" />
                        <div>
                            <Label>UUID</Label>
                            <p class="font-mono text-xs leading-tight">{{ invoice.uuid }}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <Building class="h-5 w-5 text-muted-foreground" />
                        <div>
                            <Label>Sociedad</Label>
                            <p class="font-semibold">{{ invoice.sociedad }}</p>
                        </div>
                    </div>
                </div>
                <div class="space-y-2">
                    <div class="flex items-center gap-3">
                        <FileText class="h-5 w-5 text-muted-foreground" />
                        <div>
                            <Label>RFC Emisor</Label>
                            <p class="font-semibold">{{ invoice.rfc_emisor }}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <FileText class="h-5 w-5 text-muted-foreground" />
                        <div>
                            <Label>RFC Receptor</Label>
                            <p class="font-semibold">{{ invoice.rfc_receptor }}</p>
                        </div>
                    </div>
                </div>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-muted-foreground">Subtotal:</span>
                        <span class="font-mono">{{
                            formatCurrency(invoice.subtotal, invoice.moneda)
                        }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-muted-foreground">Impuestos:</span>
                        <span class="font-mono">{{
                            formatCurrency(invoice.total_impuestos_trasladados, invoice.moneda)
                        }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-muted-foreground">Retenciones:</span>
                        <span class="font-mono text-red-500">-{{
                            formatCurrency(invoice.total_impuestos_retenidos, invoice.moneda)
                        }}</span>
                    </div>
                </div>
            </div>
            <Separator class="my-4" />
            <div class="flex flex-col items-end">
                <Label>TOTAL</Label>
                <p class="flex items-center gap-2 text-4xl font-bold">
                    <CircleDollarSign class="h-8 w-8 text-primary" />
                    {{ formatCurrency(invoice.total, invoice.moneda) }}
                </p>
            </div>
        </CardContent>
    </Card>
</template>