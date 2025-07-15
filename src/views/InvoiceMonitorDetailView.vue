<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ArrowLeft, ChevronsUpDown, Calendar as CalendarIcon, Trash2, PlusCircle, Building, CircleDollarSign, Fingerprint, Pencil, FileText
} from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { type DateValue, getLocalTimeZone } from "@internationalized/date";
import { toast } from "vue-sonner";

// --- INTERFACES Y DATOS SIMULADOS ---
// NOTA: En una app real, estos datos vendrían de un store (Pinia) o una llamada a API.
interface Prorateo { id: string; cuentaContable: string; centroCosto: string; indicadorImpuesto: string; importe: number; porcentaje: number; }
interface Concepto { id: string; descripcion: string; cantidad: number; unidad: string; valorUnitario: number; importe: number; estatus: 'Pendiente' | 'Completado'; prorrateos: Prorateo[]; }
interface Factura { id: string; folio: string; proveedor: string; sociedad: string; fecha: string; rfcEmisor: string; rfcReceptor: string; subtotal: number; impuestos: number; descuentos: number; retenciones: number; total: number; moneda: string; conceptos: Concepto[]; }

const allInvoices = ref<Factura[]>([
  { id: 'inv_001', folio: 'F-2024-001', proveedor: 'Consultoría Estratégica S.A.', sociedad: '1000', fecha: '2024-07-01', rfcEmisor: 'CES120518XYZ', rfcReceptor: 'CLI987654ABC', subtotal: 15000, impuestos: 2400, descuentos: 0, retenciones: 900, total: 16500, moneda: 'MXN', conceptos: [{ id: 'cpt_1a', descripcion: 'Análisis de Mercado Q3', cantidad: 1, unidad: 'Servicio', valorUnitario: 15000, importe: 15000, estatus: 'Pendiente', prorrateos: [] },] },
  { id: 'inv_002', folio: 'A-2024-105', proveedor: 'Soluciones TI de México S.A. de C.V.', sociedad: '2000', fecha: '2024-07-05', rfcEmisor: 'STM210510ABC', rfcReceptor: 'CLI987654ABC', subtotal: 8500, impuestos: 1360, descuentos: 500, retenciones: 0, total: 9360, moneda: 'MXN', conceptos: [{ id: 'cpt_2a', descripcion: 'Licencia Anual Antivirus (10 Equipos)', cantidad: 1, unidad: 'Paquete', valorUnitario: 5000, importe: 5000, estatus: 'Pendiente', prorrateos: [] }, { id: 'cpt_2b', descripcion: 'Soporte Técnico Remoto (5 Horas)', cantidad: 1, unidad: 'Servicio', valorUnitario: 3500, importe: 3500, estatus: 'Pendiente', prorrateos: [] },] },
  { id: 'inv_003', folio: 'B-2024-033', proveedor: 'Aceros del Norte S. de R.L.', sociedad: '1000', fecha: '2024-07-08', rfcEmisor: 'ANO050822DEF', rfcReceptor: 'IND456123GHI', subtotal: 2500, impuestos: 400, descuentos: 0, retenciones: 0, total: 2900, moneda: 'USD', conceptos: [{ id: 'cpt_3a', descripcion: 'Viga de Acero IPR 10"', cantidad: 10, unidad: 'Pieza', valorUnitario: 250, importe: 2500, estatus: 'Pendiente', prorrateos: [] },] },
  { id: 'inv_004', folio: 'NC-2024-015', proveedor: 'Servicios Creativos Digitales', sociedad: '3000', fecha: '2024-07-15', rfcEmisor: 'SCD180115JKL', rfcReceptor: 'CLI987654ABC', subtotal: -2500, impuestos: -400, descuentos: 0, retenciones: 0, total: -2900, moneda: 'MXN', conceptos: [{ id: 'cpt_4a', descripcion: 'Ajuste por campaña publicitaria de Junio', cantidad: -1, unidad: 'Ajuste', valorUnitario: 2500, importe: -2500, estatus: 'Pendiente', prorrateos: [] },] },
  { id: 'inv_005', folio: 'L-500-2024', proveedor: 'Logística Express del Sureste', sociedad: '2000', fecha: '2024-07-18', rfcEmisor: 'LES150930MNO', rfcReceptor: 'IND456123GHI', subtotal: 8500, impuestos: 1360, descuentos: 0, retenciones: 340, total: 9520, moneda: 'MXN', conceptos: [{ id: 'cpt_5a', descripcion: 'Servicio de Flete Terrestre (Ruta MTY-CDMX)', cantidad: 1, unidad: 'Viaje', valorUnitario: 8500, importe: 8500, estatus: 'Pendiente', prorrateos: [] },] },
]);

