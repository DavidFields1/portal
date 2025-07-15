<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "vue-sonner";
import { UploadCloud, CheckCircle, FileText } from "lucide-vue-next";

// --- Stepper ---
const steps = [
  { id: "upload_files", name: "Subir Archivos", icon: UploadCloud },
  { id: "confirm", name: "Confirmar", icon: FileText },
];
const currentStepIndex = ref(0);

// --- Estado de archivos ---
const pdfFile = ref<File | null>(null);
const xmlFile = ref<File | null>(null);
const isSubmitting = ref(false);

// --- Métodos para archivos ---
const handlePDFUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo PDF es demasiado grande", {
        description: "Por favor selecciona un archivo menor a 10MB",
      });
      return;
    }
    if (file.type !== "application/pdf") {
      toast.error("Tipo de archivo no válido", {
        description: "Solo se permite PDF para este campo",
      });
      return;
    }
    pdfFile.value = file;
    toast.success("Archivo PDF cargado correctamente", {
      description: `${file.name} está listo para procesar`,
    });
  }
};

const handleXMLUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("El archivo XML es demasiado grande", {
        description: "Por favor selecciona un archivo menor a 2MB",
      });
      return;
    }
    if (
      file.type !== "text/xml" &&
      file.type !== "application/xml" &&
      !file.name.endsWith(".xml")
    ) {
      toast.error("Tipo de archivo no válido", {
        description: "Solo se permite XML para este campo",
      });
      return;
    }
    xmlFile.value = file;
    toast.success("Archivo XML cargado correctamente", {
      description: `${file.name} está listo para procesar`,
    });
  }
};

const removePDF = () => {
  pdfFile.value = null;
  const fileInput = document.getElementById("pdf-upload") as HTMLInputElement;
  if (fileInput) fileInput.value = "";
};
const removeXML = () => {
  xmlFile.value = null;
  const fileInput = document.getElementById("xml-upload") as HTMLInputElement;
  if (fileInput) fileInput.value = "";
};

const nextStep = () => {
  if (currentStepIndex.value < steps.length - 1) currentStepIndex.value++;
};
const prevStep = () => {
  if (currentStepIndex.value > 0) currentStepIndex.value--;
};

const fakeApiService = () =>
  new Promise((resolve) => setTimeout(() => resolve({ success: true }), 2000));

const submitInvoice = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    await fakeApiService();
    toast.success("Factura cargada exitosamente", {
      description: "La factura fue enviada correctamente.",
    });
    pdfFile.value = null;
    xmlFile.value = null;
    currentStepIndex.value = 0;
  } catch (error) {
    console.log(error)
    toast.error("Error al cargar la factura", {
      description: "Por favor, inténtalo de nuevo más tarde.",
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <Toaster richColors position="top-right" />

  <div class="container mx-auto py-6 md:py-10">
    <h1 class="mb-6 text-2xl font-bold md:text-3xl">Carga de Factura sin OC</h1>

    <div class="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <!-- COLUMNA IZQUIERDA: Formulario de carga -->
      <div class="lg:col-span-7">
        <Card>
          <CardHeader>
            <CardTitle>
              <span v-if="currentStepIndex === 0">Subir Archivos</span>
              <span v-else>Confirmación Final</span>
            </CardTitle>
            <CardDescription v-if="currentStepIndex === 0">
              Sube el archivo PDF y el archivo XML de la factura.
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent class="mt-4">
            <!-- Paso 1: Subir archivos -->
            <div v-if="currentStepIndex === 0" class="space-y-6">
              <div>
                <Label for="pdf-upload" class="block mb-2 font-semibold">Archivo PDF de la factura</Label>
                <div
                  class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <input type="file" id="pdf-upload" accept=".pdf" class="sr-only" @change="handlePDFUpload" />
                  <label for="pdf-upload" class="cursor-pointer">
                    <UploadCloud class="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                    <p class="text-sm font-medium mb-1">
                      Haz clic para subir el archivo PDF
                    </p>
                    <p class="text-xs text-muted-foreground">
                      Solo PDF, hasta 10MB
                    </p>
                  </label>
                </div>
                <div v-if="pdfFile" class="flex items-center justify-between p-3 bg-muted rounded-lg mt-2">
                  <div class="flex items-center space-x-2">
                    <FileText class="h-4 w-4 text-muted-foreground" />
                    <span class="text-sm font-medium">{{ pdfFile.name }}</span>
                    <Badge variant="secondary" class="text-xs">
                      {{ (pdfFile.size / 1024 / 1024).toFixed(1) }} MB
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" @click="removePDF">
                    ✕
                  </Button>
                </div>
              </div>

              <div>
                <Label for="xml-upload" class="block mb-2 font-semibold">Archivo XML de la factura</Label>
                <div
                  class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <input type="file" id="xml-upload" accept=".xml" class="sr-only" @change="handleXMLUpload" />
                  <label for="xml-upload" class="cursor-pointer">
                    <UploadCloud class="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                    <p class="text-sm font-medium mb-1">
                      Haz clic para subir el archivo XML
                    </p>
                    <p class="text-xs text-muted-foreground">
                      Solo XML, hasta 2MB
                    </p>
                  </label>
                </div>
                <div v-if="xmlFile" class="flex items-center justify-between p-3 bg-muted rounded-lg mt-2">
                  <div class="flex items-center space-x-2">
                    <FileText class="h-4 w-4 text-muted-foreground" />
                    <span class="text-sm font-medium">{{ xmlFile.name }}</span>
                    <Badge variant="secondary" class="text-xs">
                      {{ (xmlFile.size / 1024).toFixed(1) }} KB
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" @click="removeXML">
                    ✕
                  </Button>
                </div>
              </div>


            </div>

            <!-- Paso 2: Confirmar -->
            <div v-if="currentStepIndex === 1" class="space-y-6">
              <h4 class="font-semibold">Confirmación Final</h4>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Archivo PDF:</span>
                  <span class="font-medium">{{ pdfFile?.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Archivo XML:</span>
                  <span class="font-medium">{{ xmlFile?.name }}</span>
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
                <li v-for="(step, index) in steps" :key="step.id" class="flex items-center text-sm">
                  <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full mr-3" :class="{
                    'bg-primary text-primary-foreground':
                      index === currentStepIndex,
                    'bg-green-600 text-white': index < currentStepIndex,
                    'bg-muted text-muted-foreground border':
                      index > currentStepIndex,
                  }">
                    <component v-if="index < currentStepIndex" :is="CheckCircle" class="h-4 w-4" />
                    <component v-else :is="step.icon" class="h-4 w-4" />
                  </span>
                  <span class="font-medium" :class="{
                    'text-primary': index === currentStepIndex,
                    'text-green-700': index < currentStepIndex,
                    'text-muted-foreground': index > currentStepIndex,
                  }">
                    {{ step.name }}
                  </span>
                </li>
              </ol>
            </nav>
            <div v-if="currentStepIndex == 0" class="flex justify-end pt-4">
              <Button class="w-full" :disabled="!pdfFile || !xmlFile" @click="nextStep">
                Continuar →
              </Button>
            </div>
            <div v-if="currentStepIndex == 1" class="flex space-x-2 pt-4">
              <Button variant="outline" size="sm" class="flex-1" @click="prevStep" :disabled="isSubmitting">
                ← Volver
              </Button>
              <Button size="sm" class="flex-1" @click="submitInvoice" :disabled="isSubmitting">
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
          </CardHeader>
        </Card>
      </div>
    </div>
  </div>
</template>
