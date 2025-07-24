<script setup lang="ts">
import { computed, onMounted, onUnmounted, watchEffect } from 'vue'
// import { Toaster } from '@/components/ui/sonner'
import { useLayoutStore } from '@/stores/layoutStore'
import { usePOInvoiceStore } from '@/stores/poInvoiceStore'
import InvoiceUploadStepper from '@/components/layout/InvoiceUploadStepper.vue'
import SupplierSelector from '@/components/po-invoice-upload/SupplierSelector.vue'
import GoodsReceiptsList from '@/components/po-invoice-upload/GoodsReceiptsList.vue'
import SelectedGoodsReceipts from '@/components/po-invoice-upload/SelectedGoodsReceipts.vue'
import ProcessStepper from '@/components/po-invoice-upload/ProcessStepper.vue'


const invoiceStore = usePOInvoiceStore()
const layoutStore = useLayoutStore()

// Props computadas para el stepper lateral
const stepperProps = computed(() => ({
  steps: invoiceStore.steps,
  currentStepIndex: invoiceStore.currentStepIndex,
  selectedGRs: invoiceStore.selectedGRs,
  totalSelectedAmount: invoiceStore.totalSelectedAmount,
  currentSupplierName: invoiceStore.currentSupplierName,
  selectedPdfFile: invoiceStore.selectedPdfFile,
  selectedXmlFile: invoiceStore.selectedXmlFile,
  isSubmitting: invoiceStore.isSubmitting,
  formatCurrency: invoiceStore.formatCurrency,
}))

onMounted(() => {
  layoutStore.showRightSidebar(InvoiceUploadStepper, stepperProps.value)
})

onUnmounted(() => {
  layoutStore.hideRightSidebar()
})

// Watcher para actualizar props del sidebar
watchEffect(() => {
  layoutStore.updateRightSidebarProps(stepperProps.value)
})
</script>

<template>
  <!-- <Toaster richColors position="top-right" /> -->
  <div class="container mx-auto py-6 md:py-10">
    <h1 class="mb-6 text-2xl font-bold md:text-3xl">Carga de Factura con OC</h1>
    <div class="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <!-- COLUMNA IZQUIERDA: Selección de Proveedor y OC -->
      <div class="lg:col-span-3">
        <SupplierSelector />
      </div>

      <!-- COLUMNA CENTRAL: Entradas y Selección -->
      <div class="lg:col-span-4 space-y-4"
        :class="{ 'opacity-60 pointer-events-none': invoiceStore.isSelectionLocked }">
        <GoodsReceiptsList />
        <SelectedGoodsReceipts v-if="invoiceStore.selectedGRs.length > 0" />
      </div>

      <!-- COLUMNA DERECHA: Stepper -->
      <div class="lg:col-span-3">
        <ProcessStepper />
      </div>
    </div>
  </div>
</template>
