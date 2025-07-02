<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  FileText,
  Calendar as CalendarIcon,
} from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Input
} from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  type DateValue,
  getLocalTimeZone,
} from "@internationalized/date";

// --- Tipos y Datos Simulados ---
interface Invoice {
  uuid: string;
  tipo: string;
  sociedad: string;
  docSAP: string;
  ejercicioFiscal: string;
  emisor: string;
  estatus: "Cargada" | "Validada" | "Rechazada" | "Pagada";
  importe: number;
  moneda: string;
  fechaTimbrado: string;
  fechaCarga: string;
}

const allInvoices = ref<Invoice[]>([
  {
    uuid: "A1B2-C3D4-E5F6-G7H8",
    tipo: "Factura",
    sociedad: "1000",
    docSAP: "5100001234",
    ejercicioFiscal: "2024",
    emisor: "Proveedor A",
    estatus: "Cargada",
    importe: 15000.5,
    moneda: "MXN",
    fechaTimbrado: "2024-06-01T10:00:00Z",
    fechaCarga: "2024-06-02T12:00:00Z",
  },
  {
    uuid: "Z9Y8-X7W6-V5U4-T3S2",
    tipo: "Nota de Crédito",
    sociedad: "2000",
    docSAP: "5100005678",
    ejercicioFiscal: "2024",
    emisor: "Proveedor B",
    estatus: "Validada",
    importe: 5000,
    moneda: "USD",
    fechaTimbrado: "2024-06-03T09:30:00Z",
    fechaCarga: "2024-06-03T10:00:00Z",
  },
  {
    uuid: "Q1W2-E3R4-T5Y6-U7I8",
    tipo: "Factura",
    sociedad: "1000",
    docSAP: "5100009999",
    ejercicioFiscal: "2023",
    emisor: "Proveedor C",
    estatus: "Pagada",
    importe: 20000,
    moneda: "MXN",
    fechaTimbrado: "2023-12-15T08:00:00Z",
    fechaCarga: "2023-12-16T09:00:00Z",
  },
  {
    uuid: "L1K2-J3H4-G5F6-D7S8",
    tipo: "Factura",
    sociedad: "3000",
    docSAP: "5100008888",
    ejercicioFiscal: "2024",
    emisor: "Proveedor D",
    estatus: "Rechazada",
    importe: 8000,
    moneda: "EUR",
    fechaTimbrado: "2024-05-20T11:00:00Z",
    fechaCarga: "2024-05-21T13:00:00Z",
  },
]);

// --- Estado para Filtros y UI ---
const showFilters = ref(false);
const searchTerm = ref("");
const selectedEstatus = ref<Invoice["estatus"] | "all">("all");
const selectedFechaFiltro = ref<"timbrado" | "carga">("timbrado");
const startDate = ref<DateValue>();
const endDate = ref<DateValue>();

// --- Estado para Ordenación ---
const sortKey = ref<keyof Invoice | null>("fechaCarga");
const sortOrder = ref<"asc" | "desc">("desc");

// --- Estado para Paginación ---
const currentPage = ref(1);
const itemsPerPage = ref(5);

// --- Helpers ---
const df = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" });

// --- Lógica Computada ---

// 1. Contar filtros activos
const activeFilterCount = computed(() => {
  let count = 0;
  if (searchTerm.value) count++;
  if (selectedEstatus.value !== "all") count++;
  if (startDate.value || endDate.value) count++;
  return count;
});

// 2. Filtrar Facturas
const filteredInvoices = computed(() => {
  let invoices = allInvoices.value;
  if (searchTerm.value) {
    const lowerSearch = searchTerm.value.toLowerCase();
    invoices = invoices.filter((inv) =>
      inv.uuid.toLowerCase().includes(lowerSearch)
    );
  }
  if (selectedEstatus.value !== "all") {
    invoices = invoices.filter((inv) => inv.estatus === selectedEstatus.value);
  }
  // Filtro por fecha usando calendarios
  if (startDate.value || endDate.value) {
    const key = selectedFechaFiltro.value === "timbrado" ? "fechaTimbrado" : "fechaCarga";
    invoices = invoices.filter((inv) => {
      const fecha = new Date(inv[key]);
      const desde = startDate.value ? startDate.value.toDate(getLocalTimeZone()) : null;
      const hasta = endDate.value ? endDate.value.toDate(getLocalTimeZone()) : null;
      if (desde) {
        desde.setHours(0, 0, 0, 0);
        if (fecha < desde) return false;
      }
      if (hasta) {
        hasta.setHours(23, 59, 59, 999);
        if (fecha > hasta) return false;
      }
      return true;
    });
  }
  return invoices;
});

