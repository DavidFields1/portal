<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowLeft,
  Building,
  Calendar,
  CircleDollarSign,
  Clock,
  CreditCard,
  FileText,
  User,
  Landmark,
  FileJson,
  Download,
  CheckCircle2,
  AlertCircle,
  Wallet,
  ChevronDown,
  FileCode,
} from "lucide-vue-next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuItem from "@/components/ui/dropdown-menu/DropdownMenuItem.vue";

// Obtener el router para la navegación
const router = useRouter();
// const uuid = route.params.uuid as string; // Se obtendría así desde la ruta

// --- Estado y Datos de Ejemplo ---

const isLoading = ref(true);

// Datos del complemento de pago
const complemento = ref({
  uuid: "F1E2D3C4-B5A6-7890-1234-ABCDEF012345",
  num: "345",
  fechaEmision: "2024-07-15T14:30:00Z",
  fechaTimbrado: "2024-07-15T14:32:10Z",
  estatus: "VIGENTE",
  receptorNombre: "Mi Empresa S.A. de C.V.",
  receptorRfc: "MEMS890101ABC",
  emisorNombre: "Proveedor Tecnológico S. de R.L.",
  emisorRfc: "PROV123456ABC",
});

// Datos del pago principal
const pago = ref({
  monto: 25000.75,
  moneda: "MXN",
  formaPago: "03", // Transferencia electrónica de fondos
  fechaPago: "2024-07-14T10:00:00Z",
  sociedad: "1000",
});

// Documentos relacionados en el complemento
const documentosRelacionados = ref([
  {
    uuidFactura: "A1B2-C3D4-E5F6-G7H8",
    folio: "F001",
    serie: "A",
    moneda: "MXN",
    numParcialidad: 1,
    impSaldoAnt: 25000.75,
    impPagado: 15000.5,
    impSaldoInsoluto: 10000.25,
  },
  {
    uuidFactura: "Z9Y8-X7W6-V5U4-T3S2",
    folio: "F002",
    serie: "A",
    moneda: "MXN",
    numParcialidad: 1,
    impSaldoAnt: 10000.25,
    impPagado: 10000.25,
    impSaldoInsoluto: 0.0,
  },
]);

// --- Métodos ---

const goBack = () => {
  // Asumiendo que la lista de complementos está en una ruta llamada 'complements'
  router.push({ name: "complements" });
};

const formatDate = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(
    amount,
  );

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "VIGENTE":
      return "success";
    case "CANCELADO":
      return "destructive";
    default:
      return "outline";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "VIGENTE":
      return CheckCircle2;
    case "CANCELADO":
      return AlertCircle;
    default:
      return AlertCircle;
  }
};

// Simular carga de datos
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
});

// Función para descargar la factura
const downloadPDF = () => {
  console.log(`Descargando Complemento`);
  alert(`Iniciando descarga del PDF para el Complemento`);
};

const downloadXML = () => {
  console.log(`Descargando XML del Complemento`);
  alert(`Iniciando descarga del XML para el Complemento`);
};
</script>

