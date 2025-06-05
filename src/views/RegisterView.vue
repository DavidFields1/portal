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
const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const registrationMessage = ref<string | null>(null); // Mensaje de éxito

const handleRegister = async () => {
    registrationMessage.value = null; // Limpiar mensaje previo
    authStore.error = null; // Limpiar error previo del store

    if (
        !name.value ||
        !email.value ||
        !password.value ||
        !confirmPassword.value
    ) {
        authStore.error = "Por favor, completa todos los campos.";
        return;
    }
    if (password.value !== confirmPassword.value) {
        authStore.error = "Las contraseñas no coinciden.";
        return;
    }

    const success = await authStore.register(
        name.value,
        email.value,
        password.value,
    );

    if (success) {
        registrationMessage.value =
            "¡Registro exitoso! Serás redirigido a la página de login.";
        // Opcional: Redirigir automáticamente después de un delay
        setTimeout(() => {
            router.push("/login");
        }, 2000);
    }
    // El error se mostrará automáticamente via authStore.error
};
</script>

<template>
    <div class="flex min-h-screen items-center justify-center bg-background">
        <Card class="w-full max-w-sm">
            <CardHeader>
                <CardTitle class="text-2xl">Crear Cuenta</CardTitle>
                <CardDescription>
                    Ingresa tus datos para registrarte en el portal.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <!-- Mostrar Alerta de Error -->
                <Alert v-if="authStore.error" variant="destructive" class="mb-4">
                    <Terminal class="h-4 w-4" />
                    <AlertTitle>Error de Registro</AlertTitle>
                    <AlertDescription>
                        {{ authStore.error }}
                    </AlertDescription>
                </Alert>

                <!-- Mostrar Mensaje de Éxito -->
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
                            <Input id="name" placeholder="Tu Nombre" required v-model="name"
                                :disabled="authStore.loading" />
                        </div>
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
                        <div class="grid gap-2">
                            <Label for="confirm-password">Confirmar Contraseña</Label>
                            <Input id="confirm-password" type="password" required v-model="confirmPassword"
                                :disabled="authStore.loading" />
                        </div>
                        <Button type="submit" class="w-full" :disabled="authStore.loading">
                            {{ authStore.loading ? "Registrando..." : "Registrar" }}
                        </Button>
                    </div>
                </form>
            </CardContent>
            <CardFooter class="flex justify-center text-sm">
                ¿Ya tienes cuenta?
                <RouterLink to="/login" class="ml-1 underline hover:text-primary">
                    Inicia Sesión
                </RouterLink>
            </CardFooter>
        </Card>
    </div>
</template>
