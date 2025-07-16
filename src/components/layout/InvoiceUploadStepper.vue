<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { UploadCloud, CheckCircle } from 'lucide-vue-next'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import type { Step } from '@/views/POInvoiceUploadView.vue'

// Definimos las props que este componente recibirá desde la vista principal
const props = defineProps({
	steps: { type: Array as () => Step[], required: true },
	currentStepIndex: { type: Number, required: true },
	selectedGRs: { type: Array, required: true },
	totalSelectedAmount: { type: Number, required: true },
	currentSupplierName: { type: String, default: '' },
	isSubmitting: { type: Boolean, default: false },
	formatCurrency: { type: Function, required: true },

	pdfFile: { type: Object as () => File | null, default: null },
	xmlFile: { type: Object as () => File | null, default: null },
	invoiceData: {
		type: Object as () => {
			folio: string
			moneda: string
			importe: number | null
			sociedad: string
		},
		required: true,
	},

	onNextStep: { type: Function, required: true },
	onPrevStep: { type: Function, required: true },
	onSubmitInvoice: { type: Function, required: true },
	onPDFFileChange: { type: Function, required: true },
	onXMLFileChange: { type: Function, required: true },
	onRemovePDF: { type: Function, required: true },
	onRemoveXML: { type: Function, required: true },
	onInvoiceDataChange: { type: Function, required: true },
})

// Manejadores locales para los inputs de archivo
const handlePDFFileChange = (event: Event) => {
	const target = event.target as HTMLInputElement
	const file = target.files?.[0]
	if (file) props.onPDFFileChange(file)
}
const handleXMLFileChange = (event: Event) => {
	const target = event.target as HTMLInputElement
	const file = target.files?.[0]
	if (file) props.onXMLFileChange(file)
}
</script>

