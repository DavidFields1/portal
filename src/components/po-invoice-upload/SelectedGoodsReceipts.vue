<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { X } from 'lucide-vue-next'
import { usePOInvoiceStore } from '@/stores/poInvoiceStore'

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
      <div class="space-y-2 mb-4">
        <div v-for="gr in invoiceStore.selectedGRs" :key="gr.id"
          class="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted/50">
          <div class="flex-1 min-w-0">
            <p class="font-medium truncate">{{ gr.number }} - {{ gr.material }}</p>
            <p class="font-mono text-xs text-muted-foreground">
              {{ invoiceStore.formatCurrency(gr.amount) }}
            </p>
          </div>
          <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0" @click="invoiceStore.removeSelectedGR(gr.id)">
            <X class="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Separator class="my-3" />
      <div class="flex justify-between items-center font-semibold">
        <span>Total Seleccionado:</span>
        <span class="text-lg">{{ invoiceStore.formatCurrency(invoiceStore.totalSelectedAmount) }}</span>
      </div>
    </CardContent>
  </Card>
</template>
