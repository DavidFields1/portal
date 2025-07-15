<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal, PlusCircle, User, Lock, Pencil, Trash2,
  UserCircle, Calendar, DollarSign,
  // Iconos adicionales para la sección de Cuenta
  Building, Mail, IdCard, Globe, Phone,
  GitCompareArrows,
} from "lucide-vue-next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Estado del segmento seleccionado
const selectedSection = ref<"cuenta" | "bloqueos" | "desviaciones">("cuenta");

// ... (los mismos datos simulados y métodos que antes)
const accountData = ref({
  nombre: "Empresa Ejemplo S.A. de C.V.",
  email: "contacto@empresa.com",
  rfc: "EJEMPLO123456",
  pais: "México",
  telefono: "+52 33 1234 5678",
});

const bloqueos = ref([
  {
    id: "b1",
    nombre: "Bloqueo de pagos",
    descripcion: "Restringe el acceso al módulo de pagos.",
    modulos: ["Pagos", "Facturación"],
    fechaCreacion: "2024-06-01T10:00:00Z",
  },
  {
    id: "b2",
    nombre: "Bloqueo de reportes",
    descripcion: "No permite generar reportes financieros.",
    modulos: ["Reportes"],
    fechaCreacion: "2024-06-10T15:30:00Z",
  },
]);

const desviaciones = ref([
  {
    id: "d1",
    descripcion: "Desviación de gastos menores",
    moneda: "MXN",
    monto: 5000,
    estatus: "Activo",
    fechaCreacion: "2024-05-20T09:00:00Z",
    fechaModificacion: "2024-06-01T12:00:00Z",
  },
  {
    id: "d2",
    descripcion: "Desviación de compras urgentes",
    moneda: "USD",
    monto: 1000,
    estatus: "Inactivo",
    fechaCreacion: "2024-05-25T11:00:00Z",
    fechaModificacion: "2024-06-05T14:00:00Z",
  },
]);

const editBloqueo = (id: string) => alert(`Editar bloqueo ${id}`);
const deleteBloqueo = (id: string) => alert(`Eliminar bloqueo ${id}`);

const editDesviacion = (id: string) => alert(`Editar desviación ${id}`);
const deleteDesviacion = (id: string) => alert(`Eliminar desviación ${id}`);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
</script>

