<script setup lang="ts">
import { ref, computed } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group' // Importar RadioGroup
import { toast } from "vue-sonner";
import { UploadCloud, CheckCircle, FileText, AlertCircle, Loader2, Search } from "lucide-vue-next"; // Añadir Search

// --- Tipos y Estado del Stepper ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Step { id: string; name: string; icon: any; }
const steps = ref<Step[]>([{ id: "upload", name: "Subir Archivo", icon: UploadCloud }, { id: "validate", name: "Validar Datos", icon: FileText }, { id: "confirm", name: "Confirmar", icon: CheckCircle },]);
const currentStepIndex = ref(0);
const isStepCompleted = ref<boolean[]>([false, false, false]);

// --- Estado de la Factura, Carga y TIPO ---
const invoiceInfo = ref({ client: "Empresa Ejemplo S.L.", number: "FAC-2024-00123", date: "2024-04-28", dueDate: "2024-05-28", totalAmount: 1452.75, currency: "EUR", status: "Pendiente", });
const invoiceType = ref<'withPO' | 'withoutPO'>('withoutPO'); // Estado para el tipo de factura
const selectedPurchaseOrder = ref<{ id: string; number: string; amount: number } | null>(null); // Estado para la OC seleccionada

const uploadedFile = ref<File | null>(null);
const fileName = ref("");
const extractedData = ref<{ [key: string]: string }>({});
const validationErrors = ref<string[]>([]);
const isLoading = ref(false);
const isSearchingPO = ref(false); // Estado para búsqueda de OC

// --- Lógica Computada ---
const currentStep = computed(() => steps.value[currentStepIndex.value]);
const isFirstStep = computed(() => currentStepIndex.value === 0);
const isLastStep = computed(() => currentStepIndex.value === steps.value.length - 1);

// --- Métodos del Stepper y Carga ---
const goToStep = (index: number) => { if (index < currentStepIndex.value && isStepCompleted.value[index]) { currentStepIndex.value = index; } else if (index === currentStepIndex.value) { } };
const nextStep = () => { if (!isLastStep.value) { isStepCompleted.value[currentStepIndex.value] = true; currentStepIndex.value++; } };
const prevStep = () => {
  if (!isFirstStep.value) {
    if (currentStepIndex.value === 1) {
      extractedData.value = {};
      validationErrors.value = [];
      selectedPurchaseOrder.value = null;
    }
    currentStepIndex.value--;
  }
};
const handleFileChange = (event: Event) => { const target = event.target as HTMLInputElement; if (target.files && target.files[0]) { uploadedFile.value = target.files[0]; fileName.value = uploadedFile.value.name; toast.info(`Archivo seleccionado: ${fileName.value}`); isStepCompleted.value.fill(false, currentStepIndex.value + 1); selectedPurchaseOrder.value = null; } else { uploadedFile.value = null; fileName.value = ""; } };
const simulateUploadAndValidation = async () => { if (!uploadedFile.value) { toast.error("Por favor, selecciona un archivo primero."); return; } isLoading.value = true; validationErrors.value = []; extractedData.value = {}; selectedPurchaseOrder.value = null; console.log(`Simulando carga (${invoiceType.value}) y extracción de datos...`); await new Promise(resolve => setTimeout(resolve, 1500)); const success = Math.random() > 0.2; if (success) { extractedData.value = { 'Número Factura': 'FAC-2024-00123', 'Cliente': 'Empresa Ejemplo S.L.', 'Fecha Emisión': '2024-04-28', 'Importe Total': '1452.75 EUR', 'Concepto': 'Servicios de consultoría Abril 2024', }; if (invoiceType.value === 'withPO') { validationErrors.value.push("La OC asociada no se ha encontrado automáticamente (requiere selección manual)."); } else { if (Math.random() > 0.7) { validationErrors.value.push("El NIF del cliente no coincide con nuestros registros."); } } toast.success("Archivo procesado, revisa los datos y completa la validación."); nextStep(); } else { validationErrors.value = ["No se pudo leer el archivo.", "Formato no reconocido."]; toast.error("Error al procesar el archivo."); } isLoading.value = false; };

