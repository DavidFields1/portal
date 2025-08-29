<script setup lang="ts">
import { onUnmounted, onMounted, ref } from 'vue';
import { useNoPOInvoiceStore } from '@/stores/noPoInvoiceStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  UserIcon,
} from 'lucide-vue-next';
import { formatCurrency } from '@/lib/utils';

// Import child components for the workflow
import NoPoInvoiceDataForm from '../components/no-po-invoice-upload/NoPoInvoiceDataForm.vue';
import NoPoSupplierSelector from '@/components/no-po-invoice-upload/NoPoSupplierSelector.vue';
import NoPoConfirmStep from '@/components/no-po-invoice-upload/NoPOConfirmStep.vue';

const invoiceStore = useNoPOInvoiceStore();

// Estado local para controlar la visibilidad del diálogo de confirmación
const showConfirmDialog = ref(false);

// Estado local para la UI de arrastrar y soltar
const isDraggingXml = ref(false);
const isDraggingPdf = ref(false);

// Hooks de ciclo de vida para inicializar y limpiar el store
onMounted(() => {
  invoiceStore.autoConfigureProvider();
});

onUnmounted(() => {
  invoiceStore.resetProcess();
});

// Funciones de ayuda para la subida de archivos
const handleFileSelect = (event: Event, fileType: 'pdf' | 'xml') => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  invoiceStore.handleFileUpload({ [fileType]: file });
  target.value = ''; // Permite volver a subir el mismo archivo
};

const handleDrop = (event: DragEvent, fileType: 'pdf' | 'xml') => {
  event.preventDefault(); // Prevenir que el navegador abra el archivo
  const file = event.dataTransfer?.files[0];
  if (!file) return;
  if (fileType === 'xml') {
    isDraggingXml.value = false;
    invoiceStore.handleFileUpload({ xml: file });
  } else {
    isDraggingPdf.value = false;
    invoiceStore.handleFileUpload({ pdf: file });
  }
};

const triggerFileInput = (id: string) => document.getElementById(id)?.click();

// Función para manejar el envío desde el diálogo
const handleConfirmSubmit = async () => {
  await invoiceStore.submitInvoice();
  showConfirmDialog.value = false;
};
</script>

