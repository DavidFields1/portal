<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, OctagonAlertIcon, UserIcon } from 'lucide-vue-next'
import { usePOInvoiceStore } from '@/stores/poInvoiceStore'
import GoodsReceiptSkeleton from '../skeleton/GoodsReceiptSkeleton.vue'
// import Skeleton from '../ui/skeleton/Skeleton.vue'
// import GoodsReceiptSkeleton from '../skeleton/GoodsReceiptSkeleton.vue'

const invoiceStore = usePOInvoiceStore()
</script>

<template>
  <Card>
    <CardHeader v-if="invoiceStore.selectedPO">
      <CardTitle class="text-lg">Entradas de Mercancía</CardTitle>
      <CardDescription>
        Entrada Seleccionada:
        <span class="font-bold">{{ invoiceStore.selectedPO.DocumentoCompras }}</span>
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div v-if="!invoiceStore.selectedSupplierId" class="text-center py-8 text-muted-foreground">
        <UserIcon class="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p class="text-lg font-medium">Selecciona una Proveedor</p>
        <p class="text-sm">para ver sus Ordenes de Compra</p>
      </div>

      <div v-if="!invoiceStore.selectedPO && invoiceStore.selectedSupplierId"
        class="text-center py-8 text-muted-foreground">
        <FileText class="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p class="text-lg font-medium">Selecciona una orden de compra</p>
        <p class="text-sm">para ver sus entradas de mercancía</p>
      </div>

      <div v-if="invoiceStore.goodsReceiptsQuery.isFetching">
        <GoodsReceiptSkeleton />
      </div>
      <div v-else-if="invoiceStore.goodsReceipts.length > 0 && !invoiceStore.goodsReceiptsQuery.isPending"
        class="space-y-3">
        <div v-for="gr in invoiceStore.goodsReceipts" :key="gr.DocMaterial"
          class="rounded-lg border p-3 transition-all hover:shadow-sm">
          <Label :for="`native-${gr.DocMaterial}`" class="flex items-start space-x-3 w-full cursor-pointer">
            <input type="checkbox" :id="`native-${gr.DocMaterial}`" :checked="invoiceStore.isGRSelected(gr.DocMaterial)"
              class="w-4 h-4 rounded border-input bg-background text-primary accent-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              @change="invoiceStore.toggleGRSelection(gr)" />
            <div class="flex-1 min-w-0">
              <div class="flex justify-between mb-1 items-center">
                <div>
                  <Label>Entrada de Mercancia</Label>
                  <span class="text-sm font-bold">{{ gr.DocMaterial }}</span>
                </div>
                <span class="font-mono text-sm font-semibold text-green-700">
                  {{ gr.Moneda }}
                  {{ gr.ImporteMl }}
                </span>
              </div>
              <p class="font-bold text-xl my-2 text-primary">{{ gr.Material }}</p>
              <!-- <div class="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{{ gr.FechaEm }}</span>
              </div> -->
              <div class="flex my-2 justify-between">
                <div>
                  <Label class="mb-1">Precio Unitario</Label>
                  <span class="font-bold">{{ gr.PrecioUnit }}</span>
                </div>
                <div>
                  <Label class="mb-1">Cantidad</Label>
                  <span class="font-bold">{{ gr.Cantidad }}</span>
                </div>
                <div>
                  <Label class="mb-1">Impuesto</Label>
                  <span class="font-bold">{{ gr.IndImpuestos }}</span>
                </div>
              </div>
            </div>
          </Label>
        </div>
      </div>

      <div v-else-if="!invoiceStore.goodsReceiptsQuery.isPending && invoiceStore.goodsReceipts.length == 0"
        class="text-center py-6 text-muted-foreground">
        <OctagonAlertIcon class="h-12 w-12 mx-auto mb-4 opacity-50" />
        <!-- <p class="text-lg font-medium">El Proveedor seleccionado</p> -->
        <p class="text-sm">Esta Orden de Compra no cuenta con Entradas de Mercancia</p>
      </div>
    </CardContent>
  </Card>
</template>
