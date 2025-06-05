<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth"; // Importar store
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Importar Alert
import { Terminal } from "lucide-vue-next"; // Icono para Alert

const router = useRouter();
const authStore = useAuthStore(); // Usar store
const email = ref("admin@test.com"); // Pre-rellenar para demo
const password = ref("password"); // Pre-rellenar para demo

const handleLogin = async () => {
    if (!email.value || !password.value) {
        // Ya no usamos alert, el store manejará el error si la API falla
        return;
    }
    const success = await authStore.login(email.value, password.value);
    if (success) {
        router.push("/"); // Redirige al dashboard si el login fue exitoso
    }
    // El error se mostrará automáticamente via authStore.error
};
</script>

<template>
    <div class="flex min-h-screen items-center justify-center bg-background">
        <Card class="w-full max-w-sm">
            <CardHeader>
                <CardTitle class="text-2xl">Iniciar Sesión</CardTitle>
                <CardDescription>
                    Ingresa tu email y contraseña para acceder al portal. <br />
                    (Demo: admin@test.com / password)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <!-- Mostrar Alerta de Error -->
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
                            <Input id="password" type="password" required v-model="password"
                                :disabled="authStore.loading" />
                        </div>
                        <Button type="submit" class="w-full" :disabled="authStore.loading">
                            {{ authStore.loading ? "Ingresando..." : "Ingresar" }}
                        </Button>
                    </div>
                </form>
            </CardContent>
            <CardFooter class="flex justify-center text-sm">
                ¿No tienes cuenta?
                <RouterLink to="/register" class="ml-1 underline hover:text-primary">
                    Regístrate
                </RouterLink>
            </CardFooter>
        </Card>
    </div>
</template>
