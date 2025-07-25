<script setup lang="ts">
import { computed, ref } from 'vue'

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
</script>
<template>
        <!-- {/* Fila de Gráficos y Actividad Reciente */} -->
        <div class="grid gap-4 md:gap-8 lg:grid-cols-2">
      <!-- {/* Gráfico de Línea */} -->
      <Card class="lg:col-span-1">
        <CardHeader></CardHeader>
        <CardContent class="pl-2">
          <div class="h-72 w-full">
            
            <Line :data="lineChartData" :options="lineChartOptions" />
          </div>
        </CardContent>
      </Card>

      <!-- {/* Gráfico de Barras */} -->
      <Card class="lg:col-span-1">
        <CardHeader></CardHeader>
        <CardContent>
          <div class="h-72 w-full">
            
            <Bar :data="barChartData" :options="barChartOptions" />
          </div>
        </CardContent>
      </Card>

      <!-- {/* Gráfico de Dona */} -->
      <Card class="lg:col-span-1">
        <CardHeader></CardHeader>
        <CardContent>
          <div class="relative mx-auto h-72 w-full max-w-xs">
            
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
</template>