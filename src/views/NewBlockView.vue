<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BloqueoForm = {
  nombre: string;
  descripcion: string;
  modulos: string[];
};

const newBloqueo = ref<BloqueoForm>({
  nombre: "",
  descripcion: "",
  modulos: [],
});

const modulesOptions = [
  "Pagos",
  "Facturación",
  "Reportes",
  "Usuarios",
  "Inventario",
];

const isSaving = ref(false);
const router = useRouter();

const handleCancel = () => {
  router.back();
};

const fakeApiSaveBloqueo = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (
        newBloqueo.value.nombre.toLowerCase() ===
        "bloqueo de pagos"
      ) {
        reject(
          new Error(
            "Ya existe un bloqueo con este nombre."
          )
        );
      } else {
        console.log(
          "Guardando bloqueo:",
          newBloqueo.value
        );
        resolve({ success: true });
      }
    }, 1500);
  });
};

const createBloqueo = async () => {
  if (
    !newBloqueo.value.nombre ||
    !newBloqueo.value.descripcion ||
    newBloqueo.value.modulos.length === 0
  ) {
    toast.error("Error de validación", {
      description:
        "Nombre, descripción y al menos un módulo son requeridos.",
    });
    return;
  }

  isSaving.value = true;
  try {
    await fakeApiSaveBloqueo();
    toast.success("Bloqueo Creado", {
      description: `El bloqueo ${newBloqueo.value.nombre} ha sido creado exitosamente.`,
    });
    router.push("/configuracion");
  } catch (error: unknown) {
    let message =
      "No se pudo crear el bloqueo. Inténtalo de nuevo.";
    if (error instanceof Error && error.message) {
      message = error.message;
    }
    toast.error("Error al guardar", {
      description: message,
    });
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="container mx-auto py-6 md:py-10">

    <div class="mb-6">
      <h1 class="text-2xl font-bold md:text-3xl">
        Crear Nuevo Bloqueo
      </h1>
    </div>

    <form @submit.prevent="createBloqueo">
      <Card>
        <CardHeader>
          <CardTitle>Información del Bloqueo</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Nombre -->
            <div class="flex flex-col gap-2">
              <Label for="nombre">Nombre</Label>
              <Input id="nombre" v-model="newBloqueo.nombre" placeholder="Ej: Bloqueo de pagos" required />
            </div>

            <!-- Descripción -->
            <div class="flex flex-col gap-2 md:col-span-2">
              <Label for="descripcion">Descripción</Label>
              <Input id="descripcion" v-model="newBloqueo.descripcion" placeholder="Describe el bloqueo" required />
            </div>

            <!-- Módulos a bloquear -->
            <div class="flex flex-col gap-2 md:col-span-2">
              <Label for="modulos">
                Módulos a Bloquear
              </Label>
              <Select id="modulos" v-model="newBloqueo.modulos" multiple>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Selecciona módulos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="mod in modulesOptions" :key="mod" :value="mod">
                    {{ mod }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div class="mt-6 flex justify-end gap-3">
        <Button type="button" variant="outline" @click="handleCancel">
          Cancelar
        </Button>
        <Button type="submit" :disabled="isSaving">
          <svg v-if="isSaving" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span v-if="isSaving">Guardando...</span>
          <span v-else>Guardar Bloqueo</span>
        </Button>
      </div>
    </form>
  </div>
</template>
