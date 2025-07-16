<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MoreHorizontal,
  PlusCircle,
  User,
  Lock,
  Pencil,
  Trash2,
  Calendar,
  DollarSign,
  GitCompareArrows,
  PencilIcon,
  UserCircleIcon,
  UserIcon,
  BadgeCheckIcon,
  CalendarIcon,
  IdCardIcon,
  MailIcon,
  GlobeIcon,
  CheckCircleIcon,
  PhoneIcon,
  Smartphone,
  LinkIcon,
  MapPinIcon,
  MapIcon,
  BuildingIcon,
  HashIcon,
} from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Estado del segmento seleccionado
const selectedSection = ref<'cuenta' | 'bloqueos' | 'desviaciones'>('cuenta')

// ... (los mismos datos simulados y métodos que antes)
const accountData = {
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  nombreCompleto: 'Juan Pérez',
  username: 'juanperez',
  role: 'administrador',
  joinDate: '2024-01-15',
  email: 'juan.perez@example.com',
  rfc: 'PEMJ850615XXX',
  pais: 'México',
  status: 'Activo',
  telefono: '+52 55 1234 5678',
  celular: '+52 1 55 8765 4321',
  web: 'www.juanperez.com',
  direccion: {
    calle: 'Av. Reforma 123',
    ciudad: 'CDMX',
    estado: 'Ciudad de México',
    codigoPostal: '06500',
  },
  lastLogin: '2025-07-16T14:30:00',
  twoFactor: true,
  activeDevices: 4,
  subscription: {
    plan: 'Premium',
    renewal: '2025-08-01',
    cardLast4: '4242',
  },
}

const bloqueos = ref([
  {
    id: 'b1',
    nombre: 'Bloqueo de pagos',
    descripcion: 'Restringe el acceso al módulo de pagos.',
    modulos: ['Pagos', 'Facturación'],
    fechaCreacion: '2024-06-01T10:00:00Z',
  },
  {
    id: 'b2',
    nombre: 'Bloqueo de reportes',
    descripcion: 'No permite generar reportes financieros.',
    modulos: ['Reportes'],
    fechaCreacion: '2024-06-10T15:30:00Z',
  },
])

const desviaciones = ref([
  {
    id: 'd1',
    descripcion: 'Desviación de gastos menores',
    moneda: 'MXN',
    monto: 5000,
    estatus: 'Activo',
    fechaCreacion: '2024-05-20T09:00:00Z',
    fechaModificacion: '2024-06-01T12:00:00Z',
  },
  {
    id: 'd2',
    descripcion: 'Desviación de compras urgentes',
    moneda: 'USD',
    monto: 1000,
    estatus: 'Inactivo',
    fechaCreacion: '2024-05-25T11:00:00Z',
    fechaModificacion: '2024-06-05T14:00:00Z',
  },
])

const editBloqueo = (id: string) => alert(`Editar bloqueo ${id}`)
const deleteBloqueo = (id: string) => alert(`Eliminar bloqueo ${id}`)

const editDesviacion = (id: string) => alert(`Editar desviación ${id}`)
const deleteDesviacion = (id: string) => alert(`Eliminar desviación ${id}`)

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
</script>

