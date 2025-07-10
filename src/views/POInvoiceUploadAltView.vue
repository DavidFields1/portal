<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
// import { Toaster } from '@/components/ui/sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "vue-sonner";
import {
  UploadCloud, CheckCircle, FileText, Users, X, ChevronsUpDown, Check
} from "lucide-vue-next";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// 1. Importar lo necesario para la nueva arquitectura
import { useLayoutStore } from "@/stores/layout";
import InvoiceUploadStepper from "@/components/layout/InvoiceUploadStepper.vue";

// --- Estructuras de Datos y Datos Simulados (sin cambios) ---
interface GoodsReceipt { id: string; number: string; material: string; iva: number; date: string; amount: number; itemCount: number; status: 'Pendiente de Factura' | 'Facturado'; poNumber: string; }
interface PurchaseOrder { id: string; number: string; supplier: string; supplierId: string; supplierRfc: string; date: string; totalAmount: number; status: 'Abierta' | 'Cerrada Parcialmente' | 'Cerrada'; goodsReceipts: GoodsReceipt[]; }
const purchaseOrders = ref<PurchaseOrder[]>([{ id: 'po_001', number: 'OC-2024-055', supplier: 'Proveedor A Tech', supplierId: 'supp_A', supplierRfc: 'ATE123456XYZ', date: '2024-05-01', totalAmount: 850.25, status: 'Cerrada Parcialmente', goodsReceipts: [{ id: 'gr_101', number: 'EM-101A', material: 'Laptop Pro 15"', iva: 80.04, date: '2024-05-10', amount: 500.25, itemCount: 5, status: 'Pendiente de Factura', poNumber: 'OC-2024-055' }, { id: 'gr_102', number: 'EM-102A', material: 'Mouse Inalámbrico', iva: 56.00, date: '2024-05-12', amount: 350.00, itemCount: 1, status: 'Facturado', poNumber: 'OC-2024-055' },] }, { id: 'po_003', number: 'OC-2024-059', supplier: 'Proveedor A Tech', supplierId: 'supp_A', supplierRfc: 'ATE123456XYZ', date: '2024-05-05', totalAmount: 1102.50, status: 'Abierta', goodsReceipts: [{ id: 'gr_301', number: 'EM-301A', material: 'Monitor 4K', iva: 96.40, date: '2024-05-14', amount: 602.50, itemCount: 10, status: 'Pendiente de Factura', poNumber: 'OC-2024-059' }, { id: 'gr_302', number: 'EM-302A', material: 'Teclado Mecánico', iva: 80.00, date: '2024-05-15', amount: 500.00, itemCount: 8, status: 'Pendiente de Factura', poNumber: 'OC-2024-059' },] }, { id: 'po_002', number: 'OC-2024-058', supplier: 'Proveedor B Industrial', supplierId: 'supp_B', supplierRfc: 'BIN456789ABC', date: '2024-05-03', totalAmount: 1200.00, status: 'Abierta', goodsReceipts: [{ id: 'gr_201', number: 'EM-201B', material: 'Torno CNC', iva: 192.00, date: '2024-05-11', amount: 1200.00, itemCount: 1, status: 'Pendiente de Factura', poNumber: 'OC-2024-058' },] }, { id: 'po_004', number: 'OC-2024-060', supplier: 'Proveedor C Oficina', supplierId: 'supp_C', supplierRfc: 'COF789123DEF', date: '2024-05-06', totalAmount: 300.00, status: 'Cerrada', goodsReceipts: [{ id: 'gr_401', number: 'EM-401C', material: 'Sillas de Oficina', iva: 48.00, date: '2024-05-16', amount: 300.00, itemCount: 25, status: 'Facturado', poNumber: 'OC-2024-060' },] }, { id: 'po_005', number: 'OC-2024-061', supplier: 'Proveedor C Oficina', supplierId: 'supp_C', supplierRfc: 'COF789123DEF', date: '2024-05-08', totalAmount: 150.00, status: 'Abierta', goodsReceipts: [{ id: 'gr_501', number: 'EM-501C', material: 'Papel Bond (Caja)', iva: 24.00, date: '2024-05-18', amount: 150.00, itemCount: 50, status: 'Pendiente de Factura', poNumber: 'OC-2024-061' },] }, { id: 'po_006', number: 'OC-2024-062', supplier: 'Proveedor D Logística', supplierId: 'supp_D', supplierRfc: 'DLO012345GHI', date: '2024-05-10', totalAmount: 2500.00, status: 'Abierta', goodsReceipts: [{ id: 'gr_601', number: 'EM-601D', material: 'Servicio de Flete Nacional', iva: 400.00, date: '2024-05-20', amount: 2500.00, itemCount: 1, status: 'Pendiente de Factura', poNumber: 'OC-2024-062' },] },]);

