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

const invoiceStore = usePOInvoiceStore()

const updateField = (field: string, value: unknown) => {
  invoiceStore.updateInvoiceData({ [field]: value })
}

// const hasErrors = computed(() => Object.keys(invoiceStore.validationErrors).length > 0)
</script>

<template>
  <div class="space-y-4">
    <h4 class="font-semibold">Datos de Factura</h4>
    <div class="space-y-3">
      <!-- Folio -->
      <div class="space-y-1">
        <Label for="folio">Folio *</Label>
        <Input id="folio" type="text" :model-value="invoiceStore.invoiceData.folio"
          @update:model-value="updateField('folio', $event)" placeholder="Ej: F-12345"
          :class="{ 'border-red-500': invoiceStore.validationErrors.folio }" />
        <p v-if="invoiceStore.validationErrors.folio" class="text-xs text-red-500">
          {{ invoiceStore.validationErrors.folio }}
        </p>
      </div>

      <!-- Moneda -->
      <div class="space-y-1">
        <Label for="moneda">Moneda *</Label>
        <Select :model-value="invoiceStore.invoiceData.moneda" @update:model-value="updateField('moneda', $event)">
          <SelectTrigger id="moneda">
            <SelectValue placeholder="Selecciona una moneda" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
            <SelectItem value="USD">USD - Dólar Americano</SelectItem>
            <SelectItem value="EUR">EUR - Euro</SelectItem>
          </SelectContent>
        </Select>
        <p v-if="invoiceStore.validationErrors.moneda" class="text-xs text-red-500">
          {{ invoiceStore.validationErrors.moneda }}
        </p>
      </div>

      <!-- Importe -->
      <div class="space-y-1">
        <Label for="importe">Importe Total *</Label>
        <Input id="importe" type="number" step="0.01" :model-value="invoiceStore.invoiceData.importe"
          @update:model-value="updateField('importe', Number($event))" placeholder="Ej: 1160.00"
          :class="{ 'border-red-500': invoiceStore.validationErrors.importe }" />
        <p v-if="invoiceStore.validationErrors.importe" class="text-xs text-red-500">
          {{ invoiceStore.validationErrors.importe }}
        </p>
      </div>

      <!-- Sociedad -->
      <div class="space-y-1">
        <Label for="sociedad">Sociedad *</Label>
        <Input id="sociedad" :model-value="invoiceStore.invoiceData.sociedad"
          @update:model-value="updateField('sociedad', $event)" placeholder="Ej: 1000"
          :class="{ 'border-red-500': invoiceStore.validationErrors.sociedad }" />
        <p v-if="invoiceStore.validationErrors.sociedad" class="text-xs text-red-500">
          {{ invoiceStore.validationErrors.sociedad }}
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
