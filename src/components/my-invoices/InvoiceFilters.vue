<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { type DateValue, getLocalTimeZone } from '@internationalized/date';
import { Calendar as CalendarIcon } from 'lucide-vue-next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

const props = defineProps<{
  uuid: string;
  estatus: string;
  tipoFechaBusqueda: string;
  fechaOrigen: string;
  fechaLimite: string;
  activeFilterCount: number;
}>();

const emit = defineEmits([
  'update:uuid',
  'update:estatus',
  'update:tipoFechaBusqueda',
  'update:fechaOrigen',
  'update:fechaLimite',
  'clear-filters',
]);

const startDate = ref<DateValue>();
const endDate = ref<DateValue>();
const df = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' });

const internalUuid = computed({
  get: () => props.uuid,
  set: (val) => emit('update:uuid', val),
});

const internalEstatus = computed({
  get: () => props.estatus,
  set: (val) => emit('update:estatus', val),
});

const internalTipoFecha = computed({
  get: () => props.tipoFechaBusqueda,
  set: (val) => emit('update:tipoFechaBusqueda', val),
});

watch(startDate, (newDate) => {
  const dateString = newDate
    ? newDate.toDate(getLocalTimeZone()).toISOString().split('T')[0]
    : '';
  emit('update:fechaOrigen', dateString);
});

watch(endDate, (newDate) => {
  const dateString = newDate
    ? newDate.toDate(getLocalTimeZone()).toISOString().split('T')[0]
    : '';
  emit('update:fechaLimite', dateString);
});
</script>

<template>
  <CardHeader>
    <CardTitle>Filtros</CardTitle>
  </CardHeader>
  <CardContent class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <Label for="search-filter">Buscar por UUID</Label>
      <Input
        id="search-filter"
        placeholder="UUID..."
        v-model="internalUuid"
      />
    </div>
    <div class="flex flex-col gap-2">
      <Label for="estatus-filter">Estatus</Label>
      <Select v-model="internalEstatus">
        <SelectTrigger id="estatus-filter">
          <SelectValue placeholder="Filtrar por Estatus" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="PENDIENTE">Pendiente</SelectItem>
          <SelectItem value="PROCESADA">Procesada</SelectItem>
          <SelectItem value="PAGADA">Pagada</SelectItem>
          <SelectItem value="RECHAZADA">Rechazada</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div class="flex flex-col gap-2">
      <Label>Filtrar por fecha de</Label>
      <Select v-model="internalTipoFecha">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="timbrado">Timbrado</SelectItem>
          <SelectItem value="carga">Carga</SelectItem>
        </SelectContent>
      </Select>
      <div class="mt-2 flex flex-col gap-2">
        <Popover>
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              class="w-full justify-start text-left font-normal"
              :class="!startDate && 'text-muted-foreground'"
            >
              <CalendarIcon class="mr-2 h-4 w-4" />
              <span>{{
                startDate
                  ? df.format(startDate.toDate(getLocalTimeZone()))
                  : 'Fecha de inicio'
              }}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0">
            <Calendar v-model="startDate" />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              class="w-full justify-start text-left font-normal"
              :class="!endDate && 'text-muted-foreground'"
            >
              <CalendarIcon class="mr-2 h-4 w-4" />
              <span>{{
                endDate
                  ? df.format(endDate.toDate(getLocalTimeZone()))
                  : 'Fecha de fin'
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
    <Button
      variant="ghost"
      class="w-full cursor-pointer"
      @click="$emit('clear-filters')"
      :disabled="activeFilterCount === 0"
    >
      Limpiar filtros
    </Button>
  </CardFooter>
</template>