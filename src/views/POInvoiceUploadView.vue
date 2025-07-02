<script setup lang="ts">
import { ref, computed } from "vue";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Toaster } from '@/components/ui/sonner'
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

// --- Estructuras de Datos Enriquecidas ---
interface GoodsReceipt {
  id: string;
  number: string;
  date: string;
  amount: number;
  itemCount: number;
  status: 'Pendiente de Factura' | 'Facturado';
  poNumber: string;
}

interface PurchaseOrder {
  id: string;
  number: string;
  supplier: string;
  date: string;
  totalAmount: number;
  status: 'Abierta' | 'Cerrada Parcialmente' | 'Cerrada';
  goodsReceipts: GoodsReceipt[];
}

// --- Datos Simulados Enriquecidos ---
const purchaseOrders = ref<PurchaseOrder[]>([
  {
    id: 'po_001', number: 'OC-2024-055', supplier: 'Proveedor A Tech', date: '2024-05-01', totalAmount: 850.25, status: 'Cerrada Parcialmente',
    goodsReceipts: [
      { id: 'gr_101', number: 'EM-101A', date: '2024-05-10', amount: 500.25, itemCount: 5, status: 'Pendiente de Factura', poNumber: 'OC-2024-055' },
      { id: 'gr_102', number: 'EM-102A', date: '2024-05-12', amount: 350.00, itemCount: 3, status: 'Facturado', poNumber: 'OC-2024-055' },
    ]
  },
  {
    id: 'po_002', number: 'OC-2024-058', supplier: 'Proveedor B Industrial', date: '2024-05-03', totalAmount: 1200.00, status: 'Abierta',
    goodsReceipts: [
      { id: 'gr_201', number: 'EM-201B', date: '2024-05-11', amount: 1200.00, itemCount: 1, status: 'Pendiente de Factura', poNumber: 'OC-2024-058' },
    ]
  },
  {
    id: 'po_003', number: 'OC-2024-059', supplier: 'Proveedor A Tech', date: '2024-05-05', totalAmount: 1102.50, status: 'Abierta',
    goodsReceipts: [
      { id: 'gr_301', number: 'EM-301A', date: '2024-05-14', amount: 602.50, itemCount: 10, status: 'Pendiente de Factura', poNumber: 'OC-2024-059' },
      { id: 'gr_302', number: 'EM-302A', date: '2024-05-15', amount: 500.00, itemCount: 8, status: 'Pendiente de Factura', poNumber: 'OC-2024-059' },
    ]
  },
  {
    id: 'po_004', number: 'OC-2024-060', supplier: 'Proveedor C Oficina', date: '2024-05-06', totalAmount: 300.00, status: 'Cerrada',
    goodsReceipts: [
      { id: 'gr_401', number: 'EM-401C', date: '2024-05-16', amount: 300.00, itemCount: 25, status: 'Facturado', poNumber: 'OC-2024-060' },
    ]
  }
]);

// --- Estado del Stepper ---
const steps = ref([
  { id: "select_gr", name: "Seleccionar Entradas", icon: CheckCircle },
  { id: "upload_invoice", name: "Subir Factura", icon: UploadCloud },
  { id: "confirm", name: "Confirmar", icon: FileText },
]);
const currentStepIndex = ref(0);

// --- Estado de Selección ---
const selectedPOId = ref<string | null>(null);
const selectedGRs = ref<GoodsReceipt[]>([]);
const currentSupplier = ref<string | null>(null);

// --- NUEVAS VARIABLES PARA SUBIDA DE ARCHIVOS ---
const selectedFile = ref<File | null>(null);

// --- Estado de checkboxes ---
const checkboxStates = ref<Record<string, boolean>>({});

// --- Lógica Computada ---
const selectedPO = computed(() => purchaseOrders.value.find(po => po.id === selectedPOId.value));
const totalSelectedAmount = computed(() => selectedGRs.value.reduce((sum, gr) => sum + gr.amount, 0));



// --- Métodos Existentes ---
const selectPO = (poId: string) => {
  selectedPOId.value = poId;
};

const isPOSelectable = (po: PurchaseOrder) => {
  if (!currentSupplier.value) {
    return true;
  }
  return po.supplier === currentSupplier.value;
};

