<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Terminal, Image } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const registrationMessage = ref<string | null>(null)

const handleRegister = async () => {
	registrationMessage.value = null
	authStore.error = null

	if (!name.value || !email.value || !password.value || !confirmPassword.value) {
		authStore.error = 'Por favor, completa todos los campos.'
		return
	}
	if (password.value !== confirmPassword.value) {
		authStore.error = 'Las contraseñas no coinciden.'
		return
	}

	const success = await authStore.register(name.value, email.value, password.value)

	if (success) {
		registrationMessage.value = '¡Registro exitoso! Serás redirigido a la página de login.'
		setTimeout(() => {
			router.push('/login')
		}, 2000)
	}
}
</script>

<template>
	<div class="flex min-h-screen items-center justify-center bg-muted/40">
		<div class="mx-auto flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-lg">
			<!-- Columna Izquierda: Registro -->
			<div class="flex w-full flex-col justify-center px-8 py-12 md:w-1/2">
				<!-- Logo y nombre -->
				<div class="mb-8 flex items-center gap-2">
					<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
						<Image class="h-5 w-5 text-muted-foreground" />
					</div>
					<span class="text-lg font-semibold">Acme Inc.</span>
				</div>
				<Card class="w-full max-w-sm mx-auto shadow-none border-none">
					<CardHeader>
						<CardTitle class="text-2xl text-center">Crear Cuenta</CardTitle>
						<CardDescription class="text-center">
							Ingresa tus datos para registrarte en el portal.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Alert v-if="authStore.error" variant="destructive" class="mb-4">
							<Terminal class="h-4 w-4" />
							<AlertTitle>Error de Registro</AlertTitle>
							<AlertDescription>
								{{ authStore.error }}
							</AlertDescription>
						</Alert>
						<Alert v-if="registrationMessage" variant="default" class="mb-4">
							<Terminal class="h-4 w-4" />
							<AlertTitle>Registro Completado</AlertTitle>
							<AlertDescription>
								{{ registrationMessage }}
							</AlertDescription>
						</Alert>
						<form @submit.prevent="handleRegister">
							<div class="grid gap-4">
								<div class="grid gap-2">
									<Label for="name">Nombre</Label>
									<Input
										id="name"
										placeholder="Tu Nombre"
										required
										v-model="name"
										:disabled="authStore.loading"
									/>
								</div>
								<div class="grid gap-2">
									<Label for="email">Email</Label>
									<Input
										id="email"
										type="email"
										placeholder="tu@email.com"
										required
										v-model="email"
										:disabled="authStore.loading"
									/>
								</div>
								<div class="grid gap-2">
									<Label for="password">Contraseña</Label>
									<Input
										id="password"
										type="password"
										required
										v-model="password"
										:disabled="authStore.loading"
									/>
								</div>
								<div class="grid gap-2">
									<Label for="confirm-password">Confirmar Contraseña</Label>
									<Input
										id="confirm-password"
										type="password"
										required
										v-model="confirmPassword"
										:disabled="authStore.loading"
									/>
								</div>
								<Button type="submit" class="w-full" :disabled="authStore.loading">
									{{ authStore.loading ? 'Registrando...' : 'Registrar' }}
								</Button>
							</div>
						</form>
					</CardContent>
					<CardFooter class="flex flex-col gap-2 items-center text-sm">
						<div>
							¿Ya tienes cuenta?
							<RouterLink to="/login" class="ml-1 underline hover:text-primary">
								Inicia Sesión
							</RouterLink>
						</div>
					</CardFooter>
				</Card>
			</div>
			<!-- Columna Derecha: Imagen o Ilustración -->
			<div class="hidden bg-muted md:flex md:w-1/2 items-center justify-center">
				<div class="flex flex-col items-center justify-center">
					<div class="rounded-full bg-muted-foreground/10 p-6">
						<Image class="h-12 w-12 text-muted-foreground" />
					</div>
					<!-- Aquí puedes poner una imagen, ilustración o branding -->
				</div>
			</div>
		</div>
	</div>
</template>