// --- Estado del Stepper y Selección (sin cambios) ---
const steps = ref([{ id: "select_supplier", name: "Seleccionar Proveedor", icon: Users }, { id: "select_gr", name: "Seleccionar Entradas", icon: CheckCircle }, { id: "upload_invoice", name: "Subir Factura", icon: UploadCloud }, { id: "confirm", name: "Confirmar", icon: FileText },]);
const currentStepIndex = ref(0);
const isSupplierPopoverOpen = ref(false);
const selectedSupplierId = ref<string | null>(null);
const selectedPOId = ref<string | null>(null);
const selectedGRs = ref<GoodsReceipt[]>([]);
const currentSupplierName = ref<string | null>(null);
const selectedFile = ref<File | null>(null);
const isSubmitting = ref(false);

// --- Lógica Computada (sin cambios) ---
const allSuppliers = computed(() => { const suppliers = new Map<string, { id: string, name: string, rfc: string }>(); purchaseOrders.value.forEach(po => { if (!suppliers.has(po.supplierId)) { suppliers.set(po.supplierId, { id: po.supplierId, name: po.supplier, rfc: po.supplierRfc }); } }); return Array.from(suppliers.values()); });
const filteredPurchaseOrders = computed(() => { if (!selectedSupplierId.value) return []; return purchaseOrders.value.filter(po => po.supplierId === selectedSupplierId.value); });
const selectedPO = computed(() => purchaseOrders.value.find(po => po.id === selectedPOId.value));
const totalSelectedAmount = computed(() => selectedGRs.value.reduce((sum, gr) => sum + gr.amount, 0));
const isSelectionLocked = computed(() => currentStepIndex.value > 1);

// --- Métodos (con pequeños ajustes para eventos) ---
const selectSupplier = (supplier: { id: string, name: string, rfc: string }) => { selectedSupplierId.value = supplier.id; currentSupplierName.value = supplier.name; isSupplierPopoverOpen.value = false; currentStepIndex.value = 1; };
const resetSupplierSelection = () => { selectedSupplierId.value = null; currentSupplierName.value = null; selectedPOId.value = null; selectedGRs.value = []; currentStepIndex.value = 0; };
const selectPO = (poId: string) => { selectedPOId.value = poId; };
const toggleGRSelection = (gr: GoodsReceipt) => { if (gr.status === "Facturado") { toast.info("Esta entrada ya ha sido facturada y no se puede seleccionar."); return; } const idx = selectedGRs.value.findIndex((g) => g.id === gr.id); if (idx !== -1) { selectedGRs.value.splice(idx, 1); } else { selectedGRs.value.push(gr); } };
const removeSelectedGR = (grId: string) => { const idx = selectedGRs.value.findIndex((g) => g.id === grId); if (idx !== -1) { selectedGRs.value.splice(idx, 1); } };
const isGRSelected = (grId: string) => selectedGRs.value.some(g => g.id === grId);
const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

// --- 2. INTEGRACIÓN CON EL LAYOUT STORE ---
const layoutStore = useLayoutStore();

onMounted(() => {
  layoutStore.showRightSidebar(InvoiceUploadStepper, stepperProps.value);
});

onUnmounted(() => {
  layoutStore.hideRightSidebar();
});


watch(selectedSupplierId, (newVal) => { if (!newVal) { resetSupplierSelection(); } });

const nextStep = () => {
  if (currentStepIndex.value < steps.value.length - 1) {
    currentStepIndex.value++;
  }
};

const prevStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--;
  }
};