// Simular búsqueda y selección de OC
const searchAndSelectPO = async () => {
  isSearchingPO.value = true;
  console.log("Simulando búsqueda de OC...");
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Simular encontrar una OC
  selectedPurchaseOrder.value = {
    id: 'po_987',
    number: 'OC-2024-055',
    amount: 1500.00 // Simular un importe ligeramente diferente
  };
  validationErrors.value = validationErrors.value.filter(err => !err.includes("requiere selección manual")); // Limpiar error de selección
  // Añadir nueva validación comparando con la OC
  if (Math.abs(parseFloat(extractedData.value['Importe Total']?.split(' ')[0] || '0') - selectedPurchaseOrder.value.amount) > 1) {
    validationErrors.value.push(`El importe total (${extractedData.value['Importe Total']}) no coincide con el de la OC (${formatCurrency(selectedPurchaseOrder.value.amount, 'EUR')}).`);
  } else {
    toast.success(`OC ${selectedPurchaseOrder.value.number} asociada.`);
  }
  isSearchingPO.value = false;
};

const confirmValidation = () => {
  if (invoiceType.value === 'withPO' && !selectedPurchaseOrder.value) {
    toast.error("Debes seleccionar una Orden de Compra para continuar.");
    return;
  }
  if (validationErrors.value.length > 0 && !confirm("Hay advertencias en la validación. ¿Deseas continuar de todas formas?")) { return; }
  console.log("Datos validados.");
  nextStep();
};
const finalizeUpload = async () => { isLoading.value = true; console.log("Simulando guardado final de la factura...", { type: invoiceType.value, po: selectedPurchaseOrder.value?.id }); await new Promise(resolve => setTimeout(resolve, 1000)); toast.success("¡Factura cargada y registrada exitosamente!"); isLoading.value = false; };
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: currency }).format(amount);
}; // <--- AÑADIR ESTA LLAVE DE CIERRE

</script>


