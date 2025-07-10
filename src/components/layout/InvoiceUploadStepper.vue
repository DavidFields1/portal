<!-- src/components/InvoiceUploadStepper.vue -->
<script setup lang="ts">
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, CheckCircle, FileText } from "lucide-vue-next";

// Definimos las props que este componente recibirá desde la vista principal
const props = defineProps({
  steps: { type: Array, required: true },
  currentStepIndex: { type: Number, required: true },
  selectedGRs: { type: Array, required: true },
  totalSelectedAmount: { type: Number, required: true },
  currentSupplierName: { type: String, default: '' },
  selectedFile: { type: Object as () => File | null, default: null },
  isSubmitting: { type: Boolean, default: false },
  formatCurrency: { type: Function, required: true },
  onNextStep: { type: Function, required: true },
  onPrevStep: { type: Function, required: true },
  onSubmitInvoice: { type: Function, required: true },
  onFileChange: { type: Function, required: true },
  onRemoveFile: { type: Function, required: true },
});

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    props.onFileChange(file)
  }
}
</script>

<template>
  <Card class="flex flex-col h-full border-0 border-l rounded-none">
    <CardHeader>
      <CardTitle>Proceso de Carga</CardTitle>
      <nav aria-label="Progreso de carga" class="mt-4">
        <ol class="space-y-4">
          <!-- @vue-expect-error -->
          <li v-for="(step, index) in steps" :key="step.id" class="flex items-center text-sm">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full mr-3" :class="{
              'bg-primary text-primary-foreground': index === currentStepIndex,
              'bg-green-600 text-white': index < currentStepIndex,
              'bg-muted text-muted-foreground border': index > currentStepIndex
            }">
              <!-- @vue-expect-error -->
              <component v-if="index < currentStepIndex" :is="CheckCircle" class="h-4 w-4" />
              <component v-else :is="step.icon" class="h-4 w-4" />
            </span>
            <span class="font-medium" :class="{
              'text-primary': index === currentStepIndex,
              'text-green-700': index < currentStepIndex,
              'text-muted-foreground': index > currentStepIndex
            }">
              <!-- @vue-expect-error -->
              {{ step.name }}
            </span>
          </li>
        </ol>
      </nav>
    </CardHeader>
    <Separator />
    <CardContent class="mt-4 flex-1 overflow-y-auto">
      <!-- Contenido de los pasos -->
      <div v-if="currentStepIndex === 0" class="text-center text-muted-foreground py-4">
        <p class="text-sm">Selecciona un proveedor para comenzar.</p>
      </div>

      <div v-if="currentStepIndex === 1" class="space-y-4">
        <div v-if="selectedGRs.length === 0" class="text-center text-muted-foreground py-4">
          <p class="text-sm">Selecciona una o más entradas de mercancía para continuar.</p>
        </div>
        <div v-else class="space-y-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-primary">{{ selectedGRs.length }}</div>
            <div class="text-xs text-muted-foreground">entrada(s) seleccionada(s)</div>
          </div>
          <Button size="sm" class="w-full" @click="props.onNextStep">Continuar →</Button>
        </div>
      </div>

      <div v-if="currentStepIndex === 2" class="space-y-4">
        <h4 class="font-semibold">Subir Factura</h4>
        <div class="text-sm text-muted-foreground space-y-2">
          <p>Total: <span class="font-bold text-foreground">{{ formatCurrency(totalSelectedAmount) }}</span></p>
          <p>Proveedor: <span class="font-medium text-foreground">{{ currentSupplierName }}</span></p>
        </div>
        <div
          class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
          <input type="file" id="invoice-upload-stepper" accept=".pdf,.jpg,.jpeg,.png" class="sr-only"
            @change="handleFileChange" />
          <label for="invoice-upload-stepper" class="cursor-pointer">
            <UploadCloud class="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p class="text-sm font-medium mb-1">Haz clic para subir la factura</p>
            <p class="text-xs text-muted-foreground">PDF, JPG, PNG hasta 10MB</p>
          </label>
        </div>
        <div v-if="selectedFile" class="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div class="flex items-center space-x-2">
            <FileText class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm font-medium">{{ selectedFile.name }}</span>
            <Badge variant="secondary" class="text-xs">{{ (selectedFile.size / 1024 / 1024).toFixed(1) }} MB</Badge>
          </div>
          <Button variant="ghost" size="sm" @click="props.onRemoveFile">✕</Button>
        </div>
        <div class="flex space-x-2 pt-4">
          <Button variant="outline" size="sm" class="flex-1" @click="props.onPrevStep">← Volver</Button>
          <Button size="sm" class="flex-1" :disabled="!selectedFile" @click="props.onNextStep">Continuar →</Button>
        </div>
      </div>

      <div v-if="currentStepIndex === 3" class="space-y-4">
        <h4 class="font-semibold">Confirmación Final</h4>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-muted-foreground">Entradas:</span>
            <span class="font-medium">{{ selectedGRs.length }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">Proveedor:</span>
            <span class="font-medium">{{ currentSupplierName }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">Total:</span>
            <span class="font-semibold">{{ formatCurrency(totalSelectedAmount) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">Archivo:</span>
            <span class="font-medium">{{ selectedFile?.name }}</span>
          </div>
        </div>
        <div class="flex space-x-2 pt-4">
          <Button variant="outline" size="sm" class="flex-1" @click="props.onPrevStep" :disabled="isSubmitting">←
            Volver</Button>
          <Button size="sm" class="flex-1" @click="props.onSubmitInvoice" :disabled="isSubmitting">
            <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            <span v-if="isSubmitting">Procesando...</span>
            <span v-else>Confirmar Carga</span>
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
