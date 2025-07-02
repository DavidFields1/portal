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
import { Input } from "@/components/ui/input";
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
interface Complemento {
  uuid: string;
  emisor: string;
  receptor: string;
  formaPago: string;
  monto: number;
  moneda: string;
  fechaCarga: string;
  fechaTimbrado: string;
}

const allComplementos = ref<Complemento[]>([
  {
    uuid: "CMP-001-AAA",
    emisor: "Proveedor A",
    receptor: "Cliente X",
    formaPago: "Transferencia",
    monto: 1200.50,
    moneda: "MXN",
    fechaCarga: "2024-06-10T12:00:00Z",
    fechaTimbrado: "2024-06-10T13:00:00Z",
  },
  {
    uuid: "CMP-002-BBB",
    emisor: "Proveedor B",
    receptor: "Cliente Y",
    formaPago: "Efectivo",
    monto: 800.00,
    moneda: "USD",
    fechaCarga: "2024-06-11T09:00:00Z",
    fechaTimbrado: "2024-06-11T10:00:00Z",
  },
  {
    uuid: "CMP-003-CCC",
    emisor: "Proveedor C",
    receptor: "Cliente Z",
    formaPago: "Tarjeta",
    monto: 500.75,
    moneda: "MXN",
    fechaCarga: "2024-06-12T08:00:00Z",
    fechaTimbrado: "2024-06-12T08:30:00Z",
  },
]);

// --- Estado para Filtros y UI ---
const showFilters = ref(false);
const searchTerm = ref("");
const selectedFechaFiltro = ref<"timbrado" | "carga">("timbrado");
const startDate = ref<DateValue>();
const endDate = ref<DateValue>();

// --- Estado para Ordenación ---
const sortKey = ref<keyof Complemento | null>("fechaCarga");
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
  if (startDate.value || endDate.value) count++;
  return count;
});

// 2. Filtrar Complementos
const filteredComplementos = computed(() => {
  let complementos = allComplementos.value;
  if (searchTerm.value) {
    const lowerSearch = searchTerm.value.toLowerCase();
    complementos = complementos.filter((c) =>
      c.uuid.toLowerCase().includes(lowerSearch)
    );
  }
  // Filtro por fecha usando calendarios
  if (startDate.value || endDate.value) {
    const key = selectedFechaFiltro.value === "timbrado" ? "fechaTimbrado" : "fechaCarga";
    complementos = complementos.filter((c) => {
      const fecha = new Date(c[key]);
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
  return complementos;
});

// 3. Ordenar Complementos Filtrados
const sortedComplementos = computed(() => {
  if (!sortKey.value) return filteredComplementos.value;
  return [...filteredComplementos.value].sort((a, b) => {
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

// 4. Paginar Complementos Ordenados
const paginatedComplementos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedComplementos.value.slice(start, end);
});

// 5. Calcular Total de Páginas
const totalPages = computed(() => {
  return Math.ceil(sortedComplementos.value.length / itemsPerPage.value);
});

// --- Métodos ---

// Limpiar filtros
const clearFilters = () => {
  searchTerm.value = "";
  startDate.value = undefined;
  endDate.value = undefined;
  selectedFechaFiltro.value = "timbrado";
};

// Cambiar ordenación
const setSort = (key: keyof Complemento) => {
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
    return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};
const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount);

// Watchers
watch([searchTerm, startDate, endDate, selectedFechaFiltro], () => {
  currentPage.value = 1;
});
</script>

<template>
  <div class="container mx-auto py-6 md:py-10">
    <!-- Encabezado y Acciones Principales -->
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold md:text-3xl">Mis Complementos</h1>
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
                    <TableHead>Emisor</TableHead>
                    <TableHead>Receptor</TableHead>
                    <TableHead>Forma de pago</TableHead>
                    <TableHead>
                      <Button variant="ghost" @click="setSort('monto')" class="px-1">
                        Monto
                        <template v-if="sortKey === 'monto'">
                          <ArrowUp v-if="sortOrder === 'asc'" class="ml-2 h-4 w-4" />
                          <ArrowDown v-else class="ml-2 h-4 w-4" />
                        </template>
                        <ArrowUpDown v-else class="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </TableHead>
                    <TableHead>Moneda</TableHead>
                    <TableHead class="w-28 text-center">
                      <Button variant="ghost" @click="setSort('fechaCarga')" class="px-1">
                        Fecha carga
                        <template v-if="sortKey === 'fechaCarga'">
                          <ArrowUp v-if="sortOrder === 'asc'" class="ml-2 h-4 w-4" />
                          <ArrowDown v-else class="ml-2 h-4 w-4" />
                        </template>
                        <ArrowUpDown v-else class="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </TableHead>
                    <TableHead class="w-28 text-center">
                      <Button variant="ghost" @click="setSort('fechaTimbrado')" class="px-1">
                        Fecha timbrado
                        <template v-if="sortKey === 'fechaTimbrado'">
                          <ArrowUp v-if="sortOrder === 'asc'" class="ml-2 h-4 w-4" />
                          <ArrowDown v-else class="ml-2 h-4 w-4" />
                        </template>
                        <ArrowUpDown v-else class="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <template v-if="paginatedComplementos.length > 0">
                    <TableRow v-for="c in paginatedComplementos" :key="c.uuid" class="hover:bg-muted/50">
                      <TableCell class="font-mono">{{ c.uuid }}</TableCell>
                      <TableCell>{{ c.emisor }}</TableCell>
                      <TableCell>{{ c.receptor }}</TableCell>
                      <TableCell>{{ c.formaPago }}</TableCell>
                      <TableCell class="font-mono">{{ formatCurrency(c.monto, c.moneda) }}</TableCell>
                      <TableCell>{{ c.moneda }}</TableCell>
                      <TableCell class="w-28 text-center">{{ formatDate(c.fechaCarga) }}</TableCell>
                      <TableCell class="w-28 text-center">{{ formatDate(c.fechaTimbrado) }}</TableCell>
                    </TableRow>
                  </template>
                  <template v-else>
                    <TableRow>
                      <TableCell colspan="8" class="h-48 text-center">
                        <div class="flex flex-col items-center justify-center gap-4">
                          <FileText class="h-16 w-16 text-muted-foreground/50" />
                          <p class="text-lg font-medium">No se encontraron complementos</p>
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
              Mostrando {{ paginatedComplementos.length }} de {{ sortedComplementos.length }} complementos.
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