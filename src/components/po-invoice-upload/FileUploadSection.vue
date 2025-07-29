<script setup lang="ts">
import { ref } from "vue";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  UploadCloud,
  X,
} from "lucide-vue-next";
import { usePOInvoiceStore } from "@/stores/poInvoiceStore";

const invoiceStore = usePOInvoiceStore();
const isDraggingXml = ref(false);
const isDraggingPdf = ref(false);

const handleFileSelect = (event: Event, fileType: 'xml' | 'pdf') => {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;

  const file = target.files[0];
  if (!file) return;

  if (fileType === "xml") {
    invoiceStore.handleFileUpload({ xml: file });
  } else {
    invoiceStore.handleFileUpload({ pdf: file });
  }
};

const handleDrop = (event: DragEvent, fileType: 'xml' | 'pdf') => {
  const file = event.dataTransfer?.files[0];
  if (!file) return;
  if (fileType === "xml") {
    isDraggingXml.value = false;
    invoiceStore.handleFileUpload({ xml: file });
  } else {
    isDraggingPdf.value = false;
    invoiceStore.handleFileUpload({ pdf: file });
  }
};

const triggerXmlInput = () => document.getElementById("xml-input")?.click();
const triggerPdfInput = () => document.getElementById("pdf-input")?.click();
</script>

<template>
  <div class="w-full space-y-8">
    <div class="flex items-start gap-4">
      <div class="flex h-8 w-8 items-center justify-center rounded-full mt-1 shrink-0" :class="{
        'bg-primary text-primary-foreground': invoiceStore.xmlValidationStatus !== 'success',
        'bg-green-500 text-white': invoiceStore.xmlValidationStatus === 'success',
      }">
        <CheckCircle2 v-if="invoiceStore.xmlValidationStatus === 'success'" class="h-5 w-5" />
        <span v-else class="font-bold">1</span>
      </div>

      <div class="flex-1">
        <h3 class="font-semibold text-lg">1. Subir Factura (XML)</h3>
        <p class="text-sm text-muted-foreground">
          El sistema validará la informacion del archivo.
        </p>

        <!-- Área de Drop: se muestra si el estado es 'idle' -->
        <div v-if="invoiceStore.xmlValidationStatus === 'idle'" class="mt-3">
          <input id="xml-input" type="file" class="hidden" accept=".xml,text/xml"
            @change="(e) => handleFileSelect(e, 'xml')" />
          <div
            class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
            :class="{ 'border-primary bg-muted/50': isDraggingXml }" @click="triggerXmlInput"
            @dragover.prevent="isDraggingXml = true" @dragleave.prevent="isDraggingXml = false"
            @drop.prevent="(e) => handleDrop(e, 'xml')">
            <UploadCloud class="w-8 h-8 text-muted-foreground mb-2" />
            <p class="text-sm text-muted-foreground">
              <span class="font-semibold">Haz clic para buscar</span> o arrastra el XML aquí
            </p>
          </div>
        </div>

        <!-- Estados de carga, éxito y error leídos desde el store -->
        <Alert v-if="invoiceStore.xmlValidationStatus === 'loading'" class="mt-3">
          <Loader2 class="h-4 w-4 animate-spin" />
          <AlertTitle>Validando XML...</AlertTitle>
        </Alert>

        <Alert v-if="invoiceStore.xmlValidationStatus === 'success'" variant="default"
          class="mt-3 flex items-center justify-between border border-green-600">
          <div class="flex items-center overflow-hidden">
            <CheckCircle2 class="h-4 w-4 shrink-0" />
            <div class="ml-3">
              <AlertTitle class="text-green-600 font-bold">¡XML Validado!</AlertTitle>
              <AlertDescription class="text-xs truncate">
                {{ invoiceStore.selectedXmlFile?.name }}
              </AlertDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0" @click="invoiceStore.removeFile('xml')">
            <X class="h-4 w-4" />
          </Button>
        </Alert>

        <Alert v-if="invoiceStore.xmlValidationStatus === 'error'" variant="destructive"
          class="mt-3 flex items-center justify-between border border-red-600">
          <div class="flex items-center overflow-hidden">
            <AlertCircle class="h-4 w-4 shrink-0" />
            <div class="ml-3">
              <AlertTitle class="text-red-600 font-bold">Error de Validación</AlertTitle>
              <AlertDescription>
                {{ invoiceStore.xmlValidationError }}
              </AlertDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0" @click="invoiceStore.removeFile('xml')">
            <X class="h-4 w-4" />
          </Button>
        </Alert>
      </div>
    </div>

    <div class="flex items-start gap-4">
      <div class="flex h-8 w-8 items-center justify-center rounded-full mt-1 shrink-0" :class="{
        'bg-muted text-muted-foreground': invoiceStore.xmlValidationStatus !== 'success',
        'bg-primary text-primary-foreground': invoiceStore.xmlValidationStatus === 'success' && !invoiceStore.selectedPdfFile,
        'bg-green-500 text-white': invoiceStore.xmlValidationStatus === 'success' && invoiceStore.selectedPdfFile,
      }">
        <CheckCircle2 v-if="invoiceStore.xmlValidationStatus === 'success' && invoiceStore.selectedPdfFile"
          class="h-5 w-5" />
        <span v-else class="font-bold">2</span>
      </div>

      <div class="flex-1">
        <h3 class="font-semibold text-lg"
          :class="{ 'text-muted-foreground': invoiceStore.xmlValidationStatus !== 'success' }">
          2. Subir Comprobante (PDF)
        </h3>

        <div v-if="invoiceStore.xmlValidationStatus === 'success' && !invoiceStore.selectedPdfFile" class="mt-3">
          <input id="pdf-input" type="file" class="hidden" accept=".pdf,image/*"
            @change="(e) => handleFileSelect(e, 'pdf')" />
          <div
            class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
            :class="{ 'border-primary bg-muted/50': isDraggingPdf }" @click="triggerPdfInput"
            @dragover.prevent="isDraggingPdf = true" @dragleave.prevent="isDraggingPdf = false"
            @drop.prevent="(e) => handleDrop(e, 'pdf')">
            <UploadCloud class="w-8 h-8 text-muted-foreground mb-2" />
            <p class="text-sm text-muted-foreground">
              <span class="font-semibold">Haz clic para buscar</span> o arrastra el PDF aquí
            </p>
          </div>
        </div>

        <Alert v-if="invoiceStore.xmlValidationStatus === 'success' && invoiceStore.selectedPdfFile" variant="default"
          class="mt-3 flex items-center justify-between border border-green-600">
          <div class="flex items-center overflow-hidden">
            <CheckCircle2 class="h-4 w-4 shrink-0" />
            <div class="ml-3">
              <AlertTitle class="text-green-600 font-bold">¡PDF Cargado!</AlertTitle>
              <AlertDescription class="text-xs truncate">
                {{ invoiceStore.selectedPdfFile.name }}
              </AlertDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0" @click="invoiceStore.removeFile('pdf')">
            <X class="h-4 w-4" />
          </Button>
        </Alert>
      </div>
    </div>
    <div class="flex space-x-2 pt-4">
      <Button variant="outline" size="sm" class="flex-1" @click="invoiceStore.prevStep">
        ← Volver
      </Button>
      <Button size="sm" class="flex-1" :disabled="!invoiceStore.canProceedToStep3" @click="invoiceStore.nextStep">
        Continuar →
      </Button>
    </div>
  </div>
</template>
