<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowLeft,
  Building,
  Calendar,
  Download,
  Landmark,
  MapPin,
  PackageCheck,
  Receipt,
  User,
  ChevronDown,
  ListOrdered,
  Globe,
  Factory,
} from "lucide-vue-next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

// --- Estado y Datos de Ejemplo ---

const router = useRouter();
const isLoading = ref(true);

// Datos de la Orden de Compra
const ordenCompra = ref({
  id: "4500018395",
  subtotal: 85000.0,
  impuestos: 13600.0,
  importe: 98600.0,
  moneda: "MXN",
  tipoPedido: "NACIONAL",
});

// Datos de la Sociedad
const sociedad = ref({
  id: "1000",
  rfc: "MEMS890101ABC",
  calle: "Av. de la Industria 4",
  municipio: "Tlalnepantla de Baz",
  ciudad: "Estado de México",
  codigoPostal: "54060",
  anticipo: true,
  porcentajeAnticipo: 20,
  montoAnticipo: 19720.0,
  fechaVencimiento: "2024-08-30T00:00:00Z",
});

// Datos del Proveedor
const proveedor = ref({
  nombre: "Proveedor Industrial S.A.",
  calle: "Calle de la Maquinaria",
  numeroExterior: "500",
  municipio: "Querétaro",
  ciudad: "Querétaro",
  estado: "QRO",
  codigoPostal: "76000",
  pais: "México",
});

// Entradas de Mercancía
const entradasMercancia = ref([
  {
    docMaterial: "5000004521",
    ejercicio: "2024",
    posicionEM: 1,
    posicionOC: 10,
    descripcion: "Tornillos de acero inoxidable",
    cantidad: 500,
    um: "PZA",
    valorUnitario: 10.0,
    importe: 5000.0,
    indImpuesto: "V1",
    porcImpuesto: 16,
    retenciones: 0,
  },
]);

// Posiciones del Pedido
const posicionesPedido = ref([
  {
    posicion: 10,
    material: "TORN-INOX-001",
    cantidad: 500,
    um: "PZA",
    precioUnitario: 10.0,
    importe: 5000.0,
    // Detalle desplegable
    numeroMaterial: "100-3001",
    centro: "MX01",
    textoMaterial: "Tornillos de acero inoxidable M5x20",
    almacen: "A01",
    numeroProveedor: "PROV-MAT-45",
    indicadorImpuesto: "V1",
    fechaEntrega: "2024-08-15T00:00:00Z",
  },
  {
    posicion: 20,
    material: "TUERCA-INOX-001",
    cantidad: 800,
    um: "PZA",
    precioUnitario: 100.0,
    importe: 80000.0,
    // Detalle desplegable
    numeroMaterial: "100-3002",
    centro: "MX01",
    textoMaterial: "Tuerca hexagonal de acero inoxidable M5",
    almacen: "A01",
    numeroProveedor: "PROV-MAT-46",
    indicadorImpuesto: "V1",
    fechaEntrega: "2024-08-20T00:00:00Z",
  },
]);

// Estado para controlar las filas desplegadas
const expandedPositions = ref<number[]>([]);

// --- Métodos ---

const goBack = () => router.push({ name: "purchase-orders" });
const downloadOrdenCompra = () => {
  console.log(`Descargando OC: ${ordenCompra.value.id}`);
  alert(`Iniciando descarga de la OC ${ordenCompra.value.id}`);
};

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(
    amount,
  );

const formatDate = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(
      new Date(dateString),
    );
  } catch {
    return dateString;
  }
};

// Método para alternar el estado de una fila
const togglePosition = (posicion: number) => {
  const index = expandedPositions.value.indexOf(posicion);
  if (index > -1) {
    expandedPositions.value.splice(index, 1); // Si ya está, la quita
  } else {
    expandedPositions.value.push(posicion); // Si no está, la añade
  }
};

// Método para verificar si una fila está desplegada
const isPositionExpanded = (posicion: number) =>
  expandedPositions.value.includes(posicion);

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
});
</script>

