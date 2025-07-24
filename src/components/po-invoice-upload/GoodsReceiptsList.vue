<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-vue-next'
import { usePOInvoiceStore } from '@/stores/poInvoiceStore'

const invoiceStore = usePOInvoiceStore()
</script>

<template>
  <Card>
    <CardHeader v-if="invoiceStore.selectedPO">
      <CardTitle class="text-lg">Entradas de Mercancía</CardTitle>
      <CardDescription>
        <span class="font-medium">{{ invoiceStore.selectedPO.number }}</span> -
        {{ invoiceStore.selectedPO.supplier }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div v-if="!invoiceStore.selectedPO" class="text-center py-8 text-muted-foreground">
        <FileText class="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p class="text-lg font-medium">Selecciona una orden de compra</p>
        <p class="text-sm">para ver sus entradas de mercancía</p>
      </div>

      <div v-else-if="invoiceStore.selectedPO.goodsReceipts.length > 0" class="space-y-3">
        <div v-for="gr in invoiceStore.selectedPO.goodsReceipts" :key="gr.id"
          class="rounded-lg border p-3 transition-all hover:shadow-sm" :class="{
            'opacity-50 cursor-not-allowed': gr.status === 'Facturado',
          }">
          <Label :for="`native-${gr.id}`" class="flex items-start space-x-3 w-full cursor-pointer">
            <input type="checkbox" :id="`native-${gr.id}`" :checked="invoiceStore.isGRSelected(gr.id)"
              :disabled="gr.status === 'Facturado'"
              class="w-4 h-4 rounded border-input bg-background text-primary accent-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              @change="invoiceStore.toggleGRSelection(gr)" />
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start mb-1">
                <span class="font-medium text-sm">{{ gr.number }}</span>
                <span class="font-mono text-sm font-semibold">
                  {{ invoiceStore.formatCurrency(gr.amount) }}
                </span>
              </div>
              <p class="font-bold text-sm text-foreground">{{ gr.material }}</p>
              <div class="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{{ gr.date }}</span>
                <span>IVA: {{ invoiceStore.formatCurrency(gr.iva) }}</span>
              </div>
            </div>
          </Label>
        </div>
      </div>

      <div v-else class="text-center py-6 text-muted-foreground">
        <p>Esta orden no tiene entradas de mercancía</p>
      </div>
    </CardContent>
  </Card>
</template>
