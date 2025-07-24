<script setup lang="ts">
import { ref } from 'vue'
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
import { ChevronsUpDown, Check } from 'lucide-vue-next'
import { usePOInvoiceStore } from '@/stores/poInvoiceStore'
// import type { Supplier } from '@/schemas/invoiceSchemas'
import type { Provider } from '@/schemas/providerSchema'

const invoiceStore = usePOInvoiceStore();
// const { allProviders } = invoiceStore;
// console.log(invoiceStore.allProviders)



const isSupplierPopoverOpen = ref(false)

const handleSupplierSelect = (provider: Provider) => {
  invoiceStore.selectSupplier(provider)
  isSupplierPopoverOpen.value = false
}
</script>

<template>
  <Card>
    <!-- Vista de Selección de Proveedor -->
    <template v-if="!invoiceStore.selectedSupplierId">
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
                      :class="invoiceStore.selectedSupplierId === provider.id_proveedor ? 'opacity-100' : 'opacity-0'" />
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

    <!-- Vista de Selección de OC -->
    <template v-else>
      <CardHeader>
        <div class="flex justify-between items-center">
          <div>
            <CardTitle>Órdenes de Compra</CardTitle>
            <CardDescription>{{ invoiceStore.currentSupplierName }}</CardDescription>
          </div>
          <Button variant="outline" size="sm" @click="invoiceStore.resetSupplierSelection">
            Cambiar
          </Button>
        </div>
      </CardHeader>
      <CardContent class="space-y-2 max-h-[60vh] overflow-y-auto">
        <Button v-for="po in invoiceStore.filteredPurchaseOrders" :key="po.id" variant="ghost"
          class="w-full justify-start text-left h-auto flex-col items-start p-3 hover:shadow-sm" :class="{
            'bg-accent border-l-4 border-l-primary': invoiceStore.selectedPOId === po.id,
          }" @click="invoiceStore.selectPO(po.id)">
          <div class="flex w-full justify-between items-center">
            <span class="font-semibold text-sm">{{ po.number }}</span>
            <Badge variant="outline" class="text-xs">{{ po.status }}</Badge>
          </div>
          <div class="flex w-full justify-between text-xs text-muted-foreground mt-1">
            <span>{{ po.date }}</span>
            <span class="font-mono">{{ invoiceStore.formatCurrency(po.totalAmount) }}</span>
          </div>
        </Button>
      </CardContent>
    </template>
  </Card>
</template>