/**
 * CAMBIO IMPORTANTE: Esta función ahora recibe un objeto `File` directamente,
 * en lugar de un objeto `Event`. El componente hijo se encarga de extraerlo.
 */
const handleFileUpload = (file: File) => {
  // Validaciones de tamaño y tipo (se mantienen igual)
  if (file.size > 10 * 1024 * 1024) { // 10MB
    toast.error('El archivo es demasiado grande', {
      description: 'Por favor selecciona un archivo menor a 10MB'
    });
    return;
  }
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    toast.error('Tipo de archivo no válido', {
      description: 'Solo se permiten archivos PDF, JPG o PNG'
    });
    return;
  }

  // Asignamos el archivo al estado
  selectedFile.value = file;
  toast.success('Archivo cargado correctamente', {
    description: `${file.name} está listo para procesar`
  });
};

/**
 * Esta función ahora solo necesita limpiar el estado.
 * El input del archivo está en el componente hijo.
 */
const removeFile = () => {
  selectedFile.value = null;
};

const fakeApiService = () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 2000));

const submitInvoice = async () => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    await fakeApiService();
    toast.success('Factura cargada exitosamente', {
      description: `Se procesaron ${selectedGRs.value.length} entradas de mercancía.`
    });
    // Reiniciamos todo el proceso
    resetSupplierSelection();
    selectedFile.value = null;
  } catch (error) {
    console.error("Error al cargar la factura:", error);
    toast.error('Error al cargar la factura', {
      description: 'Por favor, inténtalo de nuevo más tarde.'
    });
  } finally {
    isSubmitting.value = false;
  }
};


const stepperProps = computed(() => ({
  steps: steps.value,
  currentStepIndex: currentStepIndex.value,
  selectedGRs: selectedGRs.value,
  totalSelectedAmount: totalSelectedAmount.value,
  currentSupplierName: currentSupplierName.value,
  selectedFile: selectedFile.value,
  isSubmitting: isSubmitting.value,
  formatCurrency: formatCurrency,
  onNextStep: nextStep,
  onPrevStep: prevStep,
  onSubmitInvoice: submitInvoice,
  onFileChange: handleFileUpload,
  onRemoveFile: removeFile,
}));


watch(stepperProps, (newProps) => {
  layoutStore.updateRightSidebarProps(newProps);
});
</script>