// 3. Ordenar Facturas Filtradas
const sortedInvoices = computed(() => {
  if (!sortKey.value) return filteredInvoices.value;
  return [...filteredInvoices.value].sort((a, b) => {
    const valA = a[sortKey.value!];
    const valB = b[sortKey.value!];
    if (typeof valA === "number" && typeof valB === "number") {
      return sortOrder.value === "asc" ? valA - valB : valB - valA;
    }
    if (typeof valA === "string" && typeof valB === "string") {
      if (valA < valB) return sortOrder.value === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder.value === "asc" ? 1 : -1;
    }
    return 0;
  });
});

// 4. Paginar Facturas Ordenadas
const paginatedInvoices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedInvoices.value.slice(start, end);
});

// 5. Calcular Total de Páginas
const totalPages = computed(() => {
  return Math.ceil(sortedInvoices.value.length / itemsPerPage.value);
});

// --- Métodos ---

// Limpiar filtros
const clearFilters = () => {
  searchTerm.value = "";
  selectedEstatus.value = "all";
  startDate.value = undefined;
  endDate.value = undefined;
  selectedFechaFiltro.value = "timbrado";
};

// Cambiar ordenación
const setSort = (key: keyof Invoice) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortOrder.value = "asc";
  }
  currentPage.value = 1;
};

// Paginación
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };

// Helpers
const formatDate = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat('es-ES', { dateStyle: 'short' }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};
const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount);

// Watchers
watch([searchTerm, selectedEstatus, startDate, endDate, selectedFechaFiltro], () => {
  currentPage.value = 1;
});
</script>

