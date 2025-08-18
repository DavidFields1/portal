<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-vue-next'
import { usePOInvoiceStore } from '@/stores/poInvoiceStore'
import Table from '../ui/table/Table.vue'
import TableHeader from '../ui/table/TableHeader.vue'
import TableRow from '../ui/table/TableRow.vue'
import TableHead from '../ui/table/TableHead.vue'
import TableBody from '../ui/table/TableBody.vue'
import TableCell from '../ui/table/TableCell.vue'
import { formatCurrency } from '@/lib/utils'

const invoiceStore = usePOInvoiceStore()
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-lg flex items-center justify-between">
        <span>Selección Actual</span>
        <Badge variant="secondary">{{ invoiceStore.selectedGRs.length }} entrada(s)</Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <!-- <div class=""> -->
      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[50px] py-2 px-3">
                <!-- Columna para el botón de acción -->
              </TableHead>
              <TableHead class="py-2 px-3">Material</TableHead>
              <TableHead class="py-2 px-3">Unidades</TableHead>
              <TableHead class="text-right py-2 px-3">Importe</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="invoiceStore.selectedGRs && invoiceStore.selectedGRs.length > 0">
              <TableRow v-for="gr in invoiceStore.selectedGRs" :key="gr.DocMaterial">
                <TableCell class="py-2 px-3">
                  <Button variant="ghost" size="icon" class="h-7 w-7 hover:text-red-600"
                    @click="invoiceStore.removeSelectedGR(gr.DocMaterial)">
                    <X class="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell class="font-medium py-2 px-3">
                  {{ gr.Material }}
                </TableCell>
                <TableCell class="py-2 px-3">{{ gr.Cantidad }}</TableCell>
                <TableCell class="text-right py-2 px-3">
                  {{ formatCurrency(gr.ImporteMl, gr.Moneda) }}
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>
      <div class="flex justify-between items-center font-semibold px-2 mt-3">
        <span>Total Seleccionado:</span>
        <span class="text-lg"> {{ formatCurrency(invoiceStore.totalSelectedAmount, invoiceStore.selectedPO?.Moneda ||
          'MXN')
          }}</span>
      </div>
    </CardContent>
  </Card>
</template>
