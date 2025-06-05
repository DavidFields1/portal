<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "vue-sonner"; // Importar toast de Sonner

const authStore = useAuthStore();

// --- Refs para los valores de configuración ---
// Inicializar con valores del store o defaults
const userName = ref("");
const userEmail = ref(""); // Generalmente no editable, pero lo mostramos
const userBio = ref("");
const darkMode = ref(false); // Podrías leer esto de localStorage o una preferencia
const language = ref("es"); // Valor por defecto
const emailNotifications = ref(true);
const pushNotifications = ref(false);
const isLoading = ref(false); // Para estado de carga del botón guardar

// Cargar datos iniciales cuando el componente se monta
onMounted(() => {
    userName.value = authStore.user?.name || "";
    userEmail.value = authStore.user?.email || "";
    // Cargar otras preferencias si estuvieran guardadas (ej. localStorage)
    const savedDarkMode = localStorage.getItem("darkMode");
    darkMode.value = savedDarkMode === "true";
    // Simular carga de bio y notificaciones (en real vendría de API/Store)
    userBio.value = "Desarrollador/a apasionado/a por Vue y Tailwind.";
    emailNotifications.value = true;
    pushNotifications.value = false;
});

// --- Función para guardar cambios ---
const handleSaveChanges = async () => {
    isLoading.value = true;
    console.log("Guardando configuración:", {
        name: userName.value,
        bio: userBio.value,
        darkMode: darkMode.value,
        language: language.value,
        emailNotifications: emailNotifications.value,
        pushNotifications: pushNotifications.value,
    });

    // --- Simulación de llamada a API ---
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // --- Fin Simulación ---

    // Actualizar store si es necesario (ej. nombre)
    // authStore.updateUserProfile({ name: userName.value, ... });

    // Guardar preferencias locales (ej. dark mode)
    localStorage.setItem("darkMode", darkMode.value.toString());
    // Aquí podrías aplicar el modo oscuro realmente (añadiendo/quitando clase 'dark' al <html>)

    isLoading.value = false;
    toast.success("Configuración guardada exitosamente.");
};
</script>

<template>
    <div class="container mx-auto max-w-4xl py-6 md:py-10">
        <div class="mb-6 flex items-center justify-between">
            <h1 class="text-2xl font-bold md:text-3xl">Configuración</h1>
            <Button @click="handleSaveChanges" :disabled="isLoading">
                {{ isLoading ? "Guardando..." : "Guardar Cambios" }}
            </Button>
        </div>

        <Separator class="mb-8" />

        <div class="grid gap-8">
            <!-- Sección Perfil -->
            <Card>
                <CardHeader>
                    <CardTitle>Perfil</CardTitle>
                    <CardDescription>
                        Actualiza la información de tu perfil público.
                    </CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                    <div class="grid gap-2">
                        <Label for="name">Nombre</Label>
                        <Input id="name" v-model="userName" :disabled="isLoading" />
                    </div>
                    <div class="grid gap-2">
                        <Label for="email">Email</Label>
                        <Input id="email" type="email" :value="userEmail" disabled />
                        <p class="text-xs text-muted-foreground">
                            El email no se puede cambiar desde aquí.
                        </p>
                    </div>
                    <div class="grid gap-2">
                        <Label for="bio">Biografía</Label>
                        <Textarea id="bio" v-model="userBio" placeholder="Cuéntanos un poco sobre ti..."
                            :disabled="isLoading" />
                    </div>
                </CardContent>
            </Card>

            <!-- Sección Apariencia -->
            <Card>
                <CardHeader>
                    <CardTitle>Apariencia</CardTitle>
                    <CardDescription>
                        Personaliza cómo se ve la aplicación.
                    </CardDescription>
                </CardHeader>
                <CardContent class="space-y-6">
                    <div class="flex items-center justify-between space-x-2 rounded-md border p-4">
                        <Label for="dark-mode" class="flex flex-col space-y-1">
                            <span>Modo Oscuro</span>
                            <span class="text-xs font-normal leading-snug text-muted-foreground">
                                Activa el tema oscuro para la interfaz.
                            </span>
                        </Label>
                        <Switch id="dark-mode" :checked="darkMode" @update:checked="darkMode = $event"
                            :disabled="isLoading" />
                    </div>
                    <div class="grid w-full max-w-sm items-center gap-2">
                        <Label for="language">Idioma</Label>
                        <Select v-model="language" :disabled="isLoading">
                            <SelectTrigger id="language">
                                <SelectValue placeholder="Selecciona un idioma" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="es">Español</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="fr" disabled>Français (Próx.)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <!-- Sección Notificaciones -->
            <Card>
                <CardHeader>
                    <CardTitle>Notificaciones</CardTitle>
                    <CardDescription>
                        Gestiona cómo quieres recibir notificaciones.
                    </CardDescription>
                </CardHeader>
                <CardContent class="space-y-6">
                    <div class="flex items-center justify-between space-x-2 rounded-md border p-4">
                        <Label for="email-notifications" class="flex flex-col space-y-1">
                            <span>Notificaciones por Email</span>
                            <span class="text-xs font-normal leading-snug text-muted-foreground">
                                Recibe resúmenes y alertas importantes por correo.
                            </span>
                        </Label>
                        <Switch id="email-notifications" :checked="emailNotifications"
                            @update:checked="emailNotifications = $event" :disabled="isLoading" />
                    </div>
                    <div class="flex items-center justify-between space-x-2 rounded-md border p-4">
                        <Label for="push-notifications" class="flex flex-col space-y-1">
                            <span>Notificaciones Push</span>
                            <span class="text-xs font-normal leading-snug text-muted-foreground">
                                Recibe notificaciones en tiempo real en tu navegador (si está soportado).
                            </span>
                        </Label>
                        <Switch id="push-notifications" :checked="pushNotifications"
                            @update:checked="pushNotifications = $event" :disabled="isLoading" />
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
</template>
