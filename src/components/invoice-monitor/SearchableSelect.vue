<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { ChevronsUpDown, Check } from 'lucide-vue-next';

/**
 * Este es un componente genérico.
 * 'T' representa la forma del objeto en el array 'items'.
 * Por ejemplo, si 'items' es un array de objetos { id: number, name: string }, entonces T será ese tipo.
 */

const props = withDefaults(defineProps<{
    // --- Props para v-model ---
    modelValue: string | number | null; // El ID o valor único del item seleccionado

    // --- Props para los datos ---
    items: T[];                     // El array de objetos a mostrar
    itemKey: keyof T;               // La propiedad del objeto que sirve como ID único
    itemValue: keyof T;             // La propiedad a mostrar como texto principal
    itemDescription?: keyof T;      // (Opcional) La propiedad para la descripción secundaria

    // --- Props para la UI ---
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
}>(), {
    placeholder: 'Seleccionar...',
    searchPlaceholder: 'Buscar...',
    emptyMessage: 'No se encontraron resultados.'
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number | null): void;
}>();

const isOpen = ref(false);

// Calcula el texto que se debe mostrar en el botón principal
const displayValue = computed(() => {
    if (!props.modelValue) return props.placeholder || 'Seleccionar...';

    const selectedItem = props.items.find(
        (item) => item[props.itemKey] === props.modelValue,
    );

    // Usamos String() para asegurar que el valor se pueda mostrar
    return selectedItem ? String(selectedItem[props.itemValue] + ' - ' + selectedItem[props.itemDescription ?? '']) : props.placeholder;
});

// Maneja la selección de un item en la lista. Ahora 'item' está tipado como T.
function handleSelect(item: T) {
    // Aseguramos que el valor emitido coincida con el tipo esperado del modelValue
    emit('update:modelValue', item[props.itemKey] as string | number);
    isOpen.value = false;
}

// Genera el valor de búsqueda para CommandItem.
// Combina el valor principal y la descripción para una mejor búsqueda.
function getSearchValue(item: T): string {
    const mainValue = String(item[props.itemValue]);
    const descriptionValue = props.itemDescription ? String(item[props.itemDescription]) : '';
    return `${mainValue} ${descriptionValue}`;
}
</script>

<template>
    <Popover v-model:open="isOpen">
        <PopoverTrigger as-child>
            <Button variant="outline" role="combobox" :aria-expanded="isOpen"
                class="w-full justify-between font-normal">
                <span class="truncate">{{ displayValue }}</span>
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent class="w-[--radix-popover-trigger-width] p-0">
            <Command
                :filter-function="(list: T[], search: string) => list.filter(item => item.value.toLowerCase().includes(search.toLowerCase()))">
                <CommandInput :placeholder="searchPlaceholder || 'Buscar...'" />
                <CommandList>
                    <CommandEmpty>{{ emptyMessage || 'No se encontraron resultados.' }}</CommandEmpty>
                    <CommandGroup>
                        <!-- El valor de CommandItem debe ser el que se usará para la búsqueda -->
                        <CommandItem v-for="item in items" :key="String(item[itemKey])" :value="getSearchValue(item)"
                            @select="() => handleSelect(item)">
                            <Check class="mr-2 h-4 w-4"
                                :class="modelValue === item[itemKey] ? 'opacity-100' : 'opacity-0'" />
                            <div class="flex flex-col overflow-hidden">
                                <span v-if="itemDescription" class="truncate">{{ item[itemDescription] }} </span>
                                <span class="text-xs text-muted-foreground truncate">
                                    {{ item[itemValue] }}
                                </span>
                            </div>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </Command>
        </PopoverContent>
    </Popover>
</template>