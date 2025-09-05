<script setup lang="ts">
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
</script>

<template>
	<Card>
		<div class="flex items-stretch justify-between">
			<div class="flex-1 p-4">
				<Skeleton class="h-5 w-3/4" />
				<Skeleton class="mt-2 h-4 w-1/2" />
				<Separator class="my-2" />
				<div class="space-y-2 text-xs">
					<Skeleton class="h-3 w-5/6" />
					<Skeleton class="h-3 w-4/6" />
					<Skeleton class="h-3 w-3/4" />
				</div>
			</div>
			<div
				class="flex w-32 flex-col items-center justify-center rounded-r-lg p-4"
			>
				<Skeleton class="h-3 w-8" />
				<Skeleton class="mt-2 h-6 w-16" />
			</div>
		</div>
	</Card>
</template>