<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { ChevronsUpDown, Check, OctagonXIcon } from 'lucide-vue-next'
import { usePOInvoiceStore } from '@/stores/poInvoiceStore'
import type { Provider } from '@/schemas/providerSchema'
import Label from '../ui/label/Label.vue'
import PurchaseOrderSkeleton from '../skeleton/PurchaseOrderSkeleton.vue'
import { formatCurrency } from '@/lib/utils'

const invoiceStore = usePOInvoiceStore();

const isSupplierPopoverOpen = ref(false)

const handleSupplierSelect = (provider: Provider) => {
  invoiceStore.selectSupplier(provider)
  isSupplierPopoverOpen.value = false
}

// Auto-configurar proveedor si el usuario es un proveedor
onMounted(() => {
  if (invoiceStore.isUserProvider) {
    invoiceStore.autoConfigureProvider()
  }
})
</script>

<template>
  <Card>
    <!-- Vista de Selección de Proveedor -->
    <template v-if="!invoiceStore.selectedSupplierId && !invoiceStore.isUserProvider">
      <CardHeader>
        <CardTitle>Proveedores</CardTitle>
        <CardDescription>Busca y selecciona un proveedor</CardDescription>
      </CardHeader>
      <CardContent>
        <Popover v-model:open="isSupplierPopoverOpen">
          <PopoverTrigger as-child>
            <Button variant="outline" role="combobox" :aria-expanded="isSupplierPopoverOpen"
              class="w-full justify-between">
              {{ invoiceStore.currentSupplierName || 'Seleccionar proveedor...' }}
              <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Buscar proveedor..." />
              <CommandList>
                <CommandEmpty>No se encontró el proveedor.</CommandEmpty>
                <CommandGroup>
                  <CommandItem v-for="provider in invoiceStore.allProviders" :key="provider.id_proveedor"
                    :value="provider.nombre_razon_social" @select="() => handleSupplierSelect(provider)"
                    class="flex items-center">
                    <Check class="mr-2 h-4 w-4"
                      :class="invoiceStore.selectedSupplierId === provider.id_proveedor_sap ? 'opacity-100' : 'opacity-0'" />
                    <div class="flex flex-col">
                      <span>{{ provider.nombre_razon_social }}</span>
                      <span class="text-xs text-muted-foreground">{{ provider.rfc }}</span>
                    </div>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </CardContent>
    </template>

    <!-- Vista de Proveedor Auto-configurado -->
    <template v-else-if="invoiceStore.isUserProvider && !invoiceStore.selectedSupplierId">
      <CardHeader>
        <CardTitle>Configurando proveedor...</CardTitle>
        <CardDescription>Detectando información del proveedor</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </CardContent>
    </template>

    <!-- Vista de Selección de OC -->
    <template v-else>
      <CardHeader>
        <div class="flex justify-between items-center">
          <div>
            <CardTitle>Órdenes de Compra</CardTitle>
            <CardDescription class="my-2">{{ invoiceStore.currentSupplierName }}</CardDescription>
          </div>
          <Button v-if="!invoiceStore.isUserProvider" variant="outline" size="sm"
            @click="invoiceStore.resetSupplierSelection">
            Cambiar
          </Button>
        </div>
      </CardHeader>
      <CardContent class="space-y-2 max-h-[60vh] overflow-y-auto">
        <div v-if="invoiceStore.purchaseOrdersQuery.isFetching">
          <PurchaseOrderSkeleton />
        </div>
        <div v-else-if="!invoiceStore.purchaseOrdersQuery.isPending && invoiceStore.purchaseOrders.length > 0">
          <Button v-for="po in invoiceStore.purchaseOrders" :key="po.DocumentoCompras" variant="ghost"
            class="w-full justify-start text-left h-auto flex-col items-start p-3 cursor-pointer hover:shadow-sm"
            :class="{
              'bg-accent border-l-4 border-l-primary': invoiceStore.selectedPOId === po.DocumentoCompras,
            }" @click="invoiceStore.selectPO(po.DocumentoCompras)">
            <!-- <div class="text-center w-full" v-if="po.Moneda === 'MXN'">
              <span class="italic text-secondary-foreground">Pedido Nacional</span>
            </div> -->
            <div class="flex w-full justify-between items-center">
              <div>
                <Label class="font-light text-sm">Orden Compra </Label>
                <span class="font-semibold text-sm">{{ po.DocumentoCompras }}</span>
              </div>
              <Badge v-if="po.CondPago" variant="outline" class="text-xs">Sociedad {{ po.Sociedad }}</Badge>
            </div>
            <div class="flex w-full justify-between text-xs text-muted-foreground mt-1 items-baseline">
              <div class="flex gap-2 font-semibold text-base text-green-700">
                <span class="font-mono"> {{ po.Moneda }}</span>
                <span class="font-mono"> {{ formatCurrency(po.Monto, po.Moneda) }}</span>
              </div>
              <span>{{ po.FechaCreacion }}</span>
            </div>
          </Button>
        </div>
        <div v-else class="text-center py-8 text-muted-foreground">
          <OctagonXIcon class="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p class="text-lg font-medium">El Proveedor seleccionado</p>
          <p class="text-sm">no cuenta con Ordenes de Compra</p>
        </div>
      </CardContent>
    </template>
  </Card>
</template>
