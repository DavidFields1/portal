<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { usePOInvoiceStore } from '@/stores/poInvoiceStore'
import { AlertCircle } from 'lucide-vue-next'

const invoiceStore = usePOInvoiceStore()
const showConfirmDialog = ref(false)
const isCreating = ref(false)

const handleConfirmSubmit = async () => {
  try {
    isCreating.value = true
    await invoiceStore.createFactura()
    // Si la creación es exitosa, resetear el proceso
    invoiceStore.resetInvoiceProcess()
  } catch (error) {
    console.error('Error al crear la factura:', error)
  } finally {
    isCreating.value = false
    showConfirmDialog.value = false
  }
}
</script>

<template>
  <div class="space-y-2">
    <h4 class="font-semibold">Confirmación Final</h4>
    <div class="space-y-3 text-sm">
      <div class="flex justify-between">
        <span class="text-muted-foreground mr-1">Proveedor:</span>
        <span class="font-medium">{{ invoiceStore.currentSupplierName }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted-foreground">Entradas:</span>
        <span class="font-medium">{{ invoiceStore.selectedGRs.length }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted-foreground">Total Seleccionado:</span>
        <span class="font-semibold">{{ invoiceStore.invoiceData.moneda }} {{ invoiceStore.totalSelectedAmount }}</span>
      </div>
      <Separator />
      <div class="flex justify-between">
        <span class="text-muted-foreground">Archivo PDF:</span>
        <span class="font-medium">{{ invoiceStore.selectedPdfFile?.name }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted-foreground">Archivo XML:</span>
        <span class="font-medium">
          {{
            invoiceStore.selectedXmlFile?.name
              ? invoiceStore.selectedXmlFile.name.length > 30
                ? invoiceStore.selectedXmlFile.name.slice(0, 30) + '...'
                : invoiceStore.selectedXmlFile.name
              : ''
          }}
        </span>
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
        <span class="font-semibold">{{ invoiceStore.invoiceData.importe }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted-foreground">Sociedad:</span>
        <span class="font-medium">{{ invoiceStore.invoiceData.sociedad }}</span>
      </div>
      
      <!-- Información de desviación si existe -->
      <div v-if="invoiceStore.deviationInfo" class="space-y-2">
        <Separator />
        <div class="flex items-center gap-2">
          <AlertCircle class="h-4 w-4 text-amber-600" />
          <span class="text-sm font-medium text-amber-600">Desviación Aplicada</span>
        </div>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-muted-foreground">Diferencia:</span>
            <span class="font-medium text-amber-600">
              {{ invoiceStore.formatCurrency(invoiceStore.deviationInfo.desviacion_permitida, invoiceStore.deviationInfo.moneda) }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">Tolerancia:</span>
            <span class="font-medium">
              {{ invoiceStore.formatCurrency(invoiceStore.deviationInfo.desviacion_permitida, invoiceStore.deviationInfo.moneda) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Botones de navegación -->
    <div class="flex space-x-2 pt-4">
      <Button variant="outline" size="sm" class="flex-1" @click="invoiceStore.prevStep"
        :disabled="invoiceStore.isSubmitting || isCreating">
        ← Volver
      </Button>

      <!-- Alert Dialog para confirmación -->
      <Dialog v-model:open="showConfirmDialog">
        <DialogTrigger asChild>
          <Button size="sm" class="flex-1" :disabled="invoiceStore.isSubmitting || isCreating">
            Confirmar Carga
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Carga de Factura</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cargar esta factura? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div class="py-4">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Proveedor:</span>
                <span class="font-medium">{{ invoiceStore.currentSupplierName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Entradas:</span>
                <span class="font-medium">{{ invoiceStore.selectedGRs.length }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Total:</span>
                <span class="font-semibold">{{ invoiceStore.formatCurrency(invoiceStore.totalSelectedAmount,
                  invoiceStore.invoiceData.moneda) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Folio:</span>
                <span class="font-medium">{{ invoiceStore.invoiceData.folio }}</span>
              </div>
              
              <!-- Información de desviación en el diálogo -->
              <div v-if="invoiceStore.deviationInfo" class="space-y-1">
                <div class="flex items-center gap-2 mt-2">
                  <AlertCircle class="h-3 w-3 text-amber-600" />
                  <span class="text-xs font-medium text-amber-600">Desviación Aplicada</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-muted-foreground">Diferencia:</span>
                  <span class="font-medium text-amber-600">
                    {{ invoiceStore.formatCurrency(invoiceStore.deviationInfo.desviacion_permitida, invoiceStore.deviationInfo.moneda) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" @click="showConfirmDialog = false" :disabled="isCreating">
              Cancelar
            </Button>
            <Button @click="handleConfirmSubmit" :disabled="isCreating">
              <svg v-if="isCreating" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              <span v-if="isCreating">Creando...</span>
              <span v-else>Confirmar</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
</template>
