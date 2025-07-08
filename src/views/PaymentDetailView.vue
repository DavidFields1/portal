<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowLeft,
  Building,
  Building2,
  Calendar,
  CircleDollarSign,
  Clock,
  CreditCard,
  FileText,
  Fingerprint,
  User,
  Landmark,
  Receipt,
  Tag,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Globe,
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

// Obtener parámetros de la ruta
const router = useRouter();
// const docContable = route.params.docContable as string;

// Estado
const pago = ref({
  docContable: "1400002341",
  proveedor: "Proveedor Tecnológico S. de R.L.",
  sociedad: "1000",
  moneda: "MXN",
  monto: 25000.75,
  estatus: "CONTABILIZADA",
  fechaDocumento: "2024-06-10T10:00:00Z",
  fechaCarga: "2024-06-11T12:00:00Z",
  formaPago: "Transferencia Electrónica",
  cuentaBancaria: "CLABE 012345678901234567",
  banco: "Banco Nacional de México",
  referencia: "REF-2024-06-10-001",
});

const proveedor = ref({
  nombre: "Proveedor Tecnológico S. de R.L.",
  rfc: "PROV123456ABC",
  calle: "Av. Insurgentes Sur",
  numeroExterior: "1234",
  codigoPostal: "03100",
  municipio: "Benito Juárez",
  ciudad: "Ciudad de México",
  estado: "CDMX",
  pais: "México",
  email: "contacto@proveedortec.com",
  telefono: "+52 55 1234 5678",
});

const facturas = ref([
  {
    uuid: "A1B2-C3D4-E5F6-G7H8",
    tipo: "Factura",
    sociedad: "1000",
    docSAP: "5100001234",
    ejercicioFiscal: "2024",
    emisor: "Proveedor Tecnológico S. de R.L.",
    importe: 15000.5,
    moneda: "MXN",
    fechaTimbrado: "2024-06-01T10:00:00Z",
  },
  {
    uuid: "Z9Y8-X7W6-V5U4-T3S2",
    tipo: "Nota de Crédito",
    sociedad: "1000",
    docSAP: "5100005678",
    ejercicioFiscal: "2024",
    emisor: "Proveedor Tecnológico S. de R.L.",
    importe: 10000.25,
    moneda: "MXN",
    fechaTimbrado: "2024-06-03T09:30:00Z",
  },
]);

const isLoading = ref(true);

// Métodos
const goBack = () => {
  router.push({ name: 'payments' });
};

const goToFacturaDetail = (uuid: string) => {
  router.push({ name: 'invoice-detail', params: { uuid } });
};

const formatDate = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount);

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "CONTABILIZADA": return "success";
    case "ACTIVO": return "secondary";
    default: return "outline";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "CONTABILIZADA": return CheckCircle2;
    case "ACTIVO": return AlertCircle;
    default: return AlertCircle;
  }
};

// Simular carga de datos
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
});
</script>

