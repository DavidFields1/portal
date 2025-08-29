<script setup lang="ts">
import { Separator } from '@/components/ui/separator';
import { useNoPOInvoiceStore } from '@/stores/noPoInvoiceStore';
import { formatCurrency } from '@/lib/utils';

const invoiceStore = useNoPOInvoiceStore();
</script>

<template>
  <div class="space-y-3 text-sm">
    <div class="flex justify-between">
      <span class="text-muted-foreground mr-1">Proveedor:</span>
      <span class="font-medium text-right">{{ invoiceStore.currentSupplierName }}</span>
    </div>
    <Separator />
    <div class="flex justify-between">
      <span class="text-muted-foreground">Archivo PDF:</span>
      <span class="font-medium truncate max-w-[200px]">{{ invoiceStore.selectedPdfFile?.name }}</span>
    </div>
    <div class="flex justify-between">
      <span class="text-muted-foreground">Archivo XML:</span>
      <span class="font-medium truncate max-w-[200px]">{{ invoiceStore.selectedXmlFile?.name }}</span>
    </div>
    <Separator />
    <div class="flex justify-between">
      <span class="text-muted-foreground">Folio:</span>
      <span class="font-medium">{{ invoiceStore.invoiceData.folio }}</span>
    </div>
    <div class="flex justify-between">
      <span class="text-muted-foreground">Moneda:</span>
      <span class="font-medium">{{ invoiceStore.invoiceData.moneda }}</span>
    </div>
    <div class="flex justify-between">
      <span class="text-muted-foreground">Sociedad:</span>
      <span class="font-medium">{{ invoiceStore.invoiceData.sociedad }}</span>
    </div>
    <div class="flex justify-between font-semibold text-base">
      <span class="text-muted-foreground">Importe Total:</span>
      <span class="font-semibold">{{ formatCurrency(invoiceStore.invoiceData.importe, invoiceStore.invoiceData.moneda)
        }}</span>
    </div>
  </div>
</template>
