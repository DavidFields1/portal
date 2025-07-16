<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from '@/components/ui/select'

type DesviacionForm = {
	descripcion: string
	moneda: string
	monto: number
}

const newDesviacion = ref<DesviacionForm>({
	descripcion: '',
	moneda: '',
	monto: 0,
})

const monedaOptions = ['MXN', 'USD', 'EUR']

const isSaving = ref(false)
const router = useRouter()

const handleCancel = () => {
	router.back()
}

const fakeApiSaveDesviacion = () => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if (newDesviacion.value.descripcion.toLowerCase().includes('gastos menores')) {
				reject(new Error('Ya existe una desviación con esa descripción.'))
			} else {
				console.log('Guardando desviación:', newDesviacion.value)
				resolve({ success: true })
			}
		}, 1500)
	})
}

const createDesviacion = async () => {
	if (
		!newDesviacion.value.descripcion ||
		!newDesviacion.value.moneda ||
		newDesviacion.value.monto === null ||
		newDesviacion.value.monto <= 0
	) {
		toast.error('Error de validación', {
			description: 'Descripción, moneda y monto (mayor a 0) son obligatorios.',
		})
		return
	}

	isSaving.value = true
	try {
		await fakeApiSaveDesviacion()
		toast.success('Desviación Creada', {
			description: `La desviación "${newDesviacion.value.descripcion}" se creó correctamente.`,
		})
		router.push('/configuracion')
	} catch (error: unknown) {
		let message = 'No se pudo crear la desviación.'
		if (error instanceof Error && error.message) {
			message = error.message
		}
		toast.error('Error al guardar', { description: message })
	} finally {
		isSaving.value = false
	}
}
</script>

<template>
	<div class="container mx-auto py-6 md:py-10">
		<div class="mb-6">
			<h1 class="text-2xl font-bold md:text-3xl">Crear Nueva Desviación</h1>
		</div>

		<form @submit.prevent="createDesviacion">
			<Card>
				<CardHeader>
					<CardTitle>Información de la Desviación</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div class="flex flex-col gap-2 md:col-span-2">
							<Label for="descripcion">Descripción</Label>
							<Input
								id="descripcion"
								v-model="newDesviacion.descripcion"
								placeholder="Ej: Desviación de gastos menores"
								required
							/>
						</div>
						<div class="flex flex-col gap-2">
							<Label for="moneda">Moneda</Label>
							<Select id="moneda" v-model="newDesviacion.moneda">
								<SelectTrigger>
									<SelectValue placeholder="Selecciona moneda" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem
										v-for="mon in monedaOptions"
										:key="mon"
										:value="mon"
									>
										{{ mon }}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div class="flex flex-col gap-2">
							<Label for="monto">Monto Permitido</Label>
							<Input
								id="monto"
								type="number"
								v-model.number="newDesviacion.monto"
								placeholder="Ej: 1000"
								required
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<div class="mt-6 flex justify-end gap-3">
				<Button variant="outline" type="button" @click="handleCancel"> Cancelar </Button>
				<Button type="submit" :disabled="isSaving">
					<svg
						v-if="isSaving"
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
						/>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
						/>
					</svg>
					<span v-if="isSaving">Guardando...</span>
					<span v-else>Guardar Desviación</span>
				</Button>
			</div>
		</form>
	</div>
</template>