<template>
  <div class="container mx-auto py-6 md:py-10">
    <h1 class="text-2xl font-bold md:text-3xl mb-6">Configuración</h1>

    <!-- Segmented control con iconos -->
    <div class="flex gap-2 mb-8">
      <Button :variant="selectedSection === 'cuenta' ? 'default' : 'outline'" :class="selectedSection === 'cuenta'
        ? 'rounded-r-none bg-secondary-foreground/70 text-white hover:bg-secondary-foreground'
        : 'rounded-r-none'" class="rounded-r-none font-semibold flex items-center gap-2"
        @click="selectedSection = 'cuenta'">
        <User class="h-5 w-5" /> Cuenta
      </Button>
      <Button :variant="selectedSection === 'bloqueos' ? 'default' : 'outline'" :class="selectedSection === 'bloqueos'
        ? 'rounded-r-none bg-secondary-foreground/70 text-white hover:bg-secondary-foreground'
        : 'rounded-r-none'" class="rounded-none font-semibold flex items-center gap-2"
        @click="selectedSection = 'bloqueos'">
        <Lock class="h-5 w-5" /> Bloqueos
      </Button>
      <Button :variant="selectedSection === 'desviaciones' ? 'default' : 'outline'" :class="selectedSection === 'desviaciones'
        ? 'rounded-r-none bg-secondary-foreground/70 text-white hover:bg-secondary-foreground'
        : 'rounded-r-none'" class="rounded-l-none font-semibold flex items-center gap-2"
        @click="selectedSection = 'desviaciones'">
        <GitCompareArrows class="h-5 w-5" /> Desviaciones
      </Button>
    </div>

    <!-- Sección Cuenta -->
    <div v-if="selectedSection === 'cuenta'">
      <Card class="transition-shadow hover:shadow-lg">
        <CardHeader>
          <div class="flex items-center gap-3">
            <UserCircle class="h-5 w-5 text-muted-foreground" />
            <CardTitle class="text-xl font-bold">Datos de la Cuenta</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4">
          <div class="flex items-center gap-3">
            <Building class="h-5 w-5 text-muted-foreground" />
            <div>
              <p class="text-sm font-medium text-muted-foreground">Nombre / Razón Social</p>
              <p class="text-base font-semibold">{{ accountData.nombre }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <Mail class="h-5 w-5 text-muted-foreground" />
            <div>
              <p class="text-sm font-medium text-muted-foreground">Correo Electrónico</p>
              <p class="text-base font-semibold">{{ accountData.email }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <IdCard class="h-5 w-5 text-muted-foreground" />
            <div>
              <p class="text-sm font-medium text-muted-foreground">RFC</p>
              <p class="text-base font-semibold">{{ accountData.rfc }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <Globe class="h-5 w-5 text-muted-foreground" />
            <div>
              <p class="text-sm font-medium text-muted-foreground">País</p>
              <p class="text-base font-semibold">{{ accountData.pais }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <Phone class="h-5 w-5 text-muted-foreground" />
            <div>
              <p class="text-sm font-medium text-muted-foreground">Teléfono</p>
              <p class="text-base font-semibold">{{ accountData.telefono }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Sección Bloqueos -->
    <div v-else-if="selectedSection === 'bloqueos'">
      <div class="flex justify-end mb-4">
        <Button @click="$router.push('/blocks/new')">
          <PlusCircle class="mr-2 h-4 w-4" /> Nuevo Bloqueo
        </Button>
      </div>
      <div class="grid gap-6">
        <Card v-for="bloqueo in bloqueos" :key="bloqueo.id" class="transition-shadow hover:border hover:border-primary">
          <CardHeader class="flex items-center justify-between pb-2">
            <div class="flex gap-5 items-center">
              <Lock class="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle class="text-lg font-bold">{{ bloqueo.nombre }}</CardTitle>
                <p class="text-sm text-muted-foreground">{{ bloqueo.descripcion }}</p>
              </div>
            </div>
            <!-- Menú de Acciones -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon" class="flex-shrink-0">
                  <MoreHorizontal class="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem @click="editBloqueo(bloqueo.id)">
                  <Pencil class="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem @click="deleteBloqueo(bloqueo.id)"
                  class="text-red-600 focus:bg-red-100 focus:text-red-700">
                  <Trash2 class="mr-2 h-4 w-4" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent class="pt-0">
            <p class="text-sm font-semibold mb-1">Módulos Bloqueados:</p>
            <div class="flex flex-wrap gap-2">
              <Badge v-for="mod in bloqueo.modulos" :key="mod" variant="secondary">
                {{ mod }}
              </Badge>
            </div>
          </CardContent>
          <CardFooter class="text-xs justify-end text-muted-foreground flex items-center gap-2">
            <Calendar class="h-4 w-4" />
            <span>Creado: {{ formatDate(bloqueo.fechaCreacion) }}</span>
          </CardFooter>
        </Card>
      </div>
    </div>

    <!-- Sección Desviaciones -->
    <div v-else>
      <div class="flex justify-end mb-4">
        <Button @click="$router.push('/deviation/new')">
          <PlusCircle class="mr-2 h-4 w-4" /> Nueva Desviación
        </Button>
      </div>
      <div class="grid gap-6">
        <Card v-for="desv in desviaciones" :key="desv.id" class="transition-shadow hover:border hover:border-primary">
          <CardHeader class="flex items-center justify-between pb-2">
            <div class="flex items-center gap-3">
              <GitCompareArrows class="h-5 w-5 text-muted-foreground" />
              <CardTitle class="text-lg font-bold">{{ desv.descripcion }}</CardTitle>
            </div>
            <!-- Menú de Acciones -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon" class="flex-shrink-0">
                  <MoreHorizontal class="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem @click="editDesviacion(desv.id)">
                  <Pencil class="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem @click="deleteDesviacion(desv.id)"
                  class="text-red-600 focus:bg-red-100 focus:text-red-700">
                  <Trash2 class="mr-2 h-4 w-4" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent class="flex items-end justify-between gap-4 pt-0">
            <!-- Monto -->
            <div class="flex items-center gap-3">
              <DollarSign class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm text-muted-foreground">Monto Permitido</p>
                <p class="text-xl font-bold flex items-baseline">
                  {{ desv.monto.toLocaleString() }}
                  <span class="text-base font-medium text-muted-foreground ml-1">{{ desv.moneda }}</span>
                </p>
              </div>
            </div>
            <!-- Estatus -->
            <div class="text-right">
              <p class="text-sm text-muted-foreground mb-1">Estatus</p>
              <Badge :class="desv.estatus === 'Activo'
                ? 'border-green-500 text-green-600 bg-transparent font-bold'
                : 'border-red-500 text-red-600 bg-transparent font-bold'" class="text-sm">
                {{ desv.estatus }}
              </Badge>
            </div>
          </CardContent>
          <CardFooter class="text-xs justify-end text-muted-foreground flex items-center gap-2 pt-2">
            <Calendar class="h-4 w-4" />
            <span>Creado: {{ formatDate(desv.fechaCreacion) }} | Modificado: {{ formatDate(desv.fechaModificacion)
            }}</span>
          </CardFooter>
        </Card>
      </div>
    </div>
  </div>
</template>