<template>
  <!-- <Toaster richColors position="top-right" /> -->
  <div class="container mx-auto py-6 md:py-10">
    <h1 class="mb-6 text-2xl font-bold md:text-3xl">Carga de Factura con OC</h1>
    <!-- 3. El grid ahora es más simple, ya no contiene la 3ra columna -->
    <div class="grid grid-cols-1 lg:grid-cols-7 gap-6">
      <!-- COLUMNA IZQUIERDA: Selección de Proveedor y OC -->
      <div class="lg:col-span-3">
        <Card>
          <!-- Vista de Selección de Proveedor -->
          <template v-if="!selectedSupplierId">
            <CardHeader>
              <CardTitle>Proveedores</CardTitle>
              <CardDescription>Busca y selecciona un proveedor</CardDescription>
            </CardHeader>
            <CardContent>
              <Popover v-model:open="isSupplierPopoverOpen">
                <PopoverTrigger as-child>
                  <Button variant="outline" role="combobox" :aria-expanded="isSupplierPopoverOpen"
                    class="w-full justify-between">
                    {{ currentSupplierName || "Seleccionar proveedor..." }}
                    <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar proveedor..." />
                    <CommandList>
                      <CommandEmpty>No se encontró el proveedor.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem v-for="supplier in allSuppliers" :key="supplier.id" :value="supplier.name"
                          @select="() => selectSupplier(supplier)" class="flex items-center">
                          <Check class="mr-2 h-4 w-4"
                            :class="selectedSupplierId === supplier.id ? 'opacity-100' : 'opacity-0'" />
                          <div class="flex flex-col">
                            <span>{{ supplier.name }}</span>
                            <span class="text-xs text-muted-foreground">{{ supplier.rfc }}</span>
                          </div>
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardContent>
          </template>
          <!-- Vista de Selección de OC -->
          <template v-else>
            <CardHeader>
              <div class="flex justify-between items-center">
                <div>
                  <CardTitle>Órdenes de Compra</CardTitle>
                  <CardDescription>{{ currentSupplierName }}</CardDescription>
                </div>
                <Button variant="outline" size="sm" @click="resetSupplierSelection">Cambiar</Button>
              </div>
            </CardHeader>
            <CardContent class="space-y-2 max-h-[60vh] overflow-y-auto">
              <Button v-for="po in filteredPurchaseOrders" :key="po.id" variant="ghost"
                class="w-full justify-start text-left h-auto flex-col items-start p-3 hover:shadow-sm" :class="{
                  'bg-accent border-l-4 border-l-primary': selectedPOId === po.id,
                }" @click="selectPO(po.id)">
                <div class="flex w-full justify-between items-center">
                  <span class="font-semibold text-sm">{{ po.number }}</span>
                  <Badge variant="outline" class="text-xs">{{ po.status }}</Badge>
                </div>
                <div class="flex w-full justify-between text-xs text-muted-foreground mt-1">
                  <span>{{ po.date }}</span>
                  <span class="font-mono">{{ formatCurrency(po.totalAmount) }}</span>
                </div>
              </Button>
            </CardContent>
          </template>
        </Card>
      </div>

      <!-- COLUMNA CENTRAL: Entradas y Selección -->
      <div class="lg:col-span-4 space-y-4" :class="{ 'opacity-60 pointer-events-none': isSelectionLocked }">
        <Card>
          <CardHeader v-if="selectedPO">
            <CardTitle class="text-lg">Entradas de Mercancía</CardTitle>
            <CardDescription>
              <span class="font-medium">{{ selectedPO.number }}</span> - {{ selectedPO.supplier }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="!selectedPO" class="text-center py-8 text-muted-foreground">
              <FileText class="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p class="text-lg font-medium">Selecciona una orden de compra</p>
              <p class="text-sm">para ver sus entradas de mercancía</p>
            </div>
            <div v-else-if="selectedPO.goodsReceipts.length > 0" class="space-y-3">
              <div v-for="gr in selectedPO.goodsReceipts" :key="gr.id"
                class="rounded-lg border p-3 transition-all hover:shadow-sm" :class="{
                  'opacity-50 cursor-not-allowed': gr.status === 'Facturado',
                }">
                <Label :for="`native-${gr.id}`" class="flex items-start space-x-3 w-full cursor-pointer">
                  <input type="checkbox" :id="`native-${gr.id}`" :checked="isGRSelected(gr.id)"
                    :disabled="gr.status === 'Facturado'"
                    class="w-4 h-4 rounded border-input bg-background text-primary accent-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    @change="toggleGRSelection(gr)" />
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start mb-1">
                      <span class="font-medium text-sm">{{ gr.number }}</span>
                      <span class="font-mono text-sm font-semibold">{{ formatCurrency(gr.amount) }}</span>
                    </div>
                    <p class="font-bold text-sm text-foreground">{{ gr.material }}</p>
                    <div class="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>{{ gr.date }}</span>
                      <span>IVA: {{ formatCurrency(gr.iva) }}</span>
                    </div>
                  </div>
                </Label>
              </div>
            </div>
            <div v-else class="text-center py-6 text-muted-foreground">
              <p>Esta orden no tiene entradas de mercancía</p>
            </div>
          </CardContent>
        </Card>

        <Card v-if="selectedGRs.length > 0">
          <CardHeader>
            <CardTitle class="text-lg flex items-center justify-between">
              <span>Selección Actual</span>
              <Badge variant="secondary">{{ selectedGRs.length }} entrada(s)</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2 mb-4">
              <div v-for="gr in selectedGRs" :key="gr.id"
                class="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted/50">
                <div class="flex-1 min-w-0">
                  <p class="font-medium truncate">{{ gr.number }} - {{ gr.material }}</p>
                  <p class="font-mono text-xs text-muted-foreground">{{ formatCurrency(gr.amount) }}</p>
                </div>
                <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0" @click="removeSelectedGR(gr.id)">
                  <X class="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Separator class="my-3" />
            <div class="flex justify-between items-center font-semibold">
              <span>Total Seleccionado:</span>
              <span class="text-lg">{{ formatCurrency(totalSelectedAmount) }}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
