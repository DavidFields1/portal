<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref, computed } from "vue";
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
  Download, // Nuevo icono para descargar
} from "lucide-vue-next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Simulación: obtén el uuid de la ruta
const route = useRoute();
const router = useRouter();
const uuid = route.params.uuid as string;

// Simulación: datos de la factura (en la práctica, fetch por uuid)
const factura = ref({
  uuid,
  numeroFactura: "F-2024-001",
  receptor: { rfc: "RFC123456789", nombre: "Cliente Ejemplo S.A. de C.V." },
  emisor: { rfc: "RFC987654321", nombre: "Proveedor Tecnológico S. de R.L." },
  importePagado: 15000.5,
  moneda: "MXN",
  fechaEmision: "2024-06-01",
  fechaTimbrado: "2024-06-02",
  tipoFactura: "con orden de compra", // o "sin orden"
  estatus: "Pagada",
  pago: {
    monto: 15000.5,
    moneda: "MXN",
    formaPago: "Transferencia Electrónica",
    fechaPago: "2024-06-03",
    sociedad: "1000",
  },
  conceptos: [
    {
      descripcion: "Licencia de Software Anual - Pro",
      clave: "P001",
      cantidad: 2,
      valorUnitario: 5000,
      claveUnidad: "H87",
      unidad: "Pieza",
      importe: 10000,
      fechaCreacion: "2024-06-01",
    },
    {
      descripcion: "Soporte Técnico Extendido",
      clave: "P002",
      cantidad: 1,
      valorUnitario: 5000.5,
      claveUnidad: "H87",
      unidad: "Pieza",
      importe: 5000.5,
      fechaCreacion: "2024-06-01",
    },
  ],
  entradasMercancia: [
    {
      ordenCompra: "OC-2024-055",
      entradaMercancia: "EM-101A",
      posicionEM: "10",
      ejercicioFiscal: "2024",
      posicionOC: "20",
      moneda: "MXN",
    },
  ],
});

const showEntradas = computed(() => factura.value.tipoFactura === "con orden de compra");

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "Pagada": return "success";
    case "Validada": return "default";
    case "Cargada": return "secondary";
    case "Rechazada": return "destructive";
    default: return "outline";
  }
};

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount);

// Función para descargar la factura
const downloadFactura = () => {
  // Aquí iría la lógica real para descargar la factura
  console.log(`Descargando factura ${factura.value.numeroFactura}...`);
  // Simulación de descarga
  setTimeout(() => {
    alert(`Factura ${factura.value.numeroFactura} descargada correctamente.`);
  }, 1000);
};
</script>

