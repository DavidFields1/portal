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
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
// import { ArrowLeft } from "lucide-vue-next";

// --- Estado del Formulario ---
const newUser = ref({
	name: '',
	email: '',
	role: 'Viewer', // Valor por defecto
	status: 'Active', // Valor por defecto
	avatarUrl: '',
})

const isSaving = ref(false)
const router = useRouter()

// --- Métodos ---

const handleCancel = () => {
	router.back() // Vuelve a la página anterior (la lista de usuarios)
}

const fakeApiSave = () => {
	// Simula una llamada a la API que puede tardar un poco
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			// Simula un posible error de email duplicado
			if (newUser.value.email === 'alice@example.com') {
				reject(new Error('El correo electrónico ya está en uso.'))
			} else {
				console.log('Guardando nuevo usuario:', newUser.value)
				resolve({ success: true, user: newUser.value })
			}
		}, 1500)
	})
}

const createUser = async () => {
	// Validación simple
	if (!newUser.value.name || !newUser.value.email) {
		toast.error('Error de validación', {
			description: 'El nombre y el correo electrónico son campos obligatorios.',
		})
		return
	}

	isSaving.value = true
	try {
		await fakeApiSave()
		toast.success('Usuario Creado', {
			description: `El usuario ${newUser.value.name} ha sido creado exitosamente.`,
		})
		router.push('/users') // Redirige a la lista de usuarios tras el éxito
	} catch (error: unknown) {
		let message = 'No se pudo crear el usuario. Inténtalo de nuevo.'
		if (error instanceof Error && error.message) {
			message = error.message
		}
		toast.error('Error al guardar', {
			description: message,
		})
	} finally {
		isSaving.value = false
	}
}
</script>

<template>
	<div class="container mx-auto py-6 md:py-10">
		<!-- Encabezado con botón para volver -->
		<!-- <Button variant="outline" class="mb-6 flex items-center gap-2 cursor-pointer" @click="router.push('/invoices')">
      <ArrowLeft class="h-4 w-4" />
      Regresar
    </Button> -->
		<!-- <div class="mb-6 flex items-center gap-4"> -->
		<div class="mb-6">
			<h1 class="text-2xl font-bold md:text-3xl">Crear Nuevo Usuario</h1>
		</div>
		<!-- </div> -->

		<!-- Formulario dentro de una Card -->
		<form @submit.prevent="createUser">
			<Card>
				<CardHeader>
					<CardTitle>Información del Usuario</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<!-- Campo Nombre -->
						<div class="flex flex-col gap-2">
							<Label for="name">Nombre Completo</Label>
							<Input
								id="name"
								v-model="newUser.name"
								placeholder="Ej: John Doe"
								required
							/>
						</div>

						<!-- Campo Email -->
						<div class="flex flex-col gap-2">
							<Label for="email">Correo Electrónico</Label>
							<Input
								id="email"
								type="email"
								v-model="newUser.email"
								placeholder="Ej: john.doe@example.com"
								required
							/>
						</div>

						<!-- Campo Rol -->
						<div class="flex flex-col gap-2">
							<Label for="role">Rol</Label>
							<Select v-model="newUser.role">
								<SelectTrigger id="role">
									<SelectValue placeholder="Selecciona un rol" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Admin">Admin</SelectItem>
									<SelectItem value="Editor">Editor</SelectItem>
									<SelectItem value="Viewer">Viewer</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<!-- Campo Estado -->
						<div class="flex flex-col gap-2">
							<Label for="status">Estado</Label>
							<Select v-model="newUser.status">
								<SelectTrigger id="status">
									<SelectValue placeholder="Selecciona un estado" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Active">Activo</SelectItem>
									<SelectItem value="Inactive">Inactivo</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>
			<div class="mt-6 flex justify-end-safe gap-3">
				<Button type="button" variant="outline" @click="handleCancel"> Cancelar </Button>
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
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					<span v-if="isSaving">Guardando...</span>
					<span v-else>Guardar Usuario</span>
				</Button>
			</div>
		</form>
	</div>
</template>