// --- ESTADO DE LA VISTA ---
const route = useRoute();
const router = useRouter();
const selectedInvoice = ref<Factura | null>(null);
const descripcion = ref("");
const fechaContabilizacion = ref<DateValue>();
const expandedConceptId = ref<string | null>(null);
const showProrateoFormForConceptId = ref<string | null>(null);
const prorationType = ref<'importe' | 'porcentaje'>('importe');
const editingProrateoId = ref<string | null>(null);

// --- ESTADO DEL FORMULARIO DE PRORRATEO ---
const newProrateoCuenta = ref("");
const newProrateoCentroCosto = ref("");
const newProrateoImpuesto = ref("");
const newProrateoImporte = ref<number | null>(null);
const newProrateoPorcentaje = ref<number | null>(null);

// --- DATOS PARA SELECTS (DUMMY) ---
const cuentasContables = ref([{ value: '401.01', label: '401.01 - Gastos de Venta' }, { value: '402.01', label: '402.01 - Gastos de Administración' }, { value: '121.01', label: '121.01 - Activo Fijo' },]);
const centrosCosto = ref(['Ventas', 'Marketing', 'IT', 'Administración']);
const indicadoresImpuesto = ref(['IVA 16%', 'IVA 0%', 'Exento']);

// --- MÉTODOS ---
onMounted(() => {
  const invoiceId = route.params.uuid as string;
  const foundInvoice = allInvoices.value.find(inv => inv.id === invoiceId);
  if (foundInvoice) {
    selectedInvoice.value = foundInvoice;
    descripcion.value = `Factura ${foundInvoice.folio}`;
  } else {
    toast.error("Factura no encontrada", { description: "La factura que buscas no existe o fue eliminada." });
    router.replace('/monitor');
  }
});

const goBackToList = () => {
  router.push('/invoices-monitor');
};

const toggleConceptExpansion = (conceptId: string) => {
  expandedConceptId.value = expandedConceptId.value === conceptId ? null : conceptId;
  showProrateoFormForConceptId.value = null;
  editingProrateoId.value = null;
};

const cancelProrateoForm = () => {
  showProrateoFormForConceptId.value = null;
  editingProrateoId.value = null;
};

const showAddProrateoForm = (conceptId: string) => {
  editingProrateoId.value = null;
  newProrateoCuenta.value = "";
  newProrateoCentroCosto.value = "";
  newProrateoImpuesto.value = "";
  newProrateoImporte.value = null;
  newProrateoPorcentaje.value = null;
  showProrateoFormForConceptId.value = conceptId;
};

const editProrateo = (conceptId: string, prorateo: Prorateo) => {
  editingProrateoId.value = prorateo.id;
  newProrateoCuenta.value = prorateo.cuentaContable;
  newProrateoCentroCosto.value = prorateo.centroCosto;
  newProrateoImpuesto.value = prorateo.indicadorImpuesto;
  if (prorationType.value === 'importe') {
    newProrateoImporte.value = prorateo.importe;
    newProrateoPorcentaje.value = null;
  } else {
    newProrateoPorcentaje.value = prorateo.porcentaje;
    newProrateoImporte.value = null;
  }
  showProrateoFormForConceptId.value = conceptId;
};

