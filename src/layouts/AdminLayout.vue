<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import {
  // ... otros iconos ...
  LayoutDashboard,
  Users as UsersIcon,
  CreditCard,
  Settings2,
  ChevronRight,
  PanelLeft,
  LogOut,
  PackageCheck,
} from 'lucide-vue-next'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// --- Estado del Layout ---
const MOBILE_BREAKPOINT = 768
const sidebarOpen = ref(true)
const sidebarCollapsed = ref(false)
const isMobile = ref(false)
const openNavItems = ref<string[]>([])
const hoveredNavItem = ref<string | null>(null)
const hoverTimeout = ref<number | null>(null) // Estado para el temporizador

// --- Integración con el Auth Store ---
const authStore = useAuthStore()
const user = computed(() => authStore.user)

// --- Datos de Navegación (sin cambios) ---
const navMain = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, },
  {
    title: "Gestión", icon: UsersIcon, items: [{ title: "Usuarios", url: "/users" },
    { title: "Log de Peticiones", url: "/http-logs" },],
  },
  {
    title: "Facturación", icon: CreditCard, items: [
      { title: "Mis Facturas", url: "/invoices" },
      { title: "Carga de Factura con OC", url: "/invoice-upload" },
      { title: "Carga de Factura sin OC", url: "/invoice-upload-no-po" },
    ],
  },
  {
    title: "Complementos", icon: PackageCheck, items: [
      { title: "Mis Complementos", url: "/complements" },
      { title: "Complementos de Pago", url: "/complements-pay" },
    ],
  },
  { title: "Configuración", url: "/settings", icon: Settings2, },
]

// --- Métodos del Layout ---
const checkMobile = () => { isMobile.value = window.innerWidth < MOBILE_BREAKPOINT; if (isMobile.value) { sidebarCollapsed.value = false } }
const toggleSidebar = () => { if (isMobile.value) { sidebarOpen.value = !sidebarOpen.value } else { sidebarCollapsed.value = !sidebarCollapsed.value } }
const closeSidebar = () => { if (isMobile.value) { sidebarOpen.value = false } }
const toggleNavItem = (title: string) => { if (sidebarCollapsed.value && !isMobile.value) return; const index = openNavItems.value.indexOf(title); if (index > -1) { openNavItems.value.splice(index, 1) } else { openNavItems.value.push(title) } }
const isNavItemOpen = (title: string) => { return openNavItems.value.includes(title) && (!sidebarCollapsed.value || isMobile.value) }
const handleLogout = () => { authStore.logout() }
const getInitials = (name: string | undefined): string => { if (!name) return "U"; return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase(); };

// --- Métodos para Hover Intent (CORREGIDO) ---
const handleMouseEnter = (title: string) => {
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value)
    hoverTimeout.value = null
  }
  hoveredNavItem.value = title
}

const handleMouseLeave = () => {
  hoverTimeout.value = window.setTimeout(() => {
    hoveredNavItem.value = null
  }, 100) // Retraso de 100ms antes de cerrar
}

// --- Clases Computadas (sin cambios) ---
const sidebarClasses = computed(() => { if (isMobile.value) { return ['fixed left-0 top-0 z-50 h-screen w-64 transform bg-background border-r border-border transition-transform duration-300 ease-in-out', { 'translate-x-0': sidebarOpen.value, '-translate-x-full': !sidebarOpen.value, }] } else { return ['fixed left-0 top-0 z-40 h-screen bg-background border-r border-border transition-all duration-300 ease-in-out', { 'w-64': !sidebarCollapsed.value, 'w-20': sidebarCollapsed.value, }] } })
const mainContentClasses = computed(() => { if (isMobile.value) { return 'flex flex-1 flex-col' } else { return ['flex flex-1 flex-col transition-all duration-300 ease-in-out', { 'ml-64': !sidebarCollapsed.value, 'ml-20': sidebarCollapsed.value, }] } })

// --- Hooks de Ciclo de Vida (sin cambios) ---
onMounted(() => { checkMobile(); window.addEventListener('resize', checkMobile); if (isMobile.value) { sidebarOpen.value = false } })
onUnmounted(() => { window.removeEventListener('resize', checkMobile) })
</script>

