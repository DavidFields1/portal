<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input/Input.vue'
import Select from '@/components/ui/select/Select.vue'
import SelectTrigger from '@/components/ui/select/SelectTrigger.vue'
import SelectValue from '@/components/ui/select/SelectValue.vue'
import SelectContent from '@/components/ui/select/SelectContent.vue'
import SelectItem from '@/components/ui/select/SelectItem.vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { ChevronsUpDown, Check } from 'lucide-vue-next'
import { usePOInvoiceStore } from '@/stores/poInvoiceStore'
import { useForm } from '@/composables/useForm'
import { InvoiceDataSchema } from '@/schemas/invoiceDataSchema'
import type { InvoiceData } from '@/schemas/invoiceSchemas'
import { useSociedadesSAPQuery } from '@/composables/useCatalogoSAP'
import { watch, ref, computed } from 'vue'
import { formatCurrency } from '@/lib/utils'

const invoiceStore = usePOInvoiceStore()

// const updateField = (field: string, value: unknown) => {
//   invoiceStore.updateInvoiceData({ [field]: value })
// }

const { form, errors, validateField } = useForm(
  InvoiceDataSchema,
  invoiceStore.invoiceData
)

// Query para obtener las sociedades
const { data: sociedadesResponse, isLoading: isLoadingSociedades } = useSociedadesSAPQuery()

// Variables para el popover de sociedades
const isSocietyPopoverOpen = ref(false)

// Computed para obtener la sociedad seleccionada
const selectedSociety = computed(() => {
  // sociedadesResponse puede ser undefined o un objeto con la propiedad 'object'
  const sociedadesObj = sociedadesResponse?.value?.object
  if (!form.sociedad || !Array.isArray(sociedadesObj)) return null
  return sociedadesObj.find((s: { Clave: string }) => s.Clave === form.sociedad) || null
})

// Define a type for Sociedad
type Sociedad = { Clave: string;[key: string]: unknown }

// Función para manejar la selección de sociedad
const handleSocietySelect = (sociedad: Sociedad) => {
  form.sociedad = sociedad.Clave
  isSocietyPopoverOpen.value = false
}

watch(
  form,
  (newFormData: InvoiceData) => {
    invoiceStore.updateInvoiceData(newFormData)
  },
  { deep: true }
)
</script>

<template>
  <div class="space-y-4">
    <h4 class="font-semibold">Datos de Factura</h4>
    <div class="space-y-3">
      <!-- Folio -->
      <div class="space-y-1">
        <Label for="folio">Folio *</Label>
        <Input id="folio" type="text" v-model="form.folio" @blur="validateField('folio')" placeholder="Ej: F-12345"
          :class="{ 'border-red-500': errors.folio }" />
        <p v-if="errors.folio" class="text-xs text-red-500">
          {{ errors.folio }}
        </p>
      </div>

      <!-- Moneda -->
      <div class="space-y-1">
        <Label for="moneda">Moneda *</Label>
        <Select v-model="form.moneda" @blur="validateField('folio')">
          <SelectTrigger id="moneda">
            <SelectValue placeholder="Selecciona una moneda" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
            <SelectItem value="USD">USD - Dólar Americano</SelectItem>
            <SelectItem value="EUR">EUR - Euro</SelectItem>
          </SelectContent>
        </Select>
        <p v-if="errors.moneda" class="text-xs text-red-500">
          {{ errors.moneda }}
        </p>
      </div>

      <!-- Importe -->
      <div class="space-y-1">
        <Label for="importe">Importe Total *</Label>
        <Input id="importe" type="number" step="0.01" :model-value="form.importe"
          @update:model-value="form.importe = Number($event) || 0" placeholder="Ej: 1160.00"
          @blur="validateField('importe')" :class="{ 'border-red-500': errors.importe }" />
        <p v-if="form.importe > 0" class="text-xs text-muted-foreground">
          {{ formatCurrency(form.importe, form.moneda) }}
        </p>
        <p v-if="errors.importe" class="text-xs text-red-500">
          {{ errors.importe }}
        </p>
      </div>

      <!-- Sociedad -->
      <div class="space-y-1">
        <Label for="sociedad">Sociedad *</Label>
        <Popover v-model:open="isSocietyPopoverOpen">
          <PopoverTrigger as-child>
            <Button variant="outline" role="combobox" :aria-expanded="isSocietyPopoverOpen"
              class="w-full justify-between" :class="{ 'border-red-500': errors.sociedad }">
              {{
                selectedSociety
                  ? `${selectedSociety.Clave} - ${selectedSociety.Descripcion}`
                  : 'Seleccionar sociedad...'
              }}
              <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Buscar sociedad..." />
              <CommandList>
                <div v-if="isLoadingSociedades" class="p-2 text-center text-sm text-muted-foreground">
                  Cargando sociedades...
                </div>
                <CommandEmpty v-else>No se encontró la sociedad.</CommandEmpty>
                <CommandGroup v-if="!isLoadingSociedades && sociedadesResponse?.object">
                  <CommandItem v-for="sociedad in sociedadesResponse.object" :key="sociedad.Clave"
                    :value="`${sociedad.Clave} ${sociedad.Descripcion}`" @select="() => handleSocietySelect(sociedad)"
                    class="flex items-center">
                    <Check class="mr-2 h-4 w-4"
                      :class="form.sociedad === sociedad.Clave ? 'opacity-100' : 'opacity-0'" />
                    <div class="flex flex-col">
                      <span>{{ sociedad.Clave }} - {{ sociedad.Descripcion }}</span>
                      <span class="text-xs text-muted-foreground">{{ sociedad.RFC }}</span>
                    </div>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <p v-if="errors.sociedad" class="text-xs text-red-500">
          {{ errors.sociedad }}
        </p>
      </div>
    </div>

    <!-- Botones de navegación -->
    <div class="flex space-x-2 pt-4">
      <Button variant="outline" size="sm" class="flex-1" @click="invoiceStore.prevStep">← Volver</Button>
      <Button size="sm" class="flex-1" :disabled="!invoiceStore.canProceedToStep4" @click="invoiceStore.nextStep">
        Continuar →
      </Button>
    </div>
  </div>
</template>