const saveProrateo = (conceptId: string) => {
  const concept = selectedInvoice.value?.conceptos.find(c => c.id === conceptId);
  if (!concept) return;

  if (!newProrateoCuenta.value || !newProrateoCentroCosto.value || !newProrateoImpuesto.value) {
    toast.error("Todos los campos del prorrateo son obligatorios.");
    return;
  }

  const totalOtrosProrateos = concept.prorrateos
    .filter(p => p.id !== editingProrateoId.value)
    .reduce((sum, p) => sum + p.importe, 0);
  const restante = concept.importe - totalOtrosProrateos;

  let importeAAgregar = 0;
  let porcentajeAAgregar = 0;

  if (prorationType.value === 'importe') {
    if (!newProrateoImporte.value || newProrateoImporte.value <= 0) {
      toast.error("El importe debe ser mayor a cero.");
      return;
    }
    if (newProrateoImporte.value > restante + 0.01) {
      toast.error("El importe del prorrateo excede el monto restante del concepto.");
      return;
    }
    importeAAgregar = newProrateoImporte.value;
    porcentajeAAgregar = (importeAAgregar / concept.importe) * 100;
  } else {
    if (!newProrateoPorcentaje.value || newProrateoPorcentaje.value <= 0 || newProrateoPorcentaje.value > 100) {
      toast.error("El porcentaje debe estar entre 1 y 100.");
      return;
    }
    importeAAgregar = (concept.importe * newProrateoPorcentaje.value) / 100;
    if (importeAAgregar > restante + 0.01) {
      toast.error("El porcentaje del prorrateo excede el monto restante del concepto.");
      return;
    }
    porcentajeAAgregar = newProrateoPorcentaje.value;
  }

  if (editingProrateoId.value) {
    const prorateoToUpdate = concept.prorrateos.find(p => p.id === editingProrateoId.value);
    if (prorateoToUpdate) {
      prorateoToUpdate.cuentaContable = newProrateoCuenta.value;
      prorateoToUpdate.centroCosto = newProrateoCentroCosto.value;
      prorateoToUpdate.indicadorImpuesto = newProrateoImpuesto.value;
      prorateoToUpdate.importe = importeAAgregar;
      prorateoToUpdate.porcentaje = porcentajeAAgregar;
      toast.success("Prorrateo actualizado.");
    }
  } else {
    concept.prorrateos.push({
      id: `pr_${Date.now()}`,
      cuentaContable: newProrateoCuenta.value,
      centroCosto: newProrateoCentroCosto.value,
      indicadorImpuesto: newProrateoImpuesto.value,
      importe: importeAAgregar,
      porcentaje: porcentajeAAgregar,
    });
    toast.success("Prorrateo guardado.");
  }

  const nuevoTotalProrateado = concept.prorrateos.reduce((sum, p) => sum + p.importe, 0);
  concept.estatus = Math.abs(concept.importe - nuevoTotalProrateado) < 0.01 ? 'Completado' : 'Pendiente';

  cancelProrateoForm();
};

const deleteProrateo = (conceptId: string, prorateoId: string) => {
  const concept = selectedInvoice.value?.conceptos.find(c => c.id === conceptId);
  if (!concept) return;
  concept.prorrateos = concept.prorrateos.filter(p => p.id !== prorateoId);
  concept.estatus = 'Pendiente';
  toast.info("Prorrateo eliminado.");
};

const contabilizar = () => {
  const pendientes = selectedInvoice.value?.conceptos.some(c => c.estatus === 'Pendiente');
  if (pendientes) {
    toast.error("No se puede contabilizar. Aún hay conceptos pendientes de prorrateo.");
    return;
  }
  toast.success("¡Factura contabilizada exitosamente! (Simulado)");
};

const formatCurrency = (amount: number, currency: string) => new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount);
const df = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" });

watch(prorationType, (newType) => {
  if (newType === 'importe') {
    newProrateoPorcentaje.value = null;
  } else {
    newProrateoImporte.value = null;
  }
});
</script>