<template>
  <div class="flex h-screen bg-background overflow-hidden">
    <!-- ... (Sidebar Header sin cambios) ... -->
    <aside :class="sidebarClasses">
      <div class="flex h-full flex-col">
        <div class="flex h-16 shrink-0 items-center border-b border-border"
          :class="[sidebarCollapsed && !isMobile ? 'justify-center' : 'px-4']">
          <RouterLink to="/" :class="['flex items-center', sidebarCollapsed && !isMobile ? '' : 'gap-2']">
            <LayoutDashboard class="h-6 w-6 text-primary" />
            <Transition enter-active-class="transition-opacity duration-200"
              leave-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
              leave-to-class="opacity-0"> <span v-if="!sidebarCollapsed || isMobile" class="font-semibold">Portal
                Admin</span> </Transition>
          </RouterLink>
        </div>

        <!-- Sidebar Content (CORREGIDO) -->
        <div class="flex-1 overflow-y-auto p-4">
          <nav class="space-y-1">
            <div v-for="item in navMain" :key="item.title">
              <!-- {/* Caso 1: Enlace simple (sin sub-items) */} -->
              <RouterLink v-if="!item.items" :to="item.url" @click="closeSidebar"
                class="flex w-full items-center gap-3 rounded-lg p-2 text-sm hover:bg-muted"
                :class="{ 'justify-center': sidebarCollapsed && !isMobile, 'bg-muted font-semibold': $route.path === item.url }"
                :title="sidebarCollapsed && !isMobile ? item.title : ''">
                <component :is="item.icon" class="h-5 w-5 shrink-0" />
                <Transition enter-active-class="transition-opacity duration-200"
                  leave-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
                  leave-to-class="opacity-0">
                  <span v-if="!sidebarCollapsed || isMobile" class="flex-1 text-left">{{ item.title }}</span>
                </Transition>
              </RouterLink>

              <!-- {/* Caso 2: Ítem con submenú */} -->
              <div v-else>
                <Popover :open="hoveredNavItem === item.title && sidebarCollapsed && !isMobile">
                  <PopoverTrigger as-child>
                    <button @click="toggleNavItem(item.title)" @mouseenter="handleMouseEnter(item.title)"
                      @mouseleave="handleMouseLeave"
                      class="flex w-full items-center gap-3 rounded-lg p-2 text-sm hover:bg-muted"
                      :class="{ 'justify-center': sidebarCollapsed && !isMobile }"
                      :title="sidebarCollapsed && !isMobile ? item.title : ''">
                      <component :is="item.icon" class="h-5 w-5 shrink-0" />
                      <Transition enter-active-class="transition-opacity duration-200"
                        leave-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
                        leave-to-class="opacity-0">
                        <span v-if="!sidebarCollapsed || isMobile" class="flex-1 text-left">{{ item.title }}</span>
                      </Transition>
                      <ChevronRight v-if="(!sidebarCollapsed || isMobile) && item.items"
                        class="ml-auto h-4 w-4 shrink-0 transition-transform duration-200"
                        :class="{ 'rotate-90': isNavItemOpen(item.title) }" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="right" align="start" class="ml-2 w-48 p-1"
                    @mouseenter="handleMouseEnter(item.title)" @mouseleave="handleMouseLeave">
                    <nav class="flex flex-col space-y-1">
                      <RouterLink v-for="subItem in item.items" :key="subItem.title" :to="subItem.url"
                        @click="closeSidebar"
                        class="block rounded-md p-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        :class="{ 'bg-accent text-accent-foreground font-medium': $route.path === subItem.url }">
                        {{ subItem.title }}
                      </RouterLink>
                    </nav>
                  </PopoverContent>
                </Popover>

                <!-- {/* Submenu tipo acordeón (para vista expandida) */} -->
                <div v-if="isNavItemOpen(item.title)" class="ml-4 mt-1 space-y-1 overflow-hidden border-l pl-4">
                  <RouterLink v-for="subItem in item.items" :key="subItem.title" :to="subItem.url" @click="closeSidebar"
                    class="block rounded-lg p-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    :class="{ 'bg-muted font-semibold text-foreground': $route.path === subItem.url }">
                    {{ subItem.title }}
                  </RouterLink>
                </div>
              </div>
            </div>
          </nav>
        </div>

        <!-- {/* ... (Sidebar Footer sin cambios) ... */} -->
        <div class="border-t border-border p-4">
          <div v-if="!sidebarCollapsed || isMobile" class="flex w-full items-center justify-between gap-3">
            <div class="flex items-center gap-3 overflow-hidden"> <img v-if="user?.avatarUrl" :src="user.avatarUrl"
                :alt="user.name" class="h-8 w-8 rounded-full shrink-0" />
              <div v-else
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                {{ getInitials(user?.name) }} </div>
              <div class="flex flex-1 flex-col text-left overflow-hidden"> <span class="truncate font-semibold">{{
                user?.name || 'Usuario' }}</span> <span class="truncate text-xs text-muted-foreground">{{ user?.email
                  }}</span> </div>
            </div> <Button variant="ghost" size="icon"
              class="h-8 w-8 shrink-0 transition-colors cursor-pointer hover:text-destructive" @click="handleLogout">
              <LogOut class="h-4 w-4" />
            </Button>
          </div>
          <div v-else class="flex flex-col items-center gap-4"> <img v-if="user?.avatarUrl" :src="user.avatarUrl"
              :alt="user.name" class="h-8 w-8 rounded-full shrink-0" />
            <div v-else
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold"> {{
                getInitials(user?.name) }} </div> <Button variant="ghost" size="icon"
              class="h-8 w-8 shrink-0 transition-colors hover:text-destructive cursor-pointer" @click="handleLogout">
              <LogOut class="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </aside>

    <!-- ... (resto del template sin cambios) ... -->
    <div :class="mainContentClasses">
      <header class="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4 bg-background"> <button
          @click="toggleSidebar" class="rounded-lg p-2 hover:bg-muted">
          <PanelLeft class="h-5 w-5" />
        </button> </header>
      <main class="flex-1 p-4 sm:p-6 overflow-auto bg-muted/40">
        <RouterView />
      </main>
    </div>
    <div v-if="sidebarOpen && isMobile" @click="closeSidebar"
      class="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"></div>
    <Toaster richColors position="top-right" />
  </div>
</template>