const toggleGRSelection = (gr: GoodsReceipt, supplier: string) => {
  console.log(
    `toggleGRSelection llamada para GR: ${gr.id}. Proveedor: ${supplier}`,
  );

  if (gr.status === "Facturado") {
    toast.info("Esta entrada ya ha sido facturada y no se puede seleccionar.");
    return;
  }

  if (currentSupplier.value === null) {
    console.log(`Primer item. Bloqueando proveedor a: ${supplier}`);
    currentSupplier.value = supplier;
    selectedGRs.value.push(gr);
  } else {
    if (supplier === currentSupplier.value) {
      const idx = selectedGRs.value.findIndex((g) => g.id === gr.id);
      if (idx !== -1) {
        console.log(`Quitando item: ${gr.id}`);
        selectedGRs.value.splice(idx, 1);
      } else {
        console.log(`Añadiendo item: ${gr.id}`);
        selectedGRs.value.push(gr);
      }
    } else {
      toast.error(
        "Solo se pueden seleccionar entradas del mismo proveedor.",
        {
          description: `Proveedor actual: ${currentSupplier.value}. Intentaste añadir de: ${supplier}.`,
        },
      );
      return;
    }
  }

  if (selectedGRs.value.length === 0) {
    console.log("La selección está vacía. Liberando proveedor.");
    currentSupplier.value = null;
  }

  console.log(
    `Función completada. Seleccionados AHORA: ${selectedGRs.value.length}`,
  );


};

// --- NUEVAS FUNCIONES PARA MANEJO DE ARCHIVOS ---
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    // Validar tamaño (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande', {
        description: 'Por favor selecciona un archivo menor a 10MB'
      });
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de archivo no válido', {
        description: 'Solo se permiten archivos PDF, JPG o PNG'
      });
      return;
    }

    selectedFile.value = file;
    toast.success('Archivo cargado correctamente', {
      description: `${file.name} está listo para procesar`
    });
  }
};

const removeFile = () => {
  selectedFile.value = null;
  // Limpiar el input file
  const fileInput = document.getElementById('invoice-upload') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
};

const isSubmitting = ref(false);

const isSelectionLocked = computed(() => currentStepIndex.value > 0);

const fakeApiService = () => {
  return new Promise(resolve => {
    console.log("Enviando datos al backend...");
    setTimeout(() => {
      console.log("Respuesta recibida del backend.");
      resolve({ success: true });
    }, 2000); // Simula un retraso de 2 segundos
  });
};

const isGRSelected = (grId: string) => {
  return selectedGRs.value.some(g => g.id === grId);
};

const submitInvoice = async () => {
  if (isSubmitting.value) return; // Prevenir dobles clics

  isSubmitting.value = true; // Inicia el estado de carga

  try {
    // Llama al servicio simulado y espera la respuesta
    await fakeApiService();

    // Muestra el mensaje de éxito
    toast.success('Factura cargada exitosamente', {
      description: `Se procesaron ${selectedGRs.value.length} entradas de mercancía.`
    });

    // Limpia todo el formulario
    selectedGRs.value = [];
    currentSupplier.value = null;
    selectedFile.value = null;
    selectedPOId.value = null;
    currentStepIndex.value = 0;


  } catch (error) {
    // Manejo de errores en caso de que el servicio falle
    toast.error('Error al cargar la factura', {
      description: 'Por favor, inténtalo de nuevo más tarde.'
    });
    console.error("Error en la llamada al servicio:", error);
  } finally {
    // Detiene el estado de carga, sin importar si hubo éxito o error
    isSubmitting.value = false;
  }
};

// --- Funciones de utilidad ---
const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
const nextStep = () => { if (currentStepIndex.value < steps.value.length - 1) { currentStepIndex.value++; } };
</script>


