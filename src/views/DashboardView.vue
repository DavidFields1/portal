<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Activity, DollarSign, ShoppingCart, UserCircle, Settings } from 'lucide-vue-next'

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'vue-chartjs'
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
)
// --- Fin Chart.js ---

const authStore = useAuthStore()
const router = useRouter()

// --- Datos Simulados para KPIs (sin cambios) ---
const totalUsers = ref(1256)
const monthlyRevenue = ref(8450.75)
const newOrders = ref(352)
const activeSessions = ref(48)
// --- Fin Datos KPIs ---

// --- Datos y Opciones para Gráficos (sin cambios) ---
const lineChartData = computed(() => ({
	/* ... */ labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio'],
  datasets: [
    {
      label: 'Ingresos (€)',
      backgroundColor: 'hsla(217, 91%, 60%, 0.2)',
      borderColor: 'hsl(217, 91%, 60%)',
      tension: 0.3,
      fill: true,
      data: [6500, 5900, 8000, 8100, 7600, 7500, 8450],
    },
  ],
}))
const lineChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, title: { display: true, text: 'Ingresos Mensuales' } },
  scales: {
    y: { beginAtZero: true, ticks: { callback: (value: number) => `€${value / 1000}k` } },
  },
})
const barChartData = computed(() => ({
	/* ... */ labels: ['Admin', 'Editor', 'Viewer', 'Guest'],
  datasets: [
    {
      label: 'Número de Usuarios',
      backgroundColor: [
        'hsl(217, 91%, 60%)',
        'hsl(210, 40%, 96.1%)',
        'hsl(0, 0%, 63.9%)',
        'hsl(24.6, 95%, 53.1%)',
      ],
      borderRadius: 4,
      data: [56, 320, 850, 30],
    },
  ],
}))
const barChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: { display: false },
    title: { display: true, text: 'Distribución de Usuarios por Rol' },
  },
  scales: {
    x: { beginAtZero: true, title: { display: true, text: 'Cantidad' } },
    y: { grid: { display: false } },
  },
})
const doughnutChartData = computed(() => ({
	/* ... */ labels: ['Directo', 'Referido', 'Orgánico', 'Social'],
  datasets: [
    {
      backgroundColor: [
        'hsl(217, 91%, 60%)',
        'hsl(142.1, 76.2%, 36.3%)',
        'hsl(24.6, 95%, 53.1%)',
        'hsl(346.8, 77.2%, 49.8%)',
      ],
      data: [40, 25, 20, 15],
    },
  ],
}))
const doughnutChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    title: { display: true, text: 'Fuentes de Tráfico (Ejemplo)' },
  },
})
// --- Fin Datos Gráficos ---

// Helper para iniciales
const getInitials = (name: string | undefined): string => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
</script>

<template>
  <div class="container mx-auto flex flex-col gap-6 py-6 md:gap-8 md:py-10">
    <!-- {/* Saludo */} -->
    <h1 class="text-2xl font-bold md:text-3xl">
      ¡Bienvenido de nuevo, {{ authStore.user?.nombre || 'Usuario' }}!
    </h1>

    <!-- {/* --- INICIO: Tarjeta de Perfil de Usuario (Tamaño Ajustado) --- */} -->
    <Card class="w-full mb-4">
      <CardContent class="flex items-center justify-between p-4">
        <!-- {/* Info Izquierda: Avatar + Texto */} -->
        <div class="flex items-center gap-4">
          <Avatar class="h-14 w-14 border">
            <AvatarImage :src="''" alt="Avatar" />
            <AvatarFallback>
              <UserCircle v-if="!authStore.user?.nombre" class="h-6 w-6" />
              <span class="text-lg">{{ getInitials(authStore.user?.nombre) }}</span>
            </AvatarFallback>
          </Avatar>
          <div class="space-y-1">
            <p class="text-base font-semibold">
              {{ authStore.user?.nombre || 'Usuario Desconocido' }}
            </p>
            <p class="text-sm text-muted-foreground">{{ authStore.user?.email_address }}</p>
            <Badge v-if="authStore.user?.permisos" variant="outline" class="mt-1 text-xs">{{
              authStore.user.permisos[0]
            }}</Badge>
          </div>
        </div>
        <!-- {/* Botón Derecha */} -->
        <Button variant="ghost" size="sm" @click="router.push('/settings')">
          <Settings class="mr-1 h-4 w-4" />
          Config.
        </Button>
      </CardContent>
    </Card>
    <!-- {/* --- FIN: Tarjeta de Perfil de Usuario --- */} -->

    <!-- {/* Fila de Tarjetas KPI (Verificar estructura estándar) */} -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <!-- {/* KPI Card 1: Ingresos */} -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Ingresos Totales</CardTitle>
          <DollarSign class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            €{{ monthlyRevenue.toLocaleString('es-ES') }}
          </div>
          <p class="text-xs text-muted-foreground">+5.2% desde el mes pasado</p>
        </CardContent>
      </Card>
      <!-- {/* KPI Card 2: Usuarios */} -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Usuarios Totales</CardTitle>
          <Users class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ totalUsers }}</div>
          <p class="text-xs text-muted-foreground">+120 este mes</p>
        </CardContent>
      </Card>
      <!-- {/* KPI Card 3: Pedidos */} -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Nuevos Pedidos</CardTitle>
          <ShoppingCart class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">+{{ newOrders }}</div>
          <p class="text-xs text-muted-foreground">+15% desde ayer</p>
        </CardContent>
      </Card>
      <!-- {/* KPI Card 4: Sesiones */} -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Sesiones Activas</CardTitle>
          <Activity class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ activeSessions }}</div>
          <p class="text-xs text-muted-foreground">Usuarios ahora mismo</p>
        </CardContent>
      </Card>
    </div>

    <!-- {/* Fila de Gráficos y Actividad Reciente */} -->
    <div class="grid gap-4 md:gap-8 lg:grid-cols-2">
      <!-- {/* Gráfico de Línea */} -->
      <Card class="lg:col-span-1">
        <CardHeader></CardHeader>
        <CardContent class="pl-2">
          <div class="h-72 w-full">
            <!-- @vue-expect-error -->
            <Line :data="lineChartData" :options="lineChartOptions" />
          </div>
        </CardContent>
      </Card>

      <!-- {/* Gráfico de Barras */} -->
      <Card class="lg:col-span-1">
        <CardHeader></CardHeader>
        <CardContent>
          <div class="h-72 w-full">
            <!-- @vue-expect-error -->
            <Bar :data="barChartData" :options="barChartOptions" />
          </div>
        </CardContent>
      </Card>

      <!-- {/* Gráfico de Dona */} -->
      <Card class="lg:col-span-1">
        <CardHeader></CardHeader>
        <CardContent>
          <div class="relative mx-auto h-72 w-full max-w-xs">
            <!-- @vue-expect-error -->
            <Doughnut :data="doughnutChartData" :options="doughnutChartOptions" />
          </div>
        </CardContent>
      </Card>

      <!-- {/* Card de Actividad Reciente (Verificar estructura estándar) */} -->
      <Card class="lg:col-span-1">
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimas acciones en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul>
            <li class="mb-2 border-b pb-2 text-xs">
              Usuario 'Alice' actualizó perfil.
            </li>
            <li class="mb-2 border-b pb-2 text-xs">Nuevo pedido #1234 recibido.</li>
            <li class="text-xs">Usuario 'Bob' creó un nuevo reporte.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
