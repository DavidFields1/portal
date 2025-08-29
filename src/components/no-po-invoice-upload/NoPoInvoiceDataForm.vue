<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ChevronsUpDown, Check } from 'lucide-vue-next'

// Store específico para el flujo SIN Orden de Compra
import { useNoPOInvoiceStore } from '@/stores/noPoInvoiceStore'

// Composables y Schemas
import { useForm } from '@/composables/useForm'
import { InvoiceDataSchema } from '@/schemas/invoiceSchemas'
import type { InvoiceData } from '@/schemas/invoiceSchemas'
import { useSociedadesSAPQuery } from '@/composables/useCatalogoSAP'
import { formatCurrency } from '@/lib/utils'

// Componentes UI
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input/Input.vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'

// Usamos el store dedicado para este flujo
const invoiceStore = useNoPOInvoiceStore()

// El composable useForm se conecta al estado del store
const { form, errors, validateField } = useForm(
  InvoiceDataSchema,
  invoiceStore.invoiceData
)

// Query para obtener las sociedades (esto sigue siendo necesario)
const { data: sociedadesResponse, isLoading: isLoadingSociedades } = useSociedadesSAPQuery()

// Estado local para el manejo del UI del combobox
const isSocietyPopoverOpen = ref(false)

// Computed para encontrar el objeto de la sociedad seleccionada
const selectedSociety = computed(() => {
  const sociedadesObj = sociedadesResponse?.value?.object
  if (!form.sociedad || !Array.isArray(sociedadesObj)) return null
  return sociedadesObj.find((s: { Clave: string }) => s.Clave === form.sociedad) || null
})

type Sociedad = { Clave: string; Descripcion: string; RFC: string }

const handleSocietySelect = (sociedad: Sociedad) => {
  form.sociedad = sociedad.Clave
  isSocietyPopoverOpen.value = false
}

// Observador para mantener sincronizado el estado del store con el formulario local
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
        <Select v-model="form.moneda" @blur="validateField('moneda')">
          <SelectTrigger id="moneda" :class="{ 'border-red-500': errors.moneda }">
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
      <Button size="sm" class="flex-1" :disabled="!invoiceStore.canProceed" @click="invoiceStore.nextStep">
        Continuar →
      </Button>
    </div>
  </div>
</template>