<template>
  <div class="container mx-auto py-6 md:py-10">
    <!-- Botón de regreso -->
    <Button variant="outline" class="mb-6 flex items-center gap-2 cursor-pointer" @click="goBack">
      <ArrowLeft class="h-4 w-4" />
      Regresar
    </Button>

    <div class="space-y-6">
      <!-- Sección 1: Encabezado y datos principales -->
      <Card class="overflow-hidden">
        <CardHeader>
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle class="text-2xl">
              Pago: <span class="text-primary">{{ pago.docContable }}</span>
            </CardTitle>
            <Badge :variant="getStatusBadgeVariant(pago.estatus)" class="text-base capitalize">
              <component :is="getStatusIcon(pago.estatus)" class="h-4 w-4 mr-1" />
              {{ pago.estatus }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex flex-col gap-2">
              <h4 class="font-semibold flex items-center gap-2 text-muted-foreground">
                <Building2 class="h-5 w-5" /> Proveedor
              </h4>
              <p class="text-lg font-medium">{{ proveedor.nombre }}</p>
              <p class="font-mono text-sm text-muted-foreground">{{ proveedor.rfc }}</p>
            </div>
            <div class="flex flex-col gap-2">
              <h4 class="font-semibold flex items-center gap-2 text-muted-foreground">
                <Landmark class="h-5 w-5" /> Sociedad
              </h4>
              <p class="text-lg font-medium">{{ pago.sociedad }}</p>
              <p class="text-sm text-muted-foreground">{{ formatDate(pago.fechaDocumento) }}</p>
            </div>
          </div>
          <Separator />
          <div class="flex items-center justify-center flex-col gap-2 pt-2">
            <h4 class="text-sm font-semibold text-muted-foreground">IMPORTE TOTAL PAGADO</h4>
            <p class="text-4xl font-bold tracking-tight flex items-center gap-2">
              <CircleDollarSign class="h-8 w-8 text-primary" />
              {{ formatCurrency(pago.monto, pago.moneda) }}
            </p>
          </div>
        </CardContent>
      </Card>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Sección 2: Datos del Pago -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Receipt class="h-5 w-5 text-primary" />
              Datos del Pago
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <Fingerprint class="h-4 w-4" /> Doc. Contable
              </span>
              <span class="font-mono text-sm">{{ pago.docContable }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <Calendar class="h-4 w-4" /> Fecha Documento
              </span>
              <span class="font-semibold">{{ formatDate(pago.fechaDocumento) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <Clock class="h-4 w-4" /> Fecha Carga
              </span>
              <span class="font-semibold">{{ formatDate(pago.fechaCarga) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <CreditCard class="h-4 w-4" /> Forma de Pago
              </span>
              <span class="font-semibold">{{ pago.formaPago }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <Banknote class="h-4 w-4" /> Cuenta Bancaria
              </span>
              <span class="font-mono text-sm">{{ pago.cuentaBancaria }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <Landmark class="h-4 w-4" /> Banco
              </span>
              <span class="font-semibold">{{ pago.banco }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <Tag class="h-4 w-4" /> Referencia
              </span>
              <span class="font-mono text-sm">{{ pago.referencia }}</span>
            </div>
          </CardContent>
        </Card>

        <!-- Sección 3: Datos del Proveedor -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <User class="h-5 w-5 text-primary" />
              Datos del Proveedor
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <Building class="h-4 w-4" /> Nombre
              </span>
              <span class="font-semibold">{{ proveedor.nombre }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <Fingerprint class="h-4 w-4" /> RFC
              </span>
              <span class="font-mono text-sm">{{ proveedor.rfc }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <MapPin class="h-4 w-4" /> Dirección
              </span>
              <span class="text-right">
                {{ proveedor.calle }} {{ proveedor.numeroExterior }},
                CP {{ proveedor.codigoPostal }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <Building2 class="h-4 w-4" /> Ubicación
              </span>
              <span class="text-right">
                {{ proveedor.municipio }}, {{ proveedor.ciudad }}, {{ proveedor.estado }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <Globe class="h-4 w-4" /> País
              </span>
              <span class="font-semibold">{{ proveedor.pais }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <Mail class="h-4 w-4" /> Email
              </span>
              <span class="font-mono text-sm">{{ proveedor.email }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <Phone class="h-4 w-4" /> Teléfono
              </span>
              <span class="font-mono text-sm">{{ proveedor.telefono }}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Sección 4: Facturas Asociadas -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <FileText class="h-5 w-5 text-primary" />
            Facturas Asociadas
          </CardTitle>
        </CardHeader>
        <CardContent class="p-0">
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow class="bg-muted/20">
                  <TableHead>UUID</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead class="text-center">Sociedad</TableHead>
                  <TableHead>Doc. SAP</TableHead>
                  <TableHead class="text-center">Ejercicio Fiscal</TableHead>
                  <TableHead>Emisor</TableHead>
                  <TableHead class="text-right">Importe</TableHead>
                  <TableHead class="text-center">Moneda</TableHead>
                  <TableHead class="text-center">Fecha Timbrado</TableHead>
                  <TableHead class="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="factura in facturas" :key="factura.uuid" class="hover:bg-muted/20">
                  <TableCell class="font-mono text-xs">{{ factura.uuid }}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{{ factura.tipo }}</Badge>
                  </TableCell>
                  <TableCell class="text-center">{{ factura.sociedad }}</TableCell>
                  <TableCell class="font-mono">{{ factura.docSAP }}</TableCell>
                  <TableCell class="text-center">{{ factura.ejercicioFiscal }}</TableCell>
                  <TableCell class="max-w-[150px] truncate" :title="factura.emisor">{{ factura.emisor }}</TableCell>
                  <TableCell class="text-right font-mono font-medium">
                    {{ formatCurrency(factura.importe, factura.moneda) }}
                  </TableCell>
                  <TableCell class="text-center">{{ factura.moneda }}</TableCell>
                  <TableCell class="text-center">{{ formatDate(factura.fechaTimbrado) }}</TableCell>
                  <TableCell class="text-center">
                    <Button variant="ghost" size="sm" class="text-primary hover:text-primary/80 hover:bg-primary/10"
                      @click="goToFacturaDetail(factura.uuid)">
                      <ExternalLink class="h-4 w-4 mr-1" />
                      Ver Detalle
                    </Button>
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
