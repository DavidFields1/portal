<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
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

const route = useRoute();
const router = useRouter();
const invoiceMonitorStore = useInvoiceMonitorStore();

const { selectedInvoice, isConceptsLoading, isConceptsError, conceptsError } =
	storeToRefs(invoiceMonitorStore);
const { selectInvoiceForDetail, clearSelectedInvoice } = invoiceMonitorStore;

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
</script>

<template>
	<div class="container mx-auto py-6 md:py-10">
		<InvoiceDetailSkeleton v-if="isConceptsLoading || !selectedInvoice" />

		<div v-else-if="isConceptsError" class="py-10 text-center">
			<p class="text-red-500">
				Error al cargar los conceptos: {{ conceptsError?.message }}
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