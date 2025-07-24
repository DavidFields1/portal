<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle } from 'lucide-vue-next'
import { usePOInvoiceStore } from '@/stores/poInvoiceStore'
import FileUploadSection from './FileUploadSection.vue'
import InvoiceDataForm from './InvoiceDataForm.vue'
import ConfirmationStep from './ConfirmationStep.vue'

const invoiceStore = usePOInvoiceStore()
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Proceso de Carga</CardTitle>
      <nav aria-label="Progreso de carga" class="mt-4">
        <ol class="space-y-4">
          <li v-for="(step, index) in invoiceStore.steps" :key="step.id" class="flex items-center text-sm">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full mr-3" :class="{
              'bg-primary text-primary-foreground': index === invoiceStore.currentStepIndex,
              'bg-green-600 text-white': index < invoiceStore.currentStepIndex,
              'bg-muted text-muted-foreground border': index > invoiceStore.currentStepIndex,
            }">
              <component v-if="index < invoiceStore.currentStepIndex" :is="CheckCircle" class="h-4 w-4" />
              <component v-else :is="step.icon" class="h-4 w-4" />
            </span>
            <span class="font-medium" :class="{
              'text-primary': index === invoiceStore.currentStepIndex,
              'text-green-700': index < invoiceStore.currentStepIndex,
              'text-muted-foreground': index > invoiceStore.currentStepIndex,
            }">
              {{ step.name }}
            </span>
          </li>
        </ol>
      </nav>
    </CardHeader>
    <Separator />
    <CardContent class="mt-4">
      <!-- Paso 0: Seleccionar Proveedor -->
      <div v-if="invoiceStore.currentStepIndex === 0" class="text-center text-muted-foreground py-4">
        <p class="text-sm">Selecciona un proveedor para comenzar.</p>
      </div>

      <!-- Paso 1: Seleccionar Entradas -->
      <div v-if="invoiceStore.currentStepIndex === 1" class="space-y-4">
        <div v-if="!invoiceStore.canProceedToStep2" class="text-center text-muted-foreground py-4">
          <p class="text-sm">Selecciona una o más entradas de mercancía para continuar.</p>
        </div>
        <div v-else class="space-y-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-primary">{{ invoiceStore.selectedGRs.length }}</div>
            <div class="text-xs text-muted-foreground">entrada(s) seleccionada(s)</div>
          </div>
          <Button size="sm" class="w-full" @click="invoiceStore.nextStep">Continuar →</Button>
        </div>
      </div>

      <!-- Paso 2: Subir Factura -->
      <div v-if="invoiceStore.currentStepIndex === 2">
        <FileUploadSection />
      </div>

      <!-- Paso 3: Datos de Factura -->
      <div v-if="invoiceStore.currentStepIndex === 3">
        <InvoiceDataForm />
      </div>

      <!-- Paso 4: Confirmar -->
      <div v-if="invoiceStore.currentStepIndex === 4">
        <ConfirmationStep />
      </div>
    </CardContent>
  </Card>
</template>