<template>
  <div class="container mx-auto py-6 md:py-10">
    <h1 class="mb-6 text-2xl font-bold md:text-3xl">Carga de Facturas</h1>
    <div class="flex flex-col md:flex-row gap-8 md:items-stretch">
      <!-- {/* Columna Izquierda: Información Previa */} -->
      <aside class="w-full md:w-1/3 lg:w-1/4">
        <Card class="h-full">
          <!-- {/* ... (contenido sin cambios) ... */} -->
          <CardHeader>
            <CardTitle>Información Previa</CardTitle>
            <CardDescription>Datos asociados a esta carga.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4 text-sm">
            <div> <Label class="text-xs text-muted-foreground">Cliente</Label>
              <p>{{ invoiceInfo.client }}</p>
            </div>
            <Separator />
            <div> <Label class="text-xs text-muted-foreground">Número Factura</Label>
              <p>{{ invoiceInfo.number }}</p>
            </div>
            <Separator />
            <div> <Label class="text-xs text-muted-foreground">Fecha Emisión</Label>
              <p>{{ invoiceInfo.date }}</p>
            </div>
            <div> <Label class="text-xs text-muted-foreground">Fecha Vencimiento</Label>
              <p>{{ invoiceInfo.dueDate }}</p>
            </div>
            <Separator />
            <div> <Label class="text-xs text-muted-foreground">Importe Total</Label>
              <p class="font-semibold">{{ formatCurrency(invoiceInfo.totalAmount, invoiceInfo.currency) }}</p>
            </div>
            <Separator />
            <div> <Label class="text-xs text-muted-foreground">Estado Actual</Label>
              <p>
                <Badge :variant="invoiceInfo.status === 'Pendiente' ? 'warning' : 'success'"> {{ invoiceInfo.status }}
                </Badge>
              </p>
            </div>
          </CardContent>
        </Card>
      </aside>

      <!-- {/* Columna Derecha: Stepper */} -->
      <main class="flex-1">
        <Card class="h-full">
          <CardHeader>
            <CardTitle>Pasos de Carga</CardTitle>
            <nav aria-label="Progreso de carga" class="mt-4">
              <!-- {/* ... (stepper visual sin cambios) ... */} -->
              <ol class="flex items-center space-x-4 rtl:space-x-reverse">
                <li v-for="(step, index) in steps" :key="step.id" class="flex items-center text-sm font-medium"> <span
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    :class="{ 'bg-primary text-primary-foreground': index === currentStepIndex, 'bg-green-600 text-white': index < currentStepIndex && isStepCompleted[index], 'bg-muted text-muted-foreground border': index > currentStepIndex || (index < currentStepIndex && !isStepCompleted[index]), 'cursor-pointer hover:bg-accent hover:text-accent-foreground': index < currentStepIndex && isStepCompleted[index] }"
                    @click="goToStep(index)">
                    <component v-if="index < currentStepIndex && isStepCompleted[index]" :is="CheckCircle"
                      class="h-4 w-4" />
                    <component v-else :is="step.icon" class="h-4 w-4" />
                  </span> <span class="ml-2 hidden sm:inline"
                    :class="{ 'text-primary': index === currentStepIndex, 'text-green-700': index < currentStepIndex && isStepCompleted[index], 'text-muted-foreground': index > currentStepIndex || (index < currentStepIndex && !isStepCompleted[index]) }">
                    {{ step.name }} </span>
                  <div v-if="index < steps.length - 1" class="ml-4 h-0.5 w-8 sm:w-12 md:w-16"
                    :class="{ 'bg-green-600': index < currentStepIndex && isStepCompleted[index], 'bg-border': index >= currentStepIndex || !isStepCompleted[index] }">
                  </div>
                </li>
              </ol>
            </nav>
          </CardHeader>
          <Separator />
          <CardContent class="mt-6 min-h-[300px] relative">

            <!-- {/* Paso 1: Subir Archivo (con selección de tipo) */} -->
            <div v-if="currentStep.id === 'upload'" class="space-y-6">
              <!-- {/* Selección de Tipo */} -->
              <div class="space-y-2">
                <Label>Tipo de Factura</Label>
                <RadioGroup v-model="invoiceType" default-value="withoutPO" class="flex gap-4">
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem id="r1" value="withoutPO" />
                    <Label for="r1">Sin Orden de Compra</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem id="r2" value="withPO" />
                    <Label for="r2">Con Orden de Compra</Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <!-- {/* Subida de Archivo */} -->
              <h3 class="text-lg font-semibold">Sube el archivo de la factura</h3>
              <div>
                <Label for="invoice-file">Seleccionar archivo</Label>
                <Input id="invoice-file" type="file" accept=".pdf,.xml,.jpg,.jpeg,.png" @change="handleFileChange"
                  class="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  :disabled="isLoading" />
                <p v-if="fileName" class="mt-2 text-sm text-muted-foreground"> Archivo seleccionado: {{ fileName }} </p>
              </div>
              <Button @click="simulateUploadAndValidation" :disabled="!uploadedFile || isLoading">
                <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
                <UploadCloud v-else class="mr-2 h-4 w-4" />
                Procesar Archivo
              </Button>
            </div>

            <!-- {/* Paso 2: Validar Datos (condicional) */} -->
            <div v-if="currentStep.id === 'validate'" class="space-y-6">
              <h3 class="text-lg font-semibold">Verifica los datos extraídos</h3>

              <!-- {/* Sección para seleccionar OC (si aplica) */} -->
              <div v-if="invoiceType === 'withPO'" class="space-y-4 rounded-md border border-blue-200 bg-blue-50 p-4">
                <h4 class="font-medium text-blue-800">Asociar Orden de Compra</h4>
                <div v-if="!selectedPurchaseOrder" class="flex items-center gap-2">
                  <Input placeholder="Buscar OC por número o proveedor..." class="flex-1" :disabled="isSearchingPO" />
                  <Button @click="searchAndSelectPO" :disabled="isSearchingPO">
                    <Loader2 v-if="isSearchingPO" class="mr-2 h-4 w-4 animate-spin" />
                    <Search v-else class="mr-2 h-4 w-4" />
                    Buscar/Seleccionar
                  </Button>
                </div>
                <div v-else class="text-sm space-y-1">
                  <p>OC Seleccionada: <span class="font-semibold">{{ selectedPurchaseOrder.number }}</span></p>
                  <p>Importe OC: <span class="font-semibold">{{ formatCurrency(selectedPurchaseOrder.amount, 'EUR')
                      }}</span></p>
                  <Button variant="link" size="sm" class="h-auto p-0 text-blue-600"
                    @click="selectedPurchaseOrder = null" :disabled="isSearchingPO">Cambiar OC</Button>
                </div>
              </div>

              <!-- {/* Datos Extraídos (común) */} -->
              <div v-if="Object.keys(extractedData).length > 0" class="space-y-3 rounded-md border p-4">
                <div v-for="(value, key) in extractedData" :key="key" class="flex justify-between text-sm">
                  <span class="text-muted-foreground">{{ key }}:</span>
                  <span class="font-medium text-right">{{ value }}</span>
                </div>
              </div>
              <div v-else class="text-muted-foreground"> No se pudieron extraer datos o el archivo aún no se ha
                procesado. </div>

              <!-- {/* Errores/Advertencias (común) */} -->
              <div v-if="validationErrors.length > 0"
                class="space-y-2 rounded-md border border-yellow-300 bg-yellow-50 p-4">
                <h4 class="flex items-center text-sm font-semibold text-yellow-800">
                  <AlertCircle class="mr-2 h-4 w-4" /> Advertencias de Validación
                </h4>
                <ul class="list-disc list-inside text-xs text-yellow-700 space-y-1">
                  <li v-for="(error, index) in validationErrors" :key="index">{{ error }}</li>
                </ul>
              </div>

              <!-- {/* Botones de Navegación */} -->
              <div class="flex justify-end gap-4">
                <Button variant="outline" @click="prevStep" :disabled="isLoading"> Volver </Button>
                <Button @click="confirmValidation"
                  :disabled="isLoading || Object.keys(extractedData).length === 0 || (invoiceType === 'withPO' && !selectedPurchaseOrder)">
                  <CheckCircle class="mr-2 h-4 w-4" /> Datos Correctos
                </Button>
              </div>
            </div>

            <!-- {/* Paso 3: Confirmar */} -->
            <div v-if="currentStep.id === 'confirm'" class="space-y-6 text-center">
              <CheckCircle class="mx-auto h-16 w-16 text-green-500" />
              <h3 class="text-xl font-semibold">¡Listo para Cargar!</h3>
              <p class="text-muted-foreground"> Se registrará la factura con la información validada. </p>
              <div class="text-sm text-muted-foreground space-y-1 border rounded-md p-3 inline-block text-left">
                <p>Tipo: <span class="font-medium">{{ invoiceType === 'withPO' ? 'Con Orden de Compra'
                  : 'Sin Orden de Compra' }}</span></p>
                <p v-if="selectedPurchaseOrder">OC Asociada: <span class="font-medium">{{ selectedPurchaseOrder.number
                    }}</span></p>
                <p>Archivo: <span class="font-medium">{{ fileName }}</span></p>
              </div>
              <div class="flex justify-center gap-4 pt-4">
                <Button variant="outline" @click="prevStep" :disabled="isLoading"> Revisar Datos </Button>
                <Button @click="finalizeUpload" :disabled="isLoading">
                  <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" /> Confirmar Carga
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>
      </main>
    </div>
  </div>
</template>
