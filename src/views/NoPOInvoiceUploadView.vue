<script setup lang="ts">
import { onUnmounted } from 'vue'
import { useNoPOInvoiceStore } from '@/stores/noPoInvoiceStore'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UploadCloud, CheckCircle, FileText, AlertTriangle, LoaderCircle } from 'lucide-vue-next'
import InvoiceDataForm from '@/components/no-po-invoice-upload/InvoiceDataForm.vue'

const invoiceStore = useNoPOInvoiceStore()

const handleFileUpload = (event: Event, type: 'pdf' | 'xml') => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (type === 'pdf') {
    invoiceStore.handleFileUpload({ pdf: file })
  } else {
    invoiceStore.handleFileUpload({ xml: file })
  }
  // Limpiar el input para permitir volver a subir el mismo archivo
  target.value = ''
}

onUnmounted(() => {
  invoiceStore.resetProcess()
})
</script>

<template>
  <div class="container mx-auto py-6 md:py-10">
    <h1 class="mb-6 text-2xl font-bold md:text-3xl">Carga de Factura sin OC</h1>

    <div class="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <!-- COLUMNA IZQUIERDA: Contenido dinámico del paso -->
      <div class="lg:col-span-7">
        <Card>
          <CardHeader>
            <CardTitle>{{ invoiceStore.steps[invoiceStore.currentStepIndex]?.name }}</CardTitle>
            <CardDescription v-if="invoiceStore.getCurrentStepId === 'upload_files'">
              Sube el archivo PDF y el archivo XML de la factura. El XML será validado
              automáticamente.
            </CardDescription>
            <CardDescription v-if="invoiceStore.getCurrentStepId === 'invoice_data'">
              La moneda de tu factura requiere información adicional. Por favor, completa los
              siguientes campos.
            </CardDescription>
            <CardDescription v-if="invoiceStore.getCurrentStepId === 'confirm'">
              Revisa los archivos y la información antes de enviar la factura.
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent class="mt-4">
            <!-- Paso 1: Subir archivos -->
            <div v-if="invoiceStore.getCurrentStepId === 'upload_files'" class="space-y-6">
              <!-- Upload PDF -->
              <div>
                <Label for="pdf-upload" class="block mb-2 font-semibold">Archivo PDF</Label>
                <div
                  class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <input type="file" id="pdf-upload" accept=".pdf" class="sr-only"
                    @change="handleFileUpload($event, 'pdf')" />
                  <label for="pdf-upload" class="cursor-pointer">
                    <UploadCloud class="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                    <p class="text-sm font-medium mb-1">Haz clic para subir el PDF</p>
                    <p class="text-xs text-muted-foreground">Hasta 10MB</p>
                  </label>
                </div>
                <div v-if="invoiceStore.selectedPdfFile"
                  class="flex items-center justify-between p-3 bg-muted rounded-lg mt-2">
                  <div class="flex items-center space-x-2">
                    <FileText class="h-4 w-4 text-green-600" />
                    <span class="text-sm font-medium">{{ invoiceStore.selectedPdfFile.name
                    }}</span>
                  </div>
                  <Button variant="ghost" size="sm" @click="invoiceStore.removeFile('pdf')">✕</Button>
                </div>
              </div>

              <!-- Upload XML -->
              <div>
                <Label for="xml-upload" class="block mb-2 font-semibold">Archivo XML</Label>
                <div
                  class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <input type="file" id="xml-upload" accept=".xml,text/xml" class="sr-only"
                    @change="handleFileUpload($event, 'xml')" />
                  <label for="xml-upload" class="cursor-pointer">
                    <UploadCloud class="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                    <p class="text-sm font-medium mb-1">Haz clic para subir el XML</p>
                    <p class="text-xs text-muted-foreground">Hasta 2MB</p>
                  </label>
                </div>
                <div v-if="invoiceStore.xmlValidationStatus !== 'idle'"
                  class="flex items-center justify-between p-3 rounded-lg mt-2" :class="{
                    'bg-blue-100 text-blue-800': invoiceStore.xmlValidationStatus === 'loading',
                    'bg-green-100 text-green-800': invoiceStore.xmlValidationStatus === 'success',
                    'bg-red-100 text-red-800': invoiceStore.xmlValidationStatus === 'error',
                  }">
                  <div class="flex items-center space-x-2">
                    <LoaderCircle v-if="invoiceStore.xmlValidationStatus === 'loading'" class="h-4 w-4 animate-spin" />
                    <CheckCircle v-if="invoiceStore.xmlValidationStatus === 'success'" class="h-4 w-4" />
                    <AlertTriangle v-if="invoiceStore.xmlValidationStatus === 'error'" class="h-4 w-4" />
                    <div class="text-sm">
                      <p v-if="invoiceStore.xmlValidationStatus === 'loading'" class="font-medium">
                        Validando XML...</p>
                      <p v-if="invoiceStore.xmlValidationStatus === 'success'" class="font-medium">
                        {{ invoiceStore.selectedXmlFile?.name }} (Válido)
                      </p>
                      <p v-if="invoiceStore.xmlValidationStatus === 'error'" class="font-medium">
                        Error de validación</p>
                      <p v-if="invoiceStore.xmlValidationError" class="text-xs">{{
                        invoiceStore.xmlValidationError }}</p>
                    </div>
                  </div>
                  <Button v-if="invoiceStore.xmlValidationStatus !== 'loading'" variant="ghost" size="sm"
                    @click="invoiceStore.removeFile('xml')">✕</Button>
                </div>
              </div>
            </div>

            <!-- Paso 2: Datos de Factura (si es necesario) -->
            <div v-if="invoiceStore.getCurrentStepId === 'invoice_data'">
              <InvoiceDataForm />
            </div>

            <!-- Paso 3: Confirmar -->
            <div v-if="invoiceStore.getCurrentStepId === 'confirm'" class="space-y-6">
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Archivo PDF:</span>
                  <span class="font-medium">{{ invoiceStore.selectedPdfFile?.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Archivo XML:</span>
                  <span class="font-medium">{{ invoiceStore.selectedXmlFile?.name }}</span>
                </div>
                <Separator />
                <div class="flex justify-between font-semibold">
                  <span>Total a Pagar:</span>
                  <span>{{ invoiceStore.invoiceData.importe }} {{ invoiceStore.invoiceData.moneda
                  }}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- COLUMNA DERECHA: Stepper -->
      <div class="lg:col-span-3">
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
            <!-- Botones de Navegación -->
            <div class="pt-4">
              <div v-if="invoiceStore.getCurrentStepId === 'upload_files'" class="flex justify-end">
                <Button class="w-full" :disabled="!invoiceStore.canProceed" @click="invoiceStore.nextStep">
                  Continuar →
                </Button>
              </div>
              <div v-if="invoiceStore.getCurrentStepId === 'confirm'" class="flex space-x-2">
                <Button variant="outline" size="sm" class="flex-1" @click="invoiceStore.prevStep"
                  :disabled="invoiceStore.isSubmitting">
                  ← Volver
                </Button>
                <Button size="sm" class="flex-1" @click="invoiceStore.submitInvoice"
                  :disabled="invoiceStore.isSubmitting">
                  <LoaderCircle v-if="invoiceStore.isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5" />
                  <span v-if="invoiceStore.isSubmitting">Procesando...</span>
                  <span v-else>Confirmar Carga</span>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  </div>
</template>
