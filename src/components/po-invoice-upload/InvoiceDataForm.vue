<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input/Input.vue'
import Select from '@/components/ui/select/Select.vue'
import SelectTrigger from '@/components/ui/select/SelectTrigger.vue'
import SelectValue from '@/components/ui/select/SelectValue.vue'
import SelectContent from '@/components/ui/select/SelectContent.vue'
import SelectItem from '@/components/ui/select/SelectItem.vue'
import { usePOInvoiceStore } from '@/stores/poInvoiceStore'
import { useForm } from '@/composables/useForm'
import { InvoiceDataSchema } from '@/schemas/invoiceDataSchema'
import type { InvoiceData } from '@/schemas/invoiceSchemas'
import { watch } from 'vue'

const invoiceStore = usePOInvoiceStore()

// const updateField = (field: string, value: unknown) => {
//   invoiceStore.updateInvoiceData({ [field]: value })
// }

const { form, errors, validateField } = useForm(
  InvoiceDataSchema,
  invoiceStore.invoiceData
)

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
        <p v-if="errors.importe" class="text-xs text-red-500">
          {{ errors.importe }}
        </p>
      </div>

      <!-- Sociedad -->
      <div class="space-y-1">
        <Label for="sociedad">Sociedad *</Label>
        <Input id="sociedad" v-model="form.sociedad" @blur="validateField('sociedad')" placeholder="Ej: 1000"
          :class="{ 'border-red-500': errors.sociedad }" />
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