<template>
  <div class="container mx-auto py-6 md:py-10">
    <!-- Encabezado y Acciones Principales -->
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold md:text-3xl">Mis Facturas</h1>
      <Button :variant="showFilters ? 'secondary' : 'outline'" @click="showFilters = !showFilters" :class="activeFilterCount > 0
        ? 'bg-primary text-white hover:bg-violet-400 hover:text-white'
        : ''
        ">
        <Filter class="mr-2 h-4 w-4" />
        Filtros
        <Badge v-if="activeFilterCount > 0" variant="secondary" class="ml-2">{{ activeFilterCount }}</Badge>
      </Button>
    </div>

    <!-- Contenido Principal: Tabla y Filtros -->
    <div class="flex gap-6">
      <!-- Columna de la Tabla -->
      <div class="flex-1">
        <Card>
          <CardContent class="p-0">
            <div class="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" @click="setSort('uuid')" class="px-1">
                        UUID
                        <template v-if="sortKey === 'uuid'">
                          <ArrowUp v-if="sortOrder === 'asc'" class="ml-2 h-4 w-4" />
                          <ArrowDown v-else class="ml-2 h-4 w-4" />
                        </template>
                        <ArrowUpDown v-else class="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Sociedad</TableHead>
                    <TableHead>Doc. SAP</TableHead>
                    <TableHead class="text-center">Ejercicio Fiscal</TableHead>
                    <TableHead class="text-center">Emisor</TableHead>
                    <TableHead class="text-center">
                      <Button variant="ghost" @click="setSort('estatus')" class="px-1">
                        Estatus
                        <template v-if="sortKey === 'estatus'">
                          <ArrowUp v-if="sortOrder === 'asc'" class="ml-2 h-4 w-4" />
                          <ArrowDown v-else class="ml-2 h-4 w-4" />
                        </template>
                        <ArrowUpDown v-else class="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" @click="setSort('importe')" class="px-1">
                        Importe
                        <template v-if="sortKey === 'importe'">
                          <ArrowUp v-if="sortOrder === 'asc'" class="ml-2 h-4 w-4" />
                          <ArrowDown v-else class="ml-2 h-4 w-4" />
                        </template>
                        <ArrowUpDown v-else class="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </TableHead>
                    <TableHead class="text-center">Moneda</TableHead>
                    <TableHead class="text-center w-20">
                      <Button variant="ghost" @click="setSort('fechaTimbrado')" class="px-1">
                        Fecha timbrado
                        <template v-if="sortKey === 'fechaTimbrado'">
                          <ArrowUp v-if="sortOrder === 'asc'" class="ml-2 h-4 w-4" />
                          <ArrowDown v-else class="ml-2 h-4 w-4" />
                        </template>
                        <ArrowUpDown v-else class="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </TableHead>
                    <TableHead class="text-center w-20">
                      <Button variant="ghost" @click="setSort('fechaCarga')" class="px-1">
                        Fecha carga
                        <template v-if="sortKey === 'fechaCarga'">
                          <ArrowUp v-if="sortOrder === 'asc'" class="ml-2 h-4 w-4" />
                          <ArrowDown v-else class="ml-2 h-4 w-4" />
                        </template>
                        <ArrowUpDown v-else class="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <template v-if="paginatedInvoices.length > 0">
                    <TableRow v-for="inv in paginatedInvoices" :key="inv.uuid" class="hover:bg-muted/50">
                      <TableCell class="font-mono">{{ inv.uuid }}</TableCell>
                      <TableCell>{{ inv.tipo }}</TableCell>
                      <TableCell>{{ inv.sociedad }}</TableCell>
                      <TableCell>{{ inv.docSAP }}</TableCell>
                      <TableCell class="text-center">{{ inv.ejercicioFiscal }}</TableCell>
                      <TableCell class="text-center">{{ inv.emisor }}</TableCell>
                      <TableCell class="text-center">
                        <Badge :variant="{
                          'Cargada': 'secondary',
                          'Validada': 'default',
                          'Pagada': 'success',
                          'Rechazada': 'destructive'
                        }[inv.estatus] || 'secondary'">
                          {{ inv.estatus }}
                        </Badge>
                      </TableCell>
                      <TableCell class="font-mono">{{ formatCurrency(inv.importe, inv.moneda) }}</TableCell>
                      <TableCell class="text-center">{{ inv.moneda }}</TableCell>
                      <TableCell class="text-center">{{ formatDate(inv.fechaTimbrado) }}</TableCell>
                      <TableCell class="text-center">{{ formatDate(inv.fechaCarga) }}</TableCell>
                    </TableRow>
                  </template>
                  <template v-else>
                    <TableRow>
                      <TableCell colspan="11" class="h-48 text-center">
                        <div class="flex flex-col items-center justify-center gap-4">
                          <FileText class="h-16 w-16 text-muted-foreground/50" />
                          <p class="text-lg font-medium">No se encontraron facturas</p>
                          <p class="text-sm text-muted-foreground">Intenta ajustar tu búsqueda o filtros.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  </template>
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter class="flex items-center justify-between border-t px-6 py-4">
            <div class="text-sm text-muted-foreground">
              Mostrando {{ paginatedInvoices.length }} de {{ sortedInvoices.length }} facturas.
            </div>
            <div class="flex items-center space-x-2">
              <Button variant="outline" size="sm" @click="prevPage" :disabled="currentPage === 1">
                Anterior
              </Button>
              <span class="text-sm font-medium">
                Página {{ totalPages > 0 ? currentPage : 0 }} de {{ totalPages }}
              </span>
              <Button variant="outline" size="sm" @click="nextPage"
                :disabled="currentPage === totalPages || totalPages === 0">
                Siguiente
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <!-- Columna de Filtros (Sidebar) -->
      <Transition name="slide-fade">
        <div v-if="showFilters" class="w-72 flex-shrink-0">
          <Card class="sticky top-6">
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent class="flex flex-col gap-6">
              <div class="flex flex-col gap-2">
                <Label for="search-filter">Buscar por UUID</Label>
                <Input id="search-filter" placeholder="UUID..." v-model="searchTerm" />
              </div>
              <div class="flex flex-col gap-2">
                <Label for="estatus-filter">Estatus</Label>
                <Select v-model="selectedEstatus">
                  <SelectTrigger id="estatus-filter">
                    <SelectValue placeholder="Filtrar por Estatus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Cargada">Cargada</SelectItem>
                    <SelectItem value="Validada">Validada</SelectItem>
                    <SelectItem value="Pagada">Pagada</SelectItem>
                    <SelectItem value="Rechazada">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="flex flex-col gap-2">

                <div class="flex flex-col gap-2">
                  <Label>Filtrar por fecha</Label>
                  <Select v-model="selectedFechaFiltro">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="timbrado">Timbrado</SelectItem>
                      <SelectItem value="carga">Carga</SelectItem>
                    </SelectContent>
                  </Select>
                  <div class="flex flex-col gap-2 mt-2">
                    <Popover>
                      <PopoverTrigger as-child>
                        <Button variant="outline" class="w-full justify-start text-left font-normal"
                          :class="!startDate && 'text-muted-foreground'">
                          <CalendarIcon class="mr-2 h-4 w-4" />
                          <span>{{
                            startDate
                              ? df.format(startDate.toDate(getLocalTimeZone()))
                              : "Fecha de inicio"
                          }}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent class="w-auto p-0">
                        <Calendar v-model="startDate" />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger as-child>
                        <Button variant="outline" class="w-full justify-start text-left font-normal"
                          :class="!endDate && 'text-muted-foreground'">
                          <CalendarIcon class="mr-2 h-4 w-4" />
                          <span>{{
                            endDate
                              ? df.format(endDate.toDate(getLocalTimeZone()))
                              : "Fecha de fin"
                          }}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent class="w-auto p-0">
                        <Calendar v-model="endDate" />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" class="w-full cursor-pointer" @click="clearFilters"
                :disabled="activeFilterCount === 0">
                Limpiar filtros
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>