<template>
  <div class="container mx-auto py-6 md:py-10">
    <!-- Fila de botones de acción -->
    <div class="flex justify-between items-center mb-6">
      <Button
        variant="outline"
        class="flex items-center gap-2 cursor-pointer"
        @click="$router.push('/purchase-order')">
      
        <ArrowLeft class="h-4 w-4" />
        Regresar
      </Button>
      <Button @click="downloadOrdenCompra">
        <Download class="h-4 w-4 mr-2" />
        Descargar Orden de Compra
      </Button>
    </div>

    <div class="space-y-6">
      <!-- Sección 1: Encabezado y datos principales -->
      <Card>
        <CardHeader>
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <CardTitle class="text-2xl">
              Orden de Compra:
              <span class="text-primary">{{ ordenCompra.id }}</span>
            </CardTitle>
            <Badge
              :variant="
                ordenCompra.tipoPedido === 'NACIONAL' ? 'secondary' : 'outline'
              "
              class="text-base capitalize"
            >
              <Globe class="h-4 w-4 mr-2" />
              {{ ordenCompra.tipoPedido }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent
          class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-center sm:text-left"
        >
          <div class="flex flex-col gap-1">
            <span class="text-sm text-muted-foreground">Subtotal</span>
            <span class="text-xl font-semibold">{{
              formatCurrency(ordenCompra.subtotal, ordenCompra.moneda)
            }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm text-muted-foreground">Impuestos</span>
            <span class="text-xl font-semibold">{{
              formatCurrency(ordenCompra.impuestos, ordenCompra.moneda)
            }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm text-muted-foreground">Importe Total</span>
            <span class="text-3xl font-bold text-primary">{{
              formatCurrency(ordenCompra.importe, ordenCompra.moneda)
            }}</span>
          </div>
        </CardContent>
      </Card>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Sección 2: Datos de la Sociedad -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Landmark class="h-5 w-5 text-primary" />
              Datos de la Sociedad
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex justify-between items-start">
              <span class="text-muted-foreground flex items-center gap-2 pt-1">
                <Factory class="h-4 w-4" /> Sociedad
              </span>
              <span class="font-semibold text-right"
                >{{ sociedad.id }} <br />
                <span class="font-mono text-xs">{{ sociedad.rfc }}</span></span
              >
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <MapPin class="h-4 w-4" /> Dirección
              </span>
              <span class="text-right text-sm">
                {{ sociedad.calle }}, {{ sociedad.municipio }}, <br />
                {{ sociedad.ciudad }}, CP {{ sociedad.codigoPostal }}
              </span>
            </div>
            <Separator />
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <Receipt class="h-4 w-4" /> Anticipo
              </span>
              <span class="font-semibold"
                >{{ sociedad.porcentajeAnticipo }}% ({{
                  formatCurrency(sociedad.montoAnticipo, ordenCompra.moneda)
                }})</span
              >
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <Calendar class="h-4 w-4" /> Vencimiento
              </span>
              <span class="font-semibold">{{
                formatDate(sociedad.fechaVencimiento)
              }}</span>
            </div>
          </CardContent>
        </Card>

        <!-- Sección 3: Datos del Proveedor -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Building class="h-5 w-5 text-primary" />
              Datos del Proveedor
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <User class="h-4 w-4" /> Proveedor
              </span>
              <span class="font-semibold text-right">{{
                proveedor.nombre
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <MapPin class="h-4 w-4" /> Dirección
              </span>
              <span class="text-right text-sm">
                {{ proveedor.calle }} {{ proveedor.numeroExterior }},
                {{ proveedor.municipio }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground flex items-center gap-2">
                <Globe class="h-4 w-4" /> Ubicación
              </span>
              <span class="text-right text-sm">
                {{ proveedor.ciudad }}, {{ proveedor.estado }}, CP
                {{ proveedor.codigoPostal }}, {{ proveedor.pais }}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Sección 4: Entradas de Mercancía -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <PackageCheck class="h-5 w-5 text-primary" />
            Entradas de Mercancía
          </CardTitle>
        </CardHeader>
        <CardContent class="p-0">
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doc. Material</TableHead>
                  <TableHead>Pos.</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead class="text-right">Cantidad</TableHead>
                  <TableHead class="text-right">Importe</TableHead>
                  <TableHead class="text-center">Impuesto</TableHead>
                  <TableHead class="text-right">Retenciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="em in entradasMercancia"
                  :key="em.docMaterial"
                >
                  <TableCell class="font-mono text-xs"
                    >{{ em.docMaterial }}/{{ em.ejercicio }}</TableCell
                  >
                  <TableCell class="text-center"
                    >{{ em.posicionEM }}/{{ em.posicionOC }}</TableCell
                  >
                  <TableCell>{{ em.descripcion }}</TableCell>
                  <TableCell class="text-right"
                    >{{ em.cantidad }} {{ em.um }}</TableCell
                  >
                  <TableCell class="text-right font-mono">{{
                    formatCurrency(em.importe, ordenCompra.moneda)
                  }}</TableCell>
                  <TableCell class="text-center"
                    >{{ em.indImpuesto }} ({{ em.porcImpuesto }}%)</TableCell
                  >
                  <TableCell class="text-right font-mono">{{
                    formatCurrency(em.retenciones, ordenCompra.moneda)
                  }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <!-- Sección 5: Posiciones del Pedido (Desplegable) -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <ListOrdered class="h-5 w-5 text-primary" />
            Posiciones del Pedido
          </CardTitle>
        </CardHeader>
        <CardContent class="p-0">
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-[50px]"></TableHead>
                  <TableHead>Pos.</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead class="text-right">Cantidad</TableHead>
                  <TableHead class="text-right">Precio Unitario</TableHead>
                  <TableHead class="text-right">Importe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <template
                  v-for="pos in posicionesPedido"
                  :key="pos.posicion"
                >
                  <TableRow class="cursor-pointer" @click="togglePosition(pos.posicion)">
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <ChevronDown
                          class="h-4 w-4 transition-transform"
                          :class="isPositionExpanded(pos.posicion) ? 'rotate-180' : ''"
                        />
                      </Button>
                    </TableCell>
                    <TableCell class="font-medium">{{ pos.posicion }}</TableCell>
                    <TableCell>{{ pos.material }}</TableCell>
                    <TableCell class="text-right">{{ pos.cantidad }} {{ pos.um }}</TableCell>
                    <TableCell class="text-right font-mono">{{ formatCurrency(pos.precioUnitario, ordenCompra.moneda) }}</TableCell>
                    <TableCell class="text-right font-mono font-semibold">{{ formatCurrency(pos.importe, ordenCompra.moneda) }}</TableCell>
                  </TableRow>
                  <!-- Fila desplegable -->
                  <TableRow v-if="isPositionExpanded(pos.posicion)">
                    <TableCell colspan="6" class="p-0">
                      <div class="bg-muted/50 p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div class="flex flex-col gap-1">
                          <span class="text-xs text-muted-foreground">No. Material</span>
                          <span class="font-mono text-sm">{{ pos.numeroMaterial }}</span>
                        </div>
                        <div class="flex flex-col gap-1">
                          <span class="text-xs text-muted-foreground">Texto Material</span>
                          <span class="text-sm">{{ pos.textoMaterial }}</span>
                        </div>
                        <div class="flex flex-col gap-1">
                          <span class="text-xs text-muted-foreground">No. Proveedor</span>
                          <span class="font-mono text-sm">{{ pos.numeroProveedor }}</span>
                        </div>
                        <div class="flex flex-col gap-1">
                          <span class="text-xs text-muted-foreground">Centro</span>
                          <span class="text-sm">{{ pos.centro }}</span>
                        </div>
                        <div class="flex flex-col gap-1">
                          <span class="text-xs text-muted-foreground">Almacén</span>
                          <span class="text-sm">{{ pos.almacen }}</span>
                        </div>
                        <div class="flex flex-col gap-1">
                          <span class="text-xs text-muted-foreground">Fecha Entrega</span>
                          <span class="text-sm">{{ formatDate(pos.fechaEntrega) }}</span>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </template>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>