<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { Filter } from 'lucide-vue-next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

import type { InvoiceMonitor } from '@/schemas/invoiceSchemas';
import { useInvoicesStore } from '@/stores/myInvoicesStore';
import MyInvoicesSkeleton from '@/components/skeleton/MyInvoicesSkeleton.vue';
import InvoiceFilters from '@/components/my-invoices/InvoiceFilters.vue';


const invoicesStore = useInvoicesStore();
const {
  invoices,
  isLoading,
  isError,
  error,
  UUId,
  estatus,
  fechaOrigen,
  fechaLimite,
  tipoFechaBusqueda,
} = storeToRefs(invoicesStore);

const showFilters = ref(false);

const sortKey = ref<keyof InvoiceMonitor | null>('fecha_creacion');
const sortOrder = ref<'asc' | 'desc'>('desc');

const currentPage = ref(1);
const itemsPerPage = ref(10);

const activeFilterCount = computed(() => {
  let count = 0;
  if (UUId.value) count++;
  if (estatus.value && estatus.value !== 'all') count++;
  if (fechaOrigen.value || fechaLimite.value) count++;
  return count;
});

const sortedInvoices = computed(() => {
  if (!sortKey.value) return invoices.value;

  return [...invoices.value].sort((a, b) => {
    const valA = a[sortKey.value!];
    const valB = b[sortKey.value!];

    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder.value === 'asc' ? valA - valB : valB - valA;
    }
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder.value === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    return 0;
  });
});

const paginatedInvoices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedInvoices.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(sortedInvoices.value.length / itemsPerPage.value);
});

watch([UUId, estatus, fechaOrigen, fechaLimite, tipoFechaBusqueda], () => {
  currentPage.value = 1;
});

const clearFilters = () => {
  UUId.value = '';
  estatus.value = 'all';
  tipoFechaBusqueda.value = 'timbrado';
  fechaOrigen.value = '';
  fechaLimite.value = '';
};

const setSort = (key: keyof InvoiceMonitor) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  currentPage.value = 1;
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const formatDate = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'short',
    }).format(new Date(dateString));
  } catch {
    return 'N/A';
  }
};

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  }).format(amount);

const getFiltersButtonVariant = () => {
  if (showFilters.value) return 'default';
  if (!showFilters.value && activeFilterCount.value === 0) return 'outline';
  return 'default';
};

const getBadgeVariant = (estatus: string | null) => {
  if (estatus === 'Cargada') return 'secondary';
  if (estatus === 'Validada') return 'default';
  if (estatus === 'Pagada') return 'success';
  if (estatus === 'Rechazada') return 'destructive';
  return 'outline';
};
</script>

<template>
  <div class="container mx-auto py-6 md:py-10">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold md:text-3xl">Mis Facturas</h1>
      <Button
        :variant="getFiltersButtonVariant()"
        @click="showFilters = !showFilters"
        :class="
          activeFilterCount > 0 && !showFilters
            ? 'bg-primary font-bold text-white hover:bg-purple-600'
            : ''
        "
      >
        <Filter class="mr-2 h-4 w-4" />
        Filtros
        <Badge
          v-if="activeFilterCount > 0"
          variant="secondary"
          class="ml-2"
        >
          {{ activeFilterCount }}
        </Badge>
      </Button>
    </div>

    <MyInvoicesSkeleton v-if="isLoading" />

    <div v-else-if="isError" class="py-10 text-center text-red-500">
      <p>Error al cargar las facturas: {{ error?.message }}</p>
      <Button
        variant="outline"
        class="mt-4"
        @click="invoicesStore.refetch()"
      >
        Reintentar
      </Button>
    </div>

    <div v-else class="relative">
      <Card>
        <CardContent class="p-0">
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      @click="setSort('uuid')"
                      class="px-1"
                    >
                      UUID
                    </Button>
                  </TableHead>
                  <TableHead>Emisor</TableHead>
                  <TableHead class="text-center">Estatus</TableHead>
                  <TableHead class="text-right">
                    <Button
                      variant="ghost"
                      @click="setSort('total')"
                      class="px-1"
                    >
                      Importe
                    </Button>
                  </TableHead>
                  <TableHead class="text-center">Moneda</TableHead>
                  <TableHead class="w-28 text-center">
                    <Button
                      variant="ghost"
                      @click="setSort('fecha_timbrado')"
                      class="px-1"
                    >
                      Fecha timbrado
                    </Button>
                  </TableHead>
                  <TableHead class="w-28 text-center">
                    <Button
                      variant="ghost"
                      @click="setSort('fecha_creacion')"
                      class="px-1"
                    >
                      Fecha carga
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <template v-if="paginatedInvoices.length > 0">
                  <TableRow
                    v-for="inv in paginatedInvoices"
                    :key="inv.uuid"
                    class="cursor-pointer transition-colors duration-150 hover:bg-muted/50"
                    @click="
                      $router.push({
                        name: 'invoice-detail',
                        params: { uuid: inv.uuid },
                      })
                    "
                  >
                    <TableCell class="py-4 font-mono text-xs">
                      {{ inv.uuid }}
                    </TableCell>
                    <TableCell class="py-4">
                      {{ inv.razonsocial_emisor }}
                    </TableCell>
                    <TableCell class="py-4 text-center">
                      <Badge :variant="getBadgeVariant(inv.estatus)">
                        {{ inv.estatus }}
                      </Badge>
                    </TableCell>
                    <TableCell class="py-4 font-mono text-right">
                      {{ formatCurrency(inv.total, inv.moneda) }}
                    </TableCell>
                    <TableCell class="py-4 text-center">
                      {{ inv.moneda }}
                    </TableCell>
                    <TableCell class="py-4 text-center">
                      {{ formatDate(inv.fecha_timbrado) }}
                    </TableCell>
                    <TableCell class="py-4 text-center">
                      {{ formatDate(inv.fecha_creacion) }}
                    </TableCell>
                  </TableRow>
                </template>
                <TableRow v-else>
                  <TableCell
                    colspan="7"
                    class="py-10 text-center text-muted-foreground"
                  >
                    No se encontraron facturas con los filtros
                    seleccionados.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter
          class="flex items-center justify-between border-t px-6 py-4"
        >
          <div class="text-sm text-muted-foreground">
            Mostrando {{ paginatedInvoices.length }} de
            {{ sortedInvoices.length }} facturas.
          </div>
          <div class="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              @click="prevPage"
              :disabled="currentPage === 1"
            >
              Anterior
            </Button>
            <span class="text-sm font-medium">
              Página {{ totalPages > 0 ? currentPage : 0 }} de
              {{ totalPages }}
            </span>
            <Button
              variant="outline"
              size="sm"
              @click="nextPage"
              :disabled="
                currentPage === totalPages || totalPages === 0
              "
            >
              Siguiente
            </Button>
          </div>
        </CardFooter>
      </Card>

      <!-- Sidebar de Filtros - Posicionado de forma absoluta -->
      <Transition name="slide-fade">
        <div
          v-if="showFilters"
          class="absolute right-0 top-0 z-50 w-80"
        >
          <Card
            class="shadow-2xl max-h-[calc(100vh-12rem)] overflow-y-auto"
          >
            <InvoiceFilters
              v-model:uuid="UUId"
              v-model:estatus="estatus"
              v-model:tipo-fecha-busqueda="tipoFechaBusqueda"
              v-model:fecha-origen="fechaOrigen"
              v-model:fecha-limite="fechaLimite"
              :active-filter-count="activeFilterCount"
              @clear-filters="clearFilters"
            />
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

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>