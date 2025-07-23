<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Terminal, Image } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('admin@test.com')
const password = ref('password')

const handleLogin = async () => {
  if (!email.value || !password.value) return
  const success = await authStore.login(email.value, password.value)
  if (success) router.push('/')
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-muted/40">
    <div class="mx-auto flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-lg">
      <!-- Columna Izquierda: Login -->
      <div class="flex w-full flex-col justify-center px-8 py-12 md:w-1/2">
        <!-- Logo y nombre -->
        <div class="mb-8 flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
            <img src="../assets/logo.svg" alt="Reciboo" class="h-10 w-10 mb-1" />
          </div>
          <span class="text-lg font-semibold">Reciboo</span>
        </div>
        <Card class="w-full max-w-sm mx-auto shadow-none border-none">
          <CardHeader>
            <CardTitle class="text-2xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription class="text-center">
              Ingresa tu email y contraseña para acceder al portal.<br />
              <span class="text-xs text-muted-foreground">(Demo: admin@test.com / password)</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert v-if="authStore.error" variant="destructive" class="mb-4">
              <Terminal class="h-4 w-4" />
              <AlertTitle>Error de Autenticación</AlertTitle>
              <AlertDescription>
                {{ authStore.error }}
              </AlertDescription>
            </Alert>
            <form @submit.prevent="handleLogin">
              <div class="grid gap-4">
                <div class="grid gap-2">
                  <Label for="email">Email</Label>
                  <Input id="email" type="email" placeholder="tu@email.com" required v-model="email"
                    :disabled="authStore.loading" />
                </div>
                <div class="grid gap-2">
                  <Label for="password">Contraseña</Label>
                  <Input id="password" type="password" required v-model="password" :disabled="authStore.loading" />
                </div>
                <Button type="submit" class="w-full" :disabled="authStore.loading">
                  {{ authStore.loading ? 'Ingresando...' : 'Ingresar' }}
                </Button>
              </div>
            </form>
          </CardContent>
          <!-- <CardFooter class="flex flex-col gap-2 items-center text-sm">
						<div>
							¿No tienes cuenta?
							<RouterLink to="/register" class="ml-1 underline hover:text-primary">
								Regístrate
							</RouterLink>
						</div>
					</CardFooter> -->
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