<template>
  <div class="container mx-auto py-6 md:py-10">
    <div class="flex justify-between">
      <Button variant="outline" class="mb-6 flex items-center gap-2 cursor-pointer" @click="router.push('/invoices')">
        <ArrowLeft class="h-4 w-4" />
        Regresar
      </Button>
      <Button variant="default" class="bg-purple-400 hover:bg-purple-600 text-white" @click="downloadFactura">
        <Download class="h-4 w-4 mr-2" />
        Descargar Factura
      </Button>
    </div>

    <!-- Sección 1: Encabezado y datos principales -->
    <Card class="mb-6">
      <CardHeader>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div class="flex items-center gap-3">
            <CardTitle class="text-2xl">
              Factura: <span class="text-primary">{{ factura.numeroFactura }}</span>
            </CardTitle>
            <!-- Nuevo botón de descarga -->

          </div>
          <Badge :variant="getStatusBadgeVariant(factura.estatus)" class="text-base capitalize">
            {{ factura.estatus }}
          </Badge>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-2">
            <h4 class="font-semibold flex items-center gap-2 text-muted-foreground">
              <User class="h-5 w-5" /> Emisor
            </h4>
            <p class="text-lg font-medium">{{ factura.emisor.nombre }}</p>
            <p class="font-mono text-sm text-muted-foreground">{{ factura.emisor.rfc }}</p>
          </div>
          <div class="flex flex-col gap-2">
            <h4 class="font-semibold flex items-center gap-2 text-muted-foreground">
              <Building2 class="h-5 w-5" /> Receptor
            </h4>
            <p class="text-lg font-medium">{{ factura.receptor.nombre }}</p>
            <p class="font-mono text-sm text-muted-foreground">{{ factura.receptor.rfc }}</p>
          </div>
        </div>
        <Separator />
        <div class="flex items-center justify-center flex-col gap-2 pt-2">
          <h4 class="text-sm font-semibold text-muted-foreground">IMPORTE TOTAL PAGADO</h4>
          <p class="text-4xl font-bold tracking-tight flex items-center gap-2">
            <CircleDollarSign class="h-8 w-8 text-primary" />
            {{ formatCurrency(factura.importePagado, factura.moneda) }}
          </p>
        </div>
      </CardContent>
    </Card>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Sección 2: Datos de la factura -->
      <Card>
        <CardHeader>
          <CardTitle>Datos de la Factura</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-muted-foreground flex items-center gap-2">
              <Fingerprint class="h-4 w-4" /> UUID
            </span>
            <span class="font-mono text-sm">{{ factura.uuid }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-muted-foreground flex items-center gap-2">
              <Calendar class="h-4 w-4" /> Fecha Emisión
            </span>
            <span class="font-semibold">{{ factura.fechaEmision }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-muted-foreground flex items-center gap-2">
              <Clock class="h-4 w-4" /> Fecha Timbrado
            </span>
            <span class="font-semibold">{{ factura.fechaTimbrado }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-muted-foreground flex items-center gap-2">
              <FileText class="h-4 w-4" /> Tipo de Factura
            </span>
            <Badge variant="outline" class="capitalize">{{ factura.tipoFactura }}</Badge>
          </div>
        </CardContent>
      </Card>

      <!-- Sección 3: Datos del pago -->
      <Card>
        <CardHeader>
          <CardTitle>Datos del Pago</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-muted-foreground flex items-center gap-2">
              <CreditCard class="h-4 w-4" /> Forma de Pago
            </span>
            <span class="font-semibold">{{ factura.pago.formaPago }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-muted-foreground flex items-center gap-2">
              <Calendar class="h-4 w-4" /> Fecha de Pago
            </span>
            <span class="font-semibold">{{ factura.pago.fechaPago }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-muted-foreground flex items-center gap-2">
              <Building class="h-4 w-4" /> Sociedad
            </span>
            <span class="font-semibold">{{ factura.pago.sociedad }}</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Sección 4: Conceptos -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>Conceptos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descripción</TableHead>
              <TableHead>Clave</TableHead>
              <TableHead class="text-center">Cantidad</TableHead>
              <TableHead class="text-right">Valor Unitario</TableHead>
              <TableHead class="text-right">Importe</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="c in factura.conceptos" :key="c.clave">
              <TableCell class="font-medium">{{ c.descripcion }}</TableCell>
              <TableCell>{{ c.clave }}</TableCell>
              <TableCell class="text-center">{{ c.cantidad }}</TableCell>
              <TableCell class="text-right font-mono">{{ formatCurrency(c.valorUnitario, factura.moneda) }}</TableCell>
              <TableCell class="text-right font-mono">{{ formatCurrency(c.importe, factura.moneda) }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Sección 5: Entradas de mercancía (solo si es factura con OC) -->
    <Card v-if="showEntradas" class="mb-6">
      <CardHeader>
        <CardTitle>Entradas de Mercancía</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Orden Compra</TableHead>
              <TableHead>Entrada de Mercancía</TableHead>
              <TableHead class="text-center">Posición EM</TableHead>
              <TableHead class="text-center">Ejercicio Fiscal</TableHead>
              <TableHead class="text-center">Posición OC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="em in factura.entradasMercancia" :key="em.entradaMercancia">
              <TableCell class="font-medium">{{ em.ordenCompra }}</TableCell>
              <TableCell>{{ em.entradaMercancia }}</TableCell>
              <TableCell class="text-center">{{ em.posicionEM }}</TableCell>
              <TableCell class="text-center">{{ em.ejercicioFiscal }}</TableCell>
              <TableCell class="text-center">{{ em.posicionOC }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
