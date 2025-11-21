<script setup lang="ts">
import { computed, onMounted, onUnmounted, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ArrowLeft } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

import { useInvoiceMonitorStore } from '@/stores/invoiceMonitorStore';
import { Button } from '@/components/ui/button';
import InvoiceDetailSkeleton from '@/components/skeleton/InvoiceDetailSkeleton.vue';
import InvoiceHeader from '../components/invoice-monitor/InvoiceHeader.vue';
import AccountingDataForm from '../components/invoice-monitor/AccountingData.vue';
import ConceptsTable from '../components/invoice-monitor/ConceptsTable.vue';
import { useProrrateosQuery } from '@/composables/useProrrateos';

const route = useRoute();
const router = useRouter();
const invoiceMonitorStore = useInvoiceMonitorStore();

const { selectedInvoice, isConceptsLoading, isConceptsError, conceptsError } =
	storeToRefs(invoiceMonitorStore);
const { selectInvoiceForDetail, clearSelectedInvoice, _mergeProrateosIntoConcepts } = invoiceMonitorStore;
const uuidFactura = computed(() => (route.params.uuid as string) || null);
const {
	data: prorateosData,
	isLoading: isProrrateosLoading,
	isError: isProrrateosError,
	error: prorrateosError,
} = useProrrateosQuery(uuidFactura);

watchEffect(() => {
	const prorateos = prorateosData.value?.object;
	console.log('prorateos', prorateos);
	console.log('selectedInvoice.value', selectedInvoice.value);
	if (prorateos && selectedInvoice.value?.conceptos) {
		console.log('entro');
		_mergeProrateosIntoConcepts(prorateos);
	}
});

onMounted(() => {
	const uuid = route.params.uuid as string;
	if (uuid) {
		selectInvoiceForDetail(uuid);
	} else {
		toast.error('No se encontró el identificador de la factura.');
		router.replace('/invoices-monitor');
	}
});

onUnmounted(() => {
	clearSelectedInvoice();
});

const goBackToList = () => {
	router.push('/invoices-monitor');
};

const contabilizar = () => {
	toast.success('¡Factura contabilizada exitosamente! (Simulado)');
};

// Combinar estados de carga y error
const isPageLoading = computed(
	() => isConceptsLoading.value || isProrrateosLoading.value,
);
const isPageError = computed(
	() => isConceptsError.value || isProrrateosError.value,
);
const pageError = computed(() => conceptsError.value || prorrateosError.value);
</script>

<template>
	<div class="container mx-auto py-6 md:py-10">
		<InvoiceDetailSkeleton v-if="isPageLoading || !selectedInvoice" />

		<div v-else-if="isPageError" class="py-10 text-center">
			<p class="text-red-500">
				Error al cargar los detalles: {{ pageError?.message }}
			</p>
			<Button variant="outline" @click="goBackToList" class="mt-4">
				<ArrowLeft class="mr-2 h-4 w-4" /> Volver al monitor
			</Button>
		</div>

		<div v-else class="space-y-6">
			<Button variant="outline" @click="goBackToList" class="flex items-center gap-2">
				<ArrowLeft class="h-4 w-4" /> Volver a la lista de facturas
			</Button>

			<InvoiceHeader :invoice="selectedInvoice" />

			<AccountingDataForm :invoice="selectedInvoice" />

			<ConceptsTable :invoice="selectedInvoice" />

			<div class="flex justify-end">
				<Button size="lg" @click="contabilizar">Contabilizar Prorrateos</Button>
			</div>
		</div>
	</div>
</template>