<template>
	<Card class="flex flex-col h-full border-0 border-l rounded-none">
		<CardHeader>
			<CardTitle>Proceso de Carga</CardTitle>
			<nav aria-label="Progreso de carga" class="mt-4">
				<ol class="space-y-4">
					<li
						v-for="(step, index) in props.steps"
						:key="step.id"
						class="flex items-center text-sm"
					>
						<span
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full mr-3"
							:class="{
								'bg-primary text-primary-foreground':
									index === props.currentStepIndex,
								'bg-green-600 text-white': index < props.currentStepIndex,
								'bg-muted text-muted-foreground border':
									index > props.currentStepIndex,
							}"
						>
							<component
								v-if="index < props.currentStepIndex"
								:is="CheckCircle"
								class="h-4 w-4"
							/>
							<component v-else :is="step.icon" class="h-4 w-4" />
						</span>
						<span
							class="font-medium"
							:class="{
								'text-primary': index === props.currentStepIndex,
								'text-green-700': index < props.currentStepIndex,
								'text-muted-foreground': index > props.currentStepIndex,
							}"
						>
							{{ step.name }}
						</span>
					</li>
				</ol>
			</nav>
		</CardHeader>
		<Separator />
		<CardContent class="mt-4 flex-1 overflow-y-auto">
			<!-- Paso 0: Seleccionar Proveedor -->
			<div v-if="props.currentStepIndex === 0" class="text-center text-muted-foreground py-4">
				<p class="text-sm">Selecciona un proveedor para comenzar.</p>
			</div>

			<!-- Paso 1: Seleccionar Entradas -->
			<div v-if="props.currentStepIndex === 1" class="space-y-4">
				<div
					v-if="props.selectedGRs.length === 0"
					class="text-center text-muted-foreground py-4"
				>
					<p class="text-sm">
						Selecciona una o más entradas de mercancía para continuar.
					</p>
				</div>
				<div v-else class="space-y-4">
					<div class="text-center">
						<div class="text-2xl font-bold text-primary">
							{{ props.selectedGRs.length }}
						</div>
						<div class="text-xs text-muted-foreground">entrada(s) seleccionada(s)</div>
					</div>
					<Button size="sm" class="w-full" @click="props.onNextStep">Continuar →</Button>
				</div>
			</div>

			<!-- Paso 2: Subir Archivos -->
			<div v-if="props.currentStepIndex === 2" class="space-y-6">
				<h4 class="font-semibold">Subir Archivos de Factura</h4>
				<div>
					<Label class="font-medium">Archivo PDF</Label>
					<div
						class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center mt-1"
					>
						<input
							type="file"
							id="pdf-upload-stepper"
							accept=".pdf"
							class="sr-only"
							@change="handlePDFFileChange"
						/>
						<label for="pdf-upload-stepper" class="cursor-pointer">
							<UploadCloud class="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
							<p class="text-xs font-medium">Clic para subir PDF</p>
						</label>
					</div>
					<div
						v-if="props.pdfFile"
						class="flex items-center justify-between p-2 bg-muted rounded-lg mt-2 text-sm"
					>
						<span class="truncate">{{ props.pdfFile.name }}</span>
						<Button
							variant="ghost"
							size="icon"
							class="h-6 w-6"
							@click="props.onRemovePDF"
							>✕</Button
						>
					</div>
				</div>
				<div>
					<Label class="font-medium">Archivo XML</Label>
					<div
						class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center mt-1"
					>
						<input
							type="file"
							id="xml-upload-stepper"
							accept=".xml,text/xml,application/xml"
							class="sr-only"
							@change="handleXMLFileChange"
						/>
						<label for="xml-upload-stepper" class="cursor-pointer">
							<UploadCloud class="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
							<p class="text-xs font-medium">Clic para subir XML</p>
						</label>
					</div>
					<div
						v-if="props.xmlFile"
						class="flex items-center justify-between p-2 bg-muted rounded-lg mt-2 text-sm"
					>
						<span class="truncate">{{ props.xmlFile.name }}</span>
						<Button
							variant="ghost"
							size="icon"
							class="h-6 w-6"
							@click="props.onRemoveXML"
							>✕</Button
						>
					</div>
				</div>
				<div class="flex space-x-2 pt-4">
					<Button variant="outline" size="sm" class="flex-1" @click="props.onPrevStep"
						>← Volver</Button
					>
					<Button
						size="sm"
						class="flex-1"
						:disabled="!props.pdfFile || !props.xmlFile"
						@click="props.onNextStep"
						>Continuar →</Button
					>
				</div>
			</div>

			<!-- Paso 3: Datos de Factura -->
			<div v-if="props.currentStepIndex === 3" class="space-y-4">
				<h4 class="font-semibold">Datos de Factura</h4>
				<div class="space-y-3">
					<div class="space-y-1">
						<Label for="folio">Folio</Label>
						<Input
							id="folio"
							:value="props.invoiceData.folio"
							@input="
								props.onInvoiceDataChange({
									...props.invoiceData,
									folio: ($event.target as HTMLInputElement).value,
								})
							"
						/>
					</div>
					<div class="space-y-1">
						<Label for="moneda">Moneda</Label>
						<Select
							:model-value="props.invoiceData.moneda"
							@update:modelValue="
								(val) =>
									props.onInvoiceDataChange({ ...props.invoiceData, moneda: val })
							"
						>
							<SelectTrigger id="moneda">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
								<SelectItem value="USD">USD - Dólar Americano</SelectItem>
								<SelectItem value="EUR">EUR - Euro</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div class="space-y-1">
						<Label for="importe">Importe Total</Label>
						<Input
							id="importe"
							type="number"
							:value="props.invoiceData.importe"
							@input="
								props.onInvoiceDataChange({
									...props.invoiceData,
									importe:
										parseFloat(($event.target as HTMLInputElement).value) ||
										null,
								})
							"
						/>
					</div>
					<div class="space-y-1">
						<Label for="sociedad">Sociedad</Label>
						<Input
							id="sociedad"
							:value="props.invoiceData.sociedad"
							@input="
								props.onInvoiceDataChange({
									...props.invoiceData,
									sociedad: ($event.target as HTMLInputElement).value,
								})
							"
						/>
					</div>
				</div>
				<div class="flex space-x-2 pt-4">
					<Button variant="outline" size="sm" class="flex-1" @click="props.onPrevStep"
						>← Volver</Button
					>
					<Button
						size="sm"
						class="flex-1"
						:disabled="!props.invoiceData.folio || !props.invoiceData.importe"
						@click="props.onNextStep"
						>Continuar →</Button
					>
				</div>
			</div>

			<!-- Paso 4: Confirmación Final -->
			<div v-if="props.currentStepIndex === 4" class="space-y-4">
				<h4 class="font-semibold">Confirmación Final</h4>
				<div class="space-y-3 text-sm">
					<div class="flex justify-between">
						<span class="text-muted-foreground">Proveedor:</span
						><span class="font-medium">{{ props.currentSupplierName }}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Entradas:</span
						><span class="font-medium">{{ props.selectedGRs.length }}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Total Seleccionado:</span
						><span class="font-semibold">{{
							props.formatCurrency(props.totalSelectedAmount)
						}}</span>
					</div>
					<Separator />
					<div class="flex justify-between">
						<span class="text-muted-foreground">Archivo PDF:</span
						><span class="font-medium">{{ props.pdfFile?.name }}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Archivo XML:</span
						><span class="font-medium">{{ props.xmlFile?.name }}</span>
					</div>
					<Separator />
					<div class="flex justify-between">
						<span class="text-muted-foreground">Folio:</span
						><span class="font-medium">{{ props.invoiceData.folio }}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Moneda:</span
						><span class="font-medium">{{ props.invoiceData.moneda }}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Importe:</span
						><span class="font-semibold">{{
							props.formatCurrency(
								props.invoiceData.importe || 0,
								props.invoiceData.moneda,
							)
						}}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Sociedad:</span
						><span class="font-medium">{{ props.invoiceData.sociedad }}</span>
					</div>
				</div>
				<div class="flex space-x-2 pt-4">
					<Button
						variant="outline"
						size="sm"
						class="flex-1"
						@click="props.onPrevStep"
						:disabled="props.isSubmitting"
						>← Volver</Button
					>
					<Button
						size="sm"
						class="flex-1"
						@click="props.onSubmitInvoice"
						:disabled="props.isSubmitting"
					>
						<svg
							v-if="props.isSubmitting"
							class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						<span v-if="props.isSubmitting">Procesando...</span>
						<span v-else>Confirmar Carga</span>
					</Button>
				</div>
			</div>
		</CardContent>
	</Card>
</template>
