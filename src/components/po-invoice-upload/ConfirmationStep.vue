<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { usePOInvoiceStore } from '@/stores/poInvoiceStore'

const invoiceStore = usePOInvoiceStore()
</script>

<template>
  <div class="space-y-4">
    <h4 class="font-semibold">Confirmación Final</h4>
    <div class="space-y-3 text-sm">
      <div class="flex justify-between">
        <span class="text-muted-foreground">Proveedor:</span>
        <span class="font-medium">{{ invoiceStore.currentSupplierName }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted-foreground">Entradas:</span>
        <span class="font-medium">{{ invoiceStore.selectedGRs.length }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted-foreground">Total Seleccionado:</span>
        <span class="font-semibold">{{ invoiceStore.formatCurrency(invoiceStore.totalSelectedAmount) }}</span>
      </div>
      <Separator />
      <div class="flex justify-between">
        <span class="text-muted-foreground">Archivo PDF:</span>
        <span class="font-medium">{{ invoiceStore.selectedPdfFile?.name }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted-foreground">Archivo XML:</span>
        <span class="font-medium">{{ invoiceStore.selectedXmlFile?.name }}</span>
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
        <span class="text-muted-foreground">Importe:</span>
        <span class="font-semibold">{{ invoiceStore.formatCurrency(invoiceStore.invoiceData.importe || 0) }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted-foreground">Sociedad:</span>
        <span class="font-medium">{{ invoiceStore.invoiceData.sociedad }}</span>
      </div>
    </div>

    <!-- Botones de navegación -->
    <div class="flex space-x-2 pt-4">
      <Button variant="outline" size="sm" class="flex-1" @click="invoiceStore.prevStep"
        :disabled="invoiceStore.isSubmitting">
        ← Volver
      </Button>
      <Button size="sm" class="flex-1" @click="invoiceStore.submitInvoice" :disabled="invoiceStore.isSubmitting">
        <svg v-if="invoiceStore.isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        <span v-if="invoiceStore.isSubmitting">Procesando...</span>
        <span v-else>Confirmar Carga</span>
      </Button>
    </div>
  </div>
</template>
