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

// --- Estado del Formulario ---
const sapId = ref("");
const isImporting = ref(false);
const isSaving = ref(false);
const router = useRouter();

const providerData = ref<null | {
  nombre: string;
  rfc: string;
  pais: string;
  estado: string;
  municipio: string;
  ciudad: string;
  codigoPostal: string;
  numeroExt: string;
  calle: string;
}>(null);

const userFields = ref({
  usuario: "",
  email: "",
});

// --- Simulación de servicio de importación ---
const fakeImportProvider = (id: string) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === "0000") {
        reject(new Error("Proveedor no encontrado en SAP."));
      } else {
        resolve({
          nombre: "Proveedor Ejemplo S.A. de C.V.",
          rfc: "PEJ123456789",
          pais: "México",
          estado: "Jalisco",
          municipio: "Guadalajara",
          ciudad: "Guadalajara",
          codigoPostal: "44100",
          numeroExt: "123",
          calle: "Av. Ejemplo",
        });
      }
    }, 1200);
  });

const handleImport = async () => {
  if (!sapId.value) {
    toast.error("Debes ingresar un ID de proveedor SAP.");
    return;
  }
  isImporting.value = true;
  providerData.value = null;
  try {
    const data = await fakeImportProvider(sapId.value);
    providerData.value = data as typeof providerData.value;
    toast.success("Proveedor importado correctamente.");
  } catch (error: unknown) {
    let message = "No se pudo importar el proveedor.";
    if (error instanceof Error && error.message) {
      message = error.message;
    }
    toast.error("Error al importar proveedor", {
      description: message,
    });
  } finally {
    isImporting.value = false;
  }
};

const handleCancel = () => {
  router.back();
};

const fakeApiSave = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userFields.value.email === "ya@existe.com") {
        reject(new Error("El correo electrónico ya está en uso."));
      } else {
        resolve({ success: true });
      }
    }, 1500);
  });

const handleCreate = async () => {
  if (!providerData.value) {
    toast.error("Primero debes importar un proveedor.");
    return;
  }
  if (!userFields.value.usuario || !userFields.value.email) {
    toast.error("El usuario y el correo electrónico son obligatorios.");
    return;
  }
  isSaving.value = true;
  try {
    await fakeApiSave();
    toast.success("Proveedor creado exitosamente.");
    router.push("/providers");
  } catch (error: unknown) {
    let message = "No se pudo crear el proveedor.";
    if (error instanceof Error && error.message) {
      message = error.message;
    }
    toast.error("Error al crear proveedor", {
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
      <h1 class="text-2xl font-bold md:text-3xl">Crear Nuevo Proveedor</h1>
    </div>

    <form @submit.prevent="handleCreate">
      <Card>
        <CardHeader>
          <CardTitle>Importar Proveedor SAP</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div class="flex flex-col gap-2">
              <Label for="sap-id">ID Proveedor SAP</Label>
              <Input id="sap-id" v-model="sapId" placeholder="Ej: 12345" :disabled="isImporting" required />
            </div>
            <div class="md:col-span-2 flex gap-3">
              <Button type="button" class="mt-6" :disabled="isImporting || !sapId" @click="handleImport">
                <svg v-if="isImporting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                <span v-if="isImporting">Importando...</span>
                <span v-else>Importar proveedor</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card v-if="providerData" class="mt-6">
        <CardHeader>
          <CardTitle>Datos del Proveedor</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Usuario -->
            <div class="flex flex-col gap-2">
              <Label for="usuario">Usuario</Label>
              <Input id="usuario" v-model="userFields.usuario" placeholder="Ej: proveedor123" required />
            </div>
            <!-- Correo -->
            <div class="flex flex-col gap-2">
              <Label for="email">Correo electrónico</Label>
              <Input id="email" type="email" v-model="userFields.email" placeholder="Ej: proveedor@correo.com"
                required />
            </div>
            <!-- Nombre / Razón Social -->
            <div class="flex flex-col gap-2">
              <Label for="nombre">Nombre / Razón Social</Label>
              <Input id="nombre" v-model="providerData.nombre" required disabled />
            </div>
            <!-- RFC -->
            <div class="flex flex-col gap-2">
              <Label for="rfc">RFC</Label>
              <Input id="rfc" v-model="providerData.rfc" required disabled />
            </div>
            <!-- País -->
            <div class="flex flex-col gap-2">
              <Label for="pais">País</Label>
              <Input id="pais" v-model="providerData.pais" required disabled />
            </div>
            <!-- Estado -->
            <div class="flex flex-col gap-2">
              <Label for="estado">Estado</Label>
              <Input id="estado" v-model="providerData.estado" required disabled />
            </div>
            <!-- Municipio -->
            <div class="flex flex-col gap-2">
              <Label for="municipio">Municipio</Label>
              <Input id="municipio" v-model="providerData.municipio" required disabled />
            </div>
            <!-- Ciudad -->
            <div class="flex flex-col gap-2">
              <Label for="ciudad">Ciudad</Label>
              <Input id="ciudad" v-model="providerData.ciudad" required disabled />
            </div>
            <!-- Código Postal -->
            <div class="flex flex-col gap-2">
              <Label for="codigo-postal">Código Postal</Label>
              <Input id="codigo-postal" v-model="providerData.codigoPostal" required disabled />
            </div>
            <!-- Número Ext -->
            <div class="flex flex-col gap-2">
              <Label for="numero-ext">Número Ext.</Label>
              <Input id="numero-ext" v-model="providerData.numeroExt" required disabled />
            </div>
            <!-- Calle -->
            <div class="flex flex-col gap-2 md:col-span-2">
              <Label for="calle">Calle</Label>
              <Input id="calle" v-model="providerData.calle" required disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      <div class="mt-6 flex justify-end gap-3" v-if="providerData">
        <Button type="button" variant="outline" @click="handleCancel">
          Cancelar
        </Button>
        <Button type="submit" :disabled="isSaving">
          <svg v-if="isSaving" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          <span v-if="isSaving">Creando...</span>
          <span v-else>Crear Proveedor</span>
        </Button>
      </div>
    </form>
  </div>
</template>
