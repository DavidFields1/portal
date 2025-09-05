<script setup lang="ts">
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
</script>

<template>
	<div class="space-y-6">
		<Skeleton class="h-10 w-64" />

		<!-- Skeleton para la tarjeta de información principal -->
		<Card>
			<CardHeader>
				<Skeleton class="h-7 w-3/4" />
				<Skeleton class="mt-2 h-5 w-1/2" />
			</CardHeader>
			<CardContent>
				<div
					class="grid grid-cols-1 gap-x-6 gap-y-6 text-sm md:grid-cols-2 lg:grid-cols-3"
				>
					<div class="space-y-4">
						<Skeleton class="h-10 w-full" />
						<Skeleton class="h-10 w-full" />
					</div>
					<div class="space-y-4">
						<Skeleton class="h-10 w-full" />
						<Skeleton class="h-10 w-full" />
					</div>
					<div class="space-y-3">
						<Skeleton class="h-5 w-full" />
						<Skeleton class="h-5 w-full" />
						<Skeleton class="h-5 w-full" />
					</div>
				</div>
				<Separator class="my-4" />
				<div class="flex flex-col items-end space-y-2">
					<Skeleton class="h-4 w-16" />
					<Skeleton class="h-10 w-48" />
				</div>
			</CardContent>
		</Card>

		<!-- Skeleton para la tarjeta de datos de contabilización -->
		<Card>
			<CardHeader>
				<CardTitle><Skeleton class="h-6 w-48" /></CardTitle>
			</CardHeader>
			<CardContent class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div class="space-y-2">
					<Skeleton class="h-4 w-24" />
					<Skeleton class="h-10 w-full" />
				</div>
				<div class="space-y-2">
					<Skeleton class="h-4 w-16" />
					<Skeleton class="h-10 w-full" />
				</div>
			</CardContent>
		</Card>

		<!-- Skeleton para la tarjeta de prorrateos (tabla) -->
		<Card>
			<CardHeader>
				<div class="flex items-center justify-between">
					<Skeleton class="h-6 w-56" />
					<Skeleton class="h-6 w-40" />
				</div>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead v-for="n in 6" :key="n"
								><Skeleton class="h-5 w-full"
							/></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow v-for="i in 4" :key="i">
							<TableCell v-for="j in 6" :key="j"
								><Skeleton class="h-5 w-full"
							/></TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</CardContent>
		</Card>

		<div class="flex justify-end">
			<Skeleton class="h-12 w-48" />
		</div>
	</div>
</template>