<template>
  <Toaster richColors position="top-right" />

  <div class="container mx-auto py-6 md:py-10">
    <h1 class="mb-6 text-2xl font-bold md:text-3xl">Carga de Factura con OC</h1>

    <!-- NUEVO LAYOUT: 3 COLUMNAS -->
    <div class="grid grid-cols-1 lg:grid-cols-10 gap-6">

      <!-- COLUMNA IZQUIERDA: Lista de OCs (3/10 del ancho) -->
      <div class="lg:col-span-3" :class="{ 'opacity-60 pointer-events-none': isSelectionLocked }">
        <Card>
          <CardHeader>
            <CardTitle>Órdenes de Compra</CardTitle>
            <CardDescription>Selecciona una orden para ver sus entradas</CardDescription>
          </CardHeader>
          <CardContent class="space-y-2">
            <Button v-for="po in purchaseOrders" :key="po.id" variant="ghost"
              class="w-full justify-start text-left h-auto flex-col items-start p-3 hover:shadow-sm" :class="{
                'bg-accent border-l-4 border-l-primary': selectedPOId === po.id,
                'opacity-50 cursor-not-allowed': !isPOSelectable(po)
              }" :disabled="!isPOSelectable(po)" @click="selectPO(po.id)">

              <div class="flex w-full justify-between items-center">
                <span class="font-semibold text-sm">{{ po.number }}</span>
                <Badge variant="outline" class="text-xs">{{ po.status }}</Badge>
              </div>
              <span class="text-xs text-muted-foreground">{{ po.supplier }}</span>
              <div class="flex w-full justify-between text-xs text-muted-foreground mt-1">
                <span>{{ po.date }}</span>
                <span class="font-mono">{{ formatCurrency(po.totalAmount) }}</span>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      <!-- COLUMNA CENTRAL: Panel Dinámico (4/10 del ancho) -->
      <div class="lg:col-span-4 space-y-4" :class="{ 'opacity-60 pointer-events-none': isSelectionLocked }">

        <!-- SECCIÓN SUPERIOR: Entradas de Mercancía -->
        <Card>
          <CardHeader v-if="selectedPO">
            <CardTitle class="text-lg">Entradas de Mercancía</CardTitle>
            <CardDescription>
              <span class="font-medium">{{ selectedPO.number }}</span> - {{ selectedPO.supplier }}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <!-- Sin OC seleccionada -->
            <div v-if="!selectedPO" class="text-center py-8 text-muted-foreground">
              <FileText class="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p class="text-lg font-medium">Selecciona una orden de compra</p>
              <p class="text-sm">para ver sus entradas de mercancía</p>
            </div>

            <!-- OC seleccionada con entradas -->
            <div v-else-if="selectedPO.goodsReceipts.length > 0" class="space-y-3">
              <div v-for="gr in selectedPO.goodsReceipts" :key="gr.id"
                class="rounded-lg border p-3 transition-all hover:shadow-sm" :class="{
                  'opacity-50 cursor-not-allowed': gr.status === 'Facturado',
                  'border-primary/50 bg-primary/5': checkboxStates[gr.id]
                }">

                <Label :for="`native-${gr.id}`" class="flex items-start space-x-3 w-full cursor-pointer">

                  <input type="checkbox" :id="`native-${gr.id}`" :checked="isGRSelected(gr.id)"
                    :disabled="gr.status === 'Facturado'"
                    class="w-4 h-4 rounded border-input bg-background text-primary accent-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    @change="toggleGRSelection(gr, selectedPO.supplier)" />

                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start mb-1">
                      <span class="font-medium text-sm">{{ gr.number }}</span>
                      <span class="font-mono text-sm font-semibold">{{ formatCurrency(gr.amount) }}</span>
                    </div>
                    <div class="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>{{ gr.date }}</span>
                      <span>{{ gr.itemCount }} ítems</span>
                    </div>
                    <Badge variant="secondary" class="text-xs"
                      :class="{ 'bg-green-100 text-green-800': gr.status === 'Facturado' }">
                      {{ gr.status }}
                    </Badge>
                  </div>
                </Label>
              </div>
            </div>

            <!-- OC sin entradas -->
            <div v-else class="text-center py-6 text-muted-foreground">
              <p>Esta orden no tiene entradas de mercancía</p>
            </div>
          </CardContent>
        </Card>

        <!-- SECCIÓN INFERIOR: Resumen de Selección -->
        <Card v-if="selectedGRs.length > 0">
          <CardHeader>
            <CardTitle class="text-lg flex items-center justify-between">
              <span>Selección Actual</span>
              <Badge variant="secondary">{{ selectedGRs.length }} entrada(s)</Badge>
            </CardTitle>
            <CardDescription>
              Proveedor: <span class="font-medium text-foreground">{{ currentSupplier }}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-2 mb-4">
              <div v-for="gr in selectedGRs" :key="gr.id" class="flex justify-between items-center text-sm">
                <span class="font-medium">{{ gr.number }}</span>
                <span class="font-mono">{{ formatCurrency(gr.amount) }}</span>
              </div>
            </div>
            <Separator class="my-3" />
            <div class="flex justify-between items-center font-semibold">
              <span>Total Seleccionado:</span>
              <span class="text-lg">{{ formatCurrency(totalSelectedAmount) }}</span>
            </div>
            <Button variant="outline" size="sm" class="w-full mt-3" @click="selectedGRs = []; currentSupplier = null">
              Limpiar Selección
            </Button>
          </CardContent>
        </Card>
      </div>

      <!-- COLUMNA DERECHA: Stepper (3/10 del ancho) -->
      <div class="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Proceso de Carga</CardTitle>
            <nav aria-label="Progreso de carga" class="mt-4">
              <!-- Stepper Visual -->
              <ol class="space-y-4">
                <li v-for="(step, index) in steps" :key="step.id" class="flex items-center text-sm">
                  <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full mr-3" :class="{
                    'bg-primary text-primary-foreground': index === currentStepIndex,
                    'bg-green-600 text-white': index < currentStepIndex,
                    'bg-muted text-muted-foreground border': index > currentStepIndex
                  }">
                    <component v-if="index < currentStepIndex" :is="CheckCircle" class="h-4 w-4" />
                    <component v-else :is="step.icon" class="h-4 w-4" />
                  </span>
                  <span class="font-medium" :class="{
                    'text-primary': index === currentStepIndex,
                    'text-green-700': index < currentStepIndex,
                    'text-muted-foreground': index > currentStepIndex
                  }">
                    {{ step.name }}
                  </span>
                </li>
              </ol>
            </nav>
          </CardHeader>
          <Separator />
          <CardContent class="mt-4">
            <!-- Contenido del paso actual -->
            <div v-if="currentStepIndex === 0" class="space-y-4">
              <div v-if="selectedGRs.length === 0" class="text-center text-muted-foreground py-4">
                <p class="text-sm">Selecciona entradas de mercancía para continuar</p>
              </div>
              <div v-else class="space-y-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-primary">{{ selectedGRs.length }}</div>
                  <div class="text-xs text-muted-foreground">entrada(s) seleccionada(s)</div>
                </div>
                <Button @click="nextStep" class="w-full" :disabled="selectedGRs.length === 0">
                  Continuar →
                </Button>
              </div>
            </div>

            <!-- Paso 2: Subir Factura -->
            <div v-if="currentStepIndex === 1" class="space-y-4">
              <h4 class="font-semibold">Subir Factura</h4>
              <div class="text-sm text-muted-foreground space-y-2">
                <p>
                  Total de entradas seleccionadas:
                  <span class="font-bold text-foreground">{{ formatCurrency(totalSelectedAmount) }}</span>
                </p>
                <p>
                  Proveedor:
                  <span class="font-medium text-foreground">{{ currentSupplier }}</span>
                </p>
              </div>

              <!-- Área de subida de archivo -->
              <div
                class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                <input type="file" id="invoice-upload" accept=".pdf,.jpg,.jpeg,.png" class="sr-only"
                  @change="handleFileUpload" />

                <label for="invoice-upload" class="cursor-pointer">
                  <UploadCloud class="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <p class="text-sm font-medium mb-1">Haz clic para subir la factura</p>
                  <p class="text-xs text-muted-foreground">PDF, JPG, PNG hasta 10MB</p>
                </label>
              </div>

              <!-- Archivo seleccionado -->
              <div v-if="selectedFile" class="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div class="flex items-center space-x-2">
                  <FileText class="h-4 w-4 text-muted-foreground" />
                  <span class="text-sm font-medium">{{ selectedFile.name }}</span>
                  <Badge variant="secondary" class="text-xs">
                    {{ (selectedFile.size / 1024 / 1024).toFixed(1) }} MB
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" @click="removeFile">
                  ✕
                </Button>
              </div>

              <!-- Botones de navegación -->
              <div class="flex space-x-2 pt-4">
                <Button variant="outline" size="sm" class="flex-1" @click="currentStepIndex--">
                  ← Volver
                </Button>
                <Button size="sm" class="flex-1" :disabled="!selectedFile" @click="nextStep">
                  Continuar →
                </Button>
              </div>
            </div>

            <!-- Paso 3: Confirmar -->
            <!-- Paso 3: Confirmar -->
            <div v-if="currentStepIndex === 2" class="space-y-4">
              <h4 class="font-semibold">Confirmación Final</h4>

              <!-- Resumen -->
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Entradas:</span>
                  <span class="font-medium">{{ selectedGRs.length }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Proveedor:</span>
                  <span class="font-medium">{{ currentSupplier }}</span>
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

              <!-- Botones finales -->
              <div class="flex space-x-2 pt-4">
                <Button variant="outline" size="sm" class="flex-1" @click="currentStepIndex--" :disabled="isSubmitting">
                  <!-- Deshabilitar si está cargando -->
                  ← Volver
                </Button>
                <Button size="sm" class="flex-1" @click="submitInvoice" :disabled="isSubmitting">
                  <!-- Deshabilitar si está cargando -->

                  <!-- Mostrar un spinner si está cargando -->
                  <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>

                  <!-- Texto del botón -->
                  <span v-if="isSubmitting">Procesando...</span>
                  <span v-else>Confirmar Carga</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>