<template>
  <div class="container mx-auto py-6 md:py-10">
    <h1 class="text-2xl font-bold md:text-3xl mb-6">Configuración</h1>

    <!-- Segmented control con iconos -->
    <div class="flex gap-2 mb-8">
      <Button :variant="selectedSection === 'cuenta' ? 'default' : 'outline'" :class="selectedSection === 'cuenta'
          ? 'rounded-r-none bg-secondary-foreground/70 text-white hover:bg-secondary-foreground'
          : 'rounded-r-none'
        " class="rounded-r-none font-semibold flex items-center gap-2" @click="selectedSection = 'cuenta'">
        <User class="h-5 w-5" /> Cuenta
      </Button>
      <Button :variant="selectedSection === 'bloqueos' ? 'default' : 'outline'" :class="selectedSection === 'bloqueos'
          ? 'rounded-r-none bg-secondary-foreground/70 text-white hover:bg-secondary-foreground'
          : 'rounded-r-none'
        " class="rounded-none font-semibold flex items-center gap-2" @click="selectedSection = 'bloqueos'">
        <Lock class="h-5 w-5" /> Bloqueos
      </Button>
      <Button :variant="selectedSection === 'desviaciones' ? 'default' : 'outline'" :class="selectedSection === 'desviaciones'
          ? 'rounded-r-none bg-secondary-foreground/70 text-white hover:bg-secondary-foreground'
          : 'rounded-r-none'
        " class="rounded-l-none font-semibold flex items-center gap-2" @click="selectedSection = 'desviaciones'">
        <GitCompareArrows class="h-5 w-5" /> Desviaciones
      </Button>
    </div>

    <!-- Sección Cuenta -->
    <div v-if="selectedSection === 'cuenta'">
      <!-- Botón de edición -->
      <div class="flex justify-end mb-4">
        <Button>
          <PencilIcon class="mr-2 h-4 w-4" /> Editar
        </Button>
      </div>

      <!-- Grid de subsecciones -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Información Personal -->
        <Card class="hover:shadow-lg">
          <CardHeader>
            <div class="flex items-center gap-2">
              <UserCircleIcon class="h-5 w-5" />
              <CardTitle class="text-lg font-bold text-primary">
                Información Personal
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center gap-4">
              <img :src="accountData.avatar" alt="Avatar" class="h-16 w-16 rounded-full border-2 border-primary" />
              <div>
                <p class="text-sm text-muted-foreground">Nombre Completo</p>
                <p class="text-base font-semibold">
                  {{ accountData.nombreCompleto }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <UserIcon class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm text-muted-foreground">Usuario</p>
                <p class="text-base font-semibold">
                  {{ accountData.username }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <BadgeCheckIcon class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm text-muted-foreground">Rol</p>
                <p class="text-base font-semibold capitalize">
                  {{ accountData.role }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <CalendarIcon class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm text-muted-foreground">Fecha de alta</p>
                <p class="text-base font-semibold">
                  {{ formatDate(accountData.joinDate) }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Cuenta -->
        <Card class="hover:shadow-lg">
          <CardHeader>
            <div class="flex items-center gap-2">
              <IdCardIcon class="h-5 w-5" />
              <CardTitle class="text-lg font-bold text-primary"> Cuenta </CardTitle>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center gap-3">
              <MailIcon class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm text-muted-foreground">Correo Electrónico</p>
                <p class="text-base font-semibold">
                  {{ accountData.email }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <IdCardIcon class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm text-muted-foreground">RFC</p>
                <p class="text-base font-semibold">
                  {{ accountData.rfc }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <GlobeIcon class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm text-muted-foreground">País</p>
                <p class="text-base font-semibold">
                  {{ accountData.pais }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <CheckCircleIcon class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm text-muted-foreground">Estado</p>
                <p class="text-base font-semibold">
                  {{ accountData.status }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Contacto -->
        <Card class="hover:shadow-lg">
          <CardHeader>
            <div class="flex items-center gap-2">
              <MailIcon class="h-5 w-5" />
              <CardTitle class="text-lg font-bold text-primary"> Contacto </CardTitle>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center gap-3">
              <PhoneIcon class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm text-muted-foreground">Teléfono</p>
                <p class="text-base font-semibold">
                  {{ accountData.telefono }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <Smartphone class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm text-muted-foreground">Celular</p>
                <p class="text-base font-semibold">
                  {{ accountData.celular }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <LinkIcon class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm text-muted-foreground">Sitio Web</p>
                <p class="text-base font-semibold">
                  {{ accountData.web }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Ubicación -->
        <Card class="hover:shadow-lg">
          <CardHeader>
            <div class="flex items-center gap-2">
              <MapPinIcon class="h-5 w-5" />
              <CardTitle class="text-lg font-bold text-primary">
                Ubicación
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center gap-3">
              <MapIcon class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm text-muted-foreground">Calle</p>
                <p class="text-base font-semibold">
                  {{ accountData.direccion.calle }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <BuildingIcon class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm text-muted-foreground">Ciudad</p>
                <p class="text-base font-semibold">
                  {{ accountData.direccion.ciudad }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <MapIcon class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm text-muted-foreground">Estado</p>
                <p class="text-base font-semibold">
                  {{ accountData.direccion.estado }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <HashIcon class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm text-muted-foreground">CP</p>
                <p class="text-base font-semibold">
                  {{ accountData.direccion.codigoPostal }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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
                <CardTitle class="text-lg font-bold">{{
                  bloqueo.nombre
                  }}</CardTitle>
                <p class="text-sm text-muted-foreground">
                  {{ bloqueo.descripcion }}
                </p>
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
                  : 'border-red-500 text-red-600 bg-transparent font-bold'
                " class="text-sm">
                {{ desv.estatus }}
              </Badge>
            </div>
          </CardContent>
          <CardFooter class="text-xs justify-end text-muted-foreground flex items-center gap-2 pt-2">
            <Calendar class="h-4 w-4" />
            <span>Creado: {{ formatDate(desv.fechaCreacion) }} | Modificado:
              {{ formatDate(desv.fechaModificacion) }}</span>
          </CardFooter>
        </Card>
      </div>
    </div>
  </div>
</template>