<template>
  <div class="container mx-auto py-6 md:py-10">
    <h1 class="mb-6 text-2xl font-bold md:text-3xl">Carga de Factura sin OC</h1>

    <div class="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <!-- COLUMNA IZQUIERDA: Selección de Proveedor (span 3) -->
      <div class="lg:col-span-3">
        <NoPoSupplierSelector />
      </div>

      <!-- COLUMNA CENTRAL: Contenido dinámico del proceso (span 4) -->
      <div class="lg:col-span-4">
        <div v-if="invoiceStore.currentStepIndex > 0">
          <Card>
            <CardHeader>
              <CardTitle>{{ invoiceStore.steps[invoiceStore.currentStepIndex]?.name }}</CardTitle>
              <CardDescription v-if="invoiceStore.getCurrentStepId === 'upload_files'">
                Sube el archivo PDF y el archivo XML de la factura.
              </CardDescription>
              <CardDescription v-if="invoiceStore.getCurrentStepId === 'invoice_data'">
                Completa los siguientes campos requeridos por la factura.
              </CardDescription>
              <CardDescription v-if="invoiceStore.getCurrentStepId === 'confirm'">
                Revisa la información antes de enviar la factura.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent class="mt-4">
              <!-- Paso 2: Subir archivos -->
              <div v-if="invoiceStore.getCurrentStepId === 'upload_files'" class="space-y-6">
                <!-- Upload XML -->
                <div>
                  <input id="xml-input" type="file" class="hidden" accept=".xml,text/xml"
                    @change="(e) => handleFileSelect(e, 'xml')" />
                  <div v-if="invoiceStore.xmlValidationStatus === 'idle'" @click="triggerFileInput('xml-input')"
                    @dragover.prevent="isDraggingXml = true" @dragleave.prevent="isDraggingXml = false"
                    @drop="(e) => handleDrop(e, 'xml')"
                    class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
                    :class="{ 'border-primary bg-muted/50': isDraggingXml }">
                    <UploadCloud class="w-8 h-8 text-muted-foreground mb-2" />
                    <p class="text-sm text-muted-foreground">
                      <span class="font-semibold">Haz clic para buscar</span> o arrastra el XML aquí
                    </p>
                  </div>
                  <Alert v-if="invoiceStore.xmlValidationStatus === 'loading'">
                    <Loader2 class="h-4 w-4 animate-spin" />
                    <AlertTitle>Validando XML...</AlertTitle>
                  </Alert>
                  <Alert v-if="invoiceStore.xmlValidationStatus === 'success'" variant="default"
                    class="flex items-center justify-between border-green-500">
                    <div class="flex items-center min-w-0">
                      <CheckCircle2 class="h-5 w-5 text-green-500 shrink-0" />
                      <div class="ml-3 min-w-0">
                        <AlertTitle class="font-semibold">¡XML Validado!</AlertTitle>
                        <AlertDescription class="text-xs truncate">
                          {{ invoiceStore.selectedXmlFile?.name }}
                        </AlertDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0"
                      @click="invoiceStore.removeFile('xml')">
                      <X class="h-4 w-4" />
                    </Button>
                  </Alert>
                  <Alert v-if="invoiceStore.xmlValidationStatus === 'error'" variant="destructive"
                    class="flex items-center justify-between">
                    <div class="flex items-center min-w-0">
                      <AlertCircle class="h-5 w-5 shrink-0" />
                      <div class="ml-3 min-w-0">
                        <AlertTitle class="font-semibold">Error de Validación</AlertTitle>
                        <AlertDescription class="text-xs">
                          {{ invoiceStore.xmlValidationError }}
                        </AlertDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0"
                      @click="invoiceStore.removeFile('xml')">
                      <X class="h-4 w-4" />
                    </Button>
                  </Alert>
                </div>

                <!-- Upload PDF -->
                <div v-if="invoiceStore.xmlValidationStatus === 'success'">
                  <input id="pdf-input" type="file" class="hidden" accept=".pdf"
                    @change="(e) => handleFileSelect(e, 'pdf')" />
                  <div v-if="!invoiceStore.selectedPdfFile" @click="triggerFileInput('pdf-input')"
                    @dragover.prevent="isDraggingPdf = true" @dragleave.prevent="isDraggingPdf = false"
                    @drop="(e) => handleDrop(e, 'pdf')"
                    class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
                    :class="{ 'border-primary bg-muted/50': isDraggingPdf }">
                    <UploadCloud class="w-8 h-8 text-muted-foreground mb-2" />
                    <p class="text-sm text-muted-foreground">
                      <span class="font-semibold">Haz clic para buscar</span> o arrastra el PDF aquí
                    </p>
                  </div>
                  <Alert v-if="invoiceStore.selectedPdfFile" variant="default"
                    class="flex items-center justify-between border-green-500">
                    <div class="flex items-center min-w-0">
                      <CheckCircle2 class="h-5 w-5 text-green-500 shrink-0" />
                      <div class="ml-3 min-w-0">
                        <AlertTitle class="font-semibold">¡PDF Cargado!</AlertTitle>
                        <AlertDescription class="text-xs truncate">
                          {{ invoiceStore.selectedPdfFile.name }}
                        </AlertDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0"
                      @click="invoiceStore.removeFile('pdf')">
                      <X class="h-4 w-4" />
                    </Button>
                  </Alert>
                </div>
              </div>

              <!-- Paso 3: Datos de Factura -->
              <div v-if="invoiceStore.getCurrentStepId === 'invoice_data'">
                <NoPoInvoiceDataForm />
              </div>

              <!-- Paso 4: Confirmar (Usa el componente simplificado) -->
              <div v-if="invoiceStore.getCurrentStepId === 'confirm'">
                <NoPoConfirmStep />
              </div>
            </CardContent>
          </Card>
        </div>
        <!-- Placeholder mejorado -->
        <Card v-else class="h-full">
          <CardContent class="flex flex-col items-center justify-center text-center h-full pt-0">
            <div class="text-center py-8 text-muted-foreground">
              <UserIcon class="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p class="text-lg font-medium">Selecciona un Proveedor</p>
              <p class="text-sm">para ver sus Ordenes de Compra</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- COLUMNA DERECHA: Stepper y Navegación (span 3) -->
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
                    <component v-if="index < invoiceStore.currentStepIndex" :is="CheckCircle2" class="h-4 w-4" />
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
              <!-- Botones para pasos ANTES de la confirmación -->
              <div v-if="invoiceStore.getCurrentStepId !== 'confirm'">
                <div v-if="invoiceStore.getCurrentStepId === 'select_supplier'">
                  <Button class="w-full" :disabled="!invoiceStore.selectedSupplierId" @click="invoiceStore.nextStep">
                    Continuar →
                  </Button>
                </div>
                <div v-if="invoiceStore.getCurrentStepId === 'upload_files'">
                  <Button class="w-full" :disabled="!invoiceStore.canProceed" @click="invoiceStore.nextStep">
                    Continuar →
                  </Button>
                </div>
              </div>

              <!-- Botones para el paso DE confirmación -->
              <div v-if="invoiceStore.getCurrentStepId === 'confirm'" class="flex space-x-2">
                <Button variant="outline" size="sm" class="flex-1" @click="invoiceStore.prevStep"
                  :disabled="invoiceStore.isSubmitting">
                  ← Volver
                </Button>

                <Dialog v-model:open="showConfirmDialog">
                  <DialogTrigger asChild>
                    <Button size="sm" class="flex-1" :disabled="invoiceStore.isSubmitting">
                      Confirmar Carga
                    </Button>
                  </DialogTrigger>
                  <DialogContent class="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Confirmar Carga de Factura</DialogTitle>
                      <DialogDescription>
                        ¿Estás seguro de que deseas cargar esta factura? Esta acción no se puede
                        deshacer.
                      </DialogDescription>
                    </DialogHeader>
                    <div class="py-4">
                      <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                          <span class="text-muted-foreground">Proveedor:</span>
                          <span class="font-medium">{{ invoiceStore.currentSupplierName }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-muted-foreground">Folio:</span>
                          <span class="font-medium">{{ invoiceStore.invoiceData.folio }}</span>
                        </div>
                        <div class="flex justify-between font-semibold">
                          <span class="text-muted-foreground">Total:</span>
                          <span>{{ formatCurrency(invoiceStore.invoiceData.importe,
                            invoiceStore.invoiceData.moneda) }}</span>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" @click="showConfirmDialog = false"
                        :disabled="invoiceStore.isSubmitting">
                        Cancelar
                      </Button>
                      <Button @click="handleConfirmSubmit" :disabled="invoiceStore.isSubmitting">
                        <Loader2 v-if="invoiceStore.isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5" />
                        <span v-if="invoiceStore.isSubmitting">Procesando...</span>
                        <span v-else>Confirmar</span>
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  </div>
</template>