<template>
  <div class="container mx-auto py-6 md:py-10">
    <div v-if="selectedInvoice" class="space-y-6">
      <Button variant="outline" @click="goBackToList" class="flex items-center gap-2">
        <ArrowLeft class="h-4 w-4" /> Volver a la lista de facturas
      </Button>

      <!-- Sección de Información -->
      <Card>
        <CardHeader>
          <CardTitle class="text-2xl">
            Factura: <span class="text-primary">{{ selectedInvoice.folio }}</span>
          </CardTitle>
          <CardDescription class="text-lg">
            Proveedor: {{ selectedInvoice.proveedor }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
            <div class="space-y-2">
              <div class="flex items-start gap-3">
                <Fingerprint class="h-5 w-5 mt-1 text-muted-foreground" />
                <div>
                  <Label>UUID</Label>
                  <p class="font-mono text-xs leading-tight">{{ selectedInvoice.id }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <Building class="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Sociedad</Label>
                  <p class="font-semibold">{{ selectedInvoice.sociedad }}</p>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <FileText class="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>RFC Emisor</Label>
                  <p class="font-semibold">{{ selectedInvoice.rfcEmisor }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <FileText class="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>RFC Receptor</Label>
                  <p class="font-semibold">{{ selectedInvoice.rfcReceptor }}</p>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Subtotal:</span>
                <span class="font-mono">{{ formatCurrency(selectedInvoice.subtotal, selectedInvoice.moneda) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Impuestos:</span>
                <span class="font-mono">{{ formatCurrency(selectedInvoice.impuestos, selectedInvoice.moneda) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Descuentos:</span>
                <span class="font-mono text-red-500">-{{ formatCurrency(selectedInvoice.descuentos,
                  selectedInvoice.moneda) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Retenciones:</span>
                <span class="font-mono text-red-500">-{{ formatCurrency(selectedInvoice.retenciones,
                  selectedInvoice.moneda) }}</span>
              </div>
            </div>
          </div>
          <Separator class="my-4" />
          <div class="flex flex-col items-end">
            <Label>TOTAL</Label>
            <p class="text-4xl font-bold  flex items-center gap-2">
              <CircleDollarSign class="text-primary h-8 w-8" />
              {{ formatCurrency(selectedInvoice.total, selectedInvoice.moneda) }}
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Sección de Descripción y Fecha -->
      <Card>
        <CardHeader>
          <CardTitle>Datos de Contabilización</CardTitle>
        </CardHeader>
        <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <Label for="descripcion">Descripción</Label>
            <Input id="descripcion" v-model="descripcion" />
          </div>
          <div class="space-y-2">
            <Label>Fecha</Label>
            <Popover>
              <PopoverTrigger as-child>
                <Button variant="outline" class="w-full justify-start text-left font-normal"
                  :class="!fechaContabilizacion && 'text-muted-foreground'">
                  <CalendarIcon class="mr-2 h-4 w-4" />
                  <span>{{ fechaContabilizacion ? df.format(fechaContabilizacion.toDate(getLocalTimeZone())) :
                    "Seleccionar fecha" }}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0">
                <Calendar v-model="fechaContabilizacion" />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      <!-- Sección de Prorrateos -->
      <Card>
        <CardHeader>
          <div class="flex justify-between items-center">
            <CardTitle>Prorrateo de Conceptos</CardTitle>
            <div class="flex items-center space-x-2">
              <Label for="proration-type">Importe</Label>
              <Switch id="proration-type" :checked="prorationType === 'porcentaje'"
                @update:checked="(val: boolean) => prorationType = val ? 'porcentaje' : 'importe'" />
              <Label for="proration-type">Porcentaje</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-10"></TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead class="text-center">Cantidad</TableHead>
                <TableHead class="text-center">Unidad</TableHead>
                <TableHead>Importe</TableHead>
                <TableHead>Estatus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-for="concept in selectedInvoice.conceptos" :key="concept.id">
                <TableRow @click="toggleConceptExpansion(concept.id)" class="cursor-pointer">
                  <TableCell><Button variant="ghost" size="icon" class="h-8 w-8">
                      <ChevronsUpDown class="h-4 w-4" />
                    </Button></TableCell>
                  <TableCell class="font-medium">{{ concept.descripcion }}</TableCell>
                  <TableCell class="text-center">{{ concept.cantidad }}</TableCell>
                  <TableCell class="text-center">{{ concept.unidad }}</TableCell>
                  <TableCell>{{ formatCurrency(concept.importe, selectedInvoice.moneda) }}</TableCell>
                  <TableCell>
                    <Badge :variant="concept.estatus === 'Completado' ? 'success' : 'destructive'">{{ concept.estatus }}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow v-if="expandedConceptId === concept.id">
                  <TableCell colspan="6" class="p-4 bg-muted/50">
                    <div class="space-y-4">
                      <div v-if="concept.prorrateos.length > 0" class="space-y-2">
                        <div v-for="p in concept.prorrateos" :key="p.id"
                          class="flex items-center justify-between p-2 border rounded-md">
                          <div class="text-xs">
                            <p><strong>Cta:</strong> {{ p.cuentaContable }} | <strong>CC:</strong> {{ p.centroCosto }} |
                              <strong>Imp:</strong> {{ p.indicadorImpuesto }}
                            </p>
                            <p class="font-bold">{{ formatCurrency(p.importe, selectedInvoice.moneda) }} ({{
                              p.porcentaje.toFixed(2) }}%)</p>
                          </div>
                          <div class="flex gap-2">
                            <Button variant="outline" size="icon" class="h-7 w-7" @click="editProrateo(concept.id, p)">
                              <Pencil class="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" class="h-7 w-7"
                              @click="deleteProrateo(concept.id, p.id)">
                              <Trash2 class="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p v-else class="text-sm text-center text-muted-foreground">No hay prorrateos para este concepto.
                      </p>
                      <div v-if="showProrateoFormForConceptId === concept.id" class="p-4 border-t space-y-4">
                        <h4 class="font-semibold">{{ editingProrateoId ? 'Editar' : 'Nuevo' }} Prorrateo</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div class="space-y-1">
                            <Label>Cuenta Contable</Label>
                            <Select v-model="newProrateoCuenta">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem v-for="cta in cuentasContables" :key="cta.value" :value="cta.value">{{
                                  cta.label }}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div class="space-y-1">
                            <Label>Centro de Costo</Label>
                            <Select v-model="newProrateoCentroCosto">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem v-for="cc in centrosCosto" :key="cc" :value="cc">{{ cc }}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div class="space-y-1">
                            <Label>Indicador Impuesto</Label>
                            <Select v-model="newProrateoImpuesto">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem v-for="imp in indicadoresImpuesto" :key="imp" :value="imp">{{ imp }}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                          <div class="space-y-1">
                            <Label>Importe</Label>
                            <Input type="number" v-model="newProrateoImporte!"
                              :disabled="prorationType !== 'importe'" />
                          </div>
                          <div class="space-y-1">
                            <Label>Porcentaje</Label>
                            <Input type="number" v-model="newProrateoPorcentaje!"
                              :disabled="prorationType !== 'porcentaje'" />
                          </div>
                        </div>
                        <div class="flex justify-end gap-2">
                          <Button variant="ghost" @click="cancelProrateoForm">Cancelar</Button>
                          <Button @click="saveProrateo(concept.id)">Guardar Prorrateo</Button>
                        </div>
                      </div>
                      <Button v-if="showProrateoFormForConceptId !== concept.id && concept.estatus !== 'Completado'"
                        variant="outline" size="sm" class="w-full" @click="showAddProrateoForm(concept.id)">
                        <PlusCircle class="mr-2 h-4 w-4" /> Agregar Prorrateo
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </template>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div class="flex justify-end">
        <Button size="lg" @click="contabilizar">Contabilizar Prorrateos</Button>
      </div>
    </div>
    <div v-else class="text-center py-10">
      <p>Cargando factura...</p>
    </div>
  </div>
</template>
