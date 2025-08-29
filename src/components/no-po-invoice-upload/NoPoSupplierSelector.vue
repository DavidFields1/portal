<script setup lang="ts">
import { ref } from 'vue';
import { useNoPOInvoiceStore } from '@/stores/noPoInvoiceStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ChevronsUpDown, Check, Users, Building, Fingerprint, Hash, Globe } from 'lucide-vue-next';
import type { Provider } from '@/schemas/providerSchema';

const store = useNoPOInvoiceStore();
const isPopoverOpen = ref(false);

const handleSelect = (provider: Provider) => {
  store.selectSupplier(provider);
  isPopoverOpen.value = false;
};
</script>

<template>
  <Card>
    <!-- Vista de Selección de Proveedor (para rol EMPL) -->
    <template v-if="!store.selectedProvider && !store.isUserProvider">
      <CardHeader>
        <div class="flex items-center">
          <Users class="mr-2 h-5 w-5" />
          <CardTitle>Proveedores</CardTitle>
        </div>
        <CardDescription>Busca y selecciona un proveedor</CardDescription>
      </CardHeader>
      <CardContent>
        <Popover v-model:open="isPopoverOpen">
          <PopoverTrigger as-child>
            <Button variant="outline" role="combobox" :aria-expanded="isPopoverOpen" class="w-full justify-between">
              Seleccionar proveedor...
              <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Buscar proveedor..." />
              <CommandList>
                <CommandEmpty>No se encontró el proveedor.</CommandEmpty>
                <CommandGroup>
                  <CommandItem v-for="provider in store.allProviders" :key="provider.id_proveedor"
                    :value="`${provider.nombre_razon_social} ${provider.rfc}`" @select="() => handleSelect(provider)">
                    <Check class="mr-2 h-4 w-4"
                      :class="store.selectedSupplierId === provider.id_proveedor_sap ? 'opacity-100' : 'opacity-0'" />
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

    <!-- Vista de Proveedor Seleccionado o Auto-configurado -->
    <template v-else-if="store.selectedProvider">
      <CardHeader>
        <!-- 1. REQUERIMIENTO: POSICIÓN DEL BOTÓN "CAMBIAR" -->
        <div class="flex justify-between items-start">
          <div>
            <CardTitle>Proveedor</CardTitle>
            <CardDescription class="mt-1">
              Información del proveedor seleccionado
            </CardDescription>
          </div>
          <Button v-if="!store.isUserProvider" variant="outline" size="sm" @click="store.resetSupplierSelection">
            Cambiar
          </Button>
        </div>
      </CardHeader>
      <CardContent class="space-y-3 text-sm">
        <!-- 2. REQUERIMIENTO: INFORMACIÓN DETALLADA Y VISUALMENTE ATRACTIVA -->
        <div class="flex items-start">
          <Building class="h-4 w-4 mr-3 mt-0.5 text-muted-foreground shrink-0" />
          <span class="font-semibold">{{ store.selectedProvider.nombre_razon_social }}</span>
        </div>
        <div class="flex items-center">
          <Fingerprint class="h-4 w-4 mr-3 text-muted-foreground shrink-0" />
          <span class="text-muted-foreground mr-2">RFC:</span>
          <span class="font-medium">{{ store.selectedProvider.rfc }}</span>
        </div>
        <div class="flex items-center">
          <Hash class="h-4 w-4 mr-3 text-muted-foreground shrink-0" />
          <span class="text-muted-foreground mr-2">ID SAP:</span>
          <span class="font-mono text-xs">{{ store.selectedProvider.id_proveedor_sap }}</span>
        </div>
        <div class="flex items-center">
          <Globe class="h-4 w-4 mr-3 text-muted-foreground shrink-0" />
          <span class="text-muted-foreground mr-2">País:</span>
          <span class="font-medium">{{ store.selectedProvider.pais_clave }}</span>
        </div>
      </CardContent>
    </template>

    <!-- Estado de Carga para rol PROVEEDOR mientras se autoconfigura -->
    <template v-else>
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
  </Card>
</template>
