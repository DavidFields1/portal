<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton';
import InvoiceCardSkeleton from './InvoiceCardSkeleton.vue';
</script>

<template>
	<div class="space-y-4">
		<!-- <div class="mb-6 flex items-center justify-between">
			<Skeleton class="h-8 w-1/3 md:w-1/4" />
		</div> -->
		<div class="relative">
			<Skeleton class="h-10 w-full rounded-3xl" />
		</div>
		<div
			class="grid grid-cols-1 gap-4 p-1 max-h-[75vh] overflow-y-auto md:grid-cols-2"
		>
			<InvoiceCardSkeleton v-for="n in 4" :key="n" />
		</div>
	</div>
</template>