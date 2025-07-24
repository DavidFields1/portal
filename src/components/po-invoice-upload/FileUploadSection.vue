<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, FileCode } from 'lucide-vue-next'
import { usePOInvoiceStore } from '@/stores/poInvoiceStore'

const invoiceStore = usePOInvoiceStore()

const handlePdfUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    invoiceStore.handleFileUpload({ pdf: file })
  }
}

const handleXmlUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    invoiceStore.handleFileUpload({ xml: file })
  }
}
</script>

<template>
  <div class="space-y-4">
    <h4 class="font-semibold">Subir Factura</h4>
    <div class="text-sm text-muted-foreground space-y-2">
      <p>
        Total:
        <span class="font-bold text-foreground">
          {{ invoiceStore.formatCurrency(invoiceStore.totalSelectedAmount) }}
        </span>
      </p>
      <p>
        Proveedor:
        <span class="font-medium text-foreground">{{ invoiceStore.currentSupplierName }}</span>
      </p>
    </div>

    <!-- PDF Upload -->
    <div
      class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
      <input type="file" id="invoice-upload-pdf" accept=".pdf" class="sr-only" @change="handlePdfUpload" />
      <label for="invoice-upload-pdf" class="cursor-pointer">
        <FileText class="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        <p class="text-sm font-medium mb-1">Haz clic para subir la factura (PDF)</p>
        <p class="text-xs text-muted-foreground">PDF hasta 10MB</p>
      </label>
    </div>

    <!-- XML Upload -->
    <div
      class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
      <input type="file" id="invoice-upload-xml" accept=".xml" class="sr-only" @change="handleXmlUpload" />
      <label for="invoice-upload-xml" class="cursor-pointer">
        <FileCode class="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        <p class="text-sm font-medium mb-1">Haz clic para subir la factura (XML)</p>
        <p class="text-xs text-muted-foreground">XML hasta 10MB</p>
      </label>
    </div>

    <!-- Archivo PDF seleccionado -->
    <div v-if="invoiceStore.selectedPdfFile" class="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div class="flex items-center space-x-2">
        <FileText class="h-4 w-4 text-muted-foreground" />
        <span class="text-sm font-medium">{{ invoiceStore.selectedPdfFile.name }}</span>
        <Badge variant="secondary" class="text-xs">
          {{ (invoiceStore.selectedPdfFile.size / 1024 / 1024).toFixed(1) }} MB
        </Badge>
      </div>
      <Button variant="ghost" size="sm" @click="invoiceStore.removeFile('pdf')">✕</Button>
    </div>

    <!-- Archivo XML seleccionado -->
    <div v-if="invoiceStore.selectedXmlFile" class="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div class="flex items-center space-x-2">
        <FileText class="h-4 w-4 text-muted-foreground" />
        <span class="text-sm font-medium">{{ invoiceStore.selectedXmlFile.name }}</span>
        <Badge variant="secondary" class="text-xs">
          {{ (invoiceStore.selectedXmlFile.size / 1024 / 1024).toFixed(1) }} MB
        </Badge>
      </div>
      <Button variant="ghost" size="sm" @click="invoiceStore.removeFile('xml')">✕</Button>
    </div>

    <!-- Botones de navegación -->
    <div class="flex space-x-2 pt-4">
      <Button variant="outline" size="sm" class="flex-1" @click="invoiceStore.prevStep">← Volver</Button>
      <Button size="sm" class="flex-1" :disabled="!invoiceStore.canProceedToStep3" @click="invoiceStore.nextStep">
        Continuar →
      </Button>
    </div>
  </div>
</template>