<template>
  <div class="container mx-auto py-6 md:py-10">
    <!-- Fila de botones de acción -->
    <div class="flex justify-between items-center mb-6">
      <Button variant="outline" class="flex items-center gap-2 cursor-pointer" @click="goBack">
        <ArrowLeft class="h-4 w-4" />
        Regresar
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button>
            <Download class="mr-2 h-4 w-4" />
            Descargar
            <ChevronDown class="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem @click="downloadPDF" class="cursor-pointer">
            <FileText class="mr-2 h-4 w-4 text-red-600" />
            <span>Descargar PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="downloadXML" class="cursor-pointer">
            <FileCode class="mr-2 h-4 w-4 text-blue-600" />
            <span>Descargar XML</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div class="space-y-6">
      <!-- Sección 1: Encabezado y datos principales (Diseño actualizado) -->
      <Card class="overflow-hidden">
        <CardHeader>
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle class="text-2xl">
              Complemento de Pago:
              <span class="text-primary font-mono">{{ complemento.num }}</span>
            </CardTitle>
            <Badge :variant="getStatusBadgeVariant(complemento.estatus)" class="text-base capitalize">
              <component :is="getStatusIcon(complemento.estatus)" class="h-4 w-4 mr-1" />
              {{ complemento.estatus }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex flex-col gap-2">
              <h4 class="font-semibold flex items-center gap-2 text-muted-foreground">
                <User class="h-5 w-5" /> Receptor
              </h4>
              <p class="text-lg font-medium">
                {{ complemento.receptorNombre }}
              </p>
              <p class="font-mono text-sm text-muted-foreground">
                {{ complemento.receptorRfc }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <h4 class="font-semibold flex items-center gap-2 text-muted-foreground">
                <Building class="h-5 w-5" /> Emisor
              </h4>
              <p class="text-lg font-medium">{{ complemento.emisorNombre }}</p>
              <p class="font-mono text-sm text-muted-foreground">
                {{ complemento.emisorRfc }}
              </p>
            </div>
          </div>
          <Separator />
          <div class="flex items-center justify-center flex-col gap-2 pt-2">
            <h4 class="text-sm font-semibold text-muted-foreground">
              IMPORTE TOTAL PAGADO
            </h4>
            <p class="text-4xl font-bold tracking-tight flex items-center gap-2">
              <CircleDollarSign class="h-8 w-8 text-primary" />
              {{ formatCurrency(pago.monto, pago.moneda) }}
            </p>
          </div>
        </CardContent>
      </Card>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Sección 2: Datos del Complemento -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <FileJson class="h-5 w-5 text-primary" />
              Datos del Complemento
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <FileText class="h-4 w-4" /> UUID
              </span>
              <span class="font-mono text-md font-bold">{{ complemento.uuid }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <Calendar class="h-4 w-4" /> Fecha de Emisión
              </span>
              <span class="font-semibold">{{
                formatDate(complemento.fechaEmision)
                }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <Clock class="h-4 w-4" /> Fecha de Timbrado
              </span>
              <span class="font-semibold">{{
                formatDate(complemento.fechaTimbrado)
                }}</span>
            </div>
          </CardContent>
        </Card>

        <!-- Sección 3: Datos del Pago -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Wallet class="h-5 w-5 text-primary" />
              Datos del Pago
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <CircleDollarSign class="h-4 w-4" /> Monto
              </span>
              <span class="font-mono font-semibold text-base">{{
                formatCurrency(pago.monto, pago.moneda)
                }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <CreditCard class="h-4 w-4" /> Forma de Pago
              </span>
              <span class="font-semibold">{{ pago.formaPago }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <Calendar class="h-4 w-4" /> Fecha de Pago
              </span>
              <span class="font-semibold">{{ formatDate(pago.fechaPago) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <Landmark class="h-4 w-4" /> Sociedad
              </span>
              <span class="font-semibold">{{ pago.sociedad }}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Sección 4: Documentos Relacionados -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <FileText class="h-5 w-5 text-primary" />
            Documentos Relacionados
          </CardTitle>
        </CardHeader>
        <CardContent class="p-0">
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow class="bg-muted/20">
                  <TableHead>UUID Factura</TableHead>
                  <TableHead class="text-center">Serie</TableHead>
                  <TableHead class="text-center">Folio</TableHead>
                  <TableHead class="text-center">Moneda</TableHead>
                  <TableHead class="text-center">No. Parcialidad</TableHead>
                  <TableHead class="text-right">Saldo Anterior</TableHead>
                  <TableHead class="text-right">Importe Pagado</TableHead>
                  <TableHead class="text-right">Saldo Insoluto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="doc in documentosRelacionados" :key="doc.uuidFactura" class="hover:bg-muted/20">
                  <TableCell class="font-mono text-xs">{{
                    doc.uuidFactura
                    }}</TableCell>
                  <TableCell class="text-center font-mono text-xs">{{
                    doc.serie
                    }}</TableCell>
                  <TableCell class="text-center font-mono text-xs">{{
                    doc.folio
                    }}</TableCell>
                  <TableCell class="text-center">{{ doc.moneda }}</TableCell>
                  <TableCell class="text-center">{{
                    doc.numParcialidad
                    }}</TableCell>
                  <TableCell class="text-right font-mono">
                    {{ formatCurrency(doc.impSaldoAnt, doc.moneda) }}
                  </TableCell>
                  <TableCell class="text-right font-mono font-medium text-primary">
                    {{ formatCurrency(doc.impPagado, doc.moneda) }}
                  </TableCell>
                  <TableCell class="text-right font-mono">
                    {{ formatCurrency(doc.impSaldoInsoluto, doc.moneda) }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
