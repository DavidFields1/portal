<script setup lang="ts">
// ... (script setup sin cambios) ...
import { ref } from 'vue';
import { RouterView, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Toaster } from '@/components/ui/sonner';
import {
  LogOut,
  Menu,
  LayoutDashboard,
  Users,
  Settings,
  UserCircle,
  Upload,
  X,
  ChevronsLeft,
  ChevronsRight,
  ListChecks,
} from "lucide-vue-next";

const authStore = useAuthStore();
const isMobileMenuOpen = ref(false);
const isCollapsed = ref(false);

const handleLogout = () => {
  closeMobileMenu();
  authStore.logout();
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const toggleSidebarCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const getInitials = (name: string | undefined): string => {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
};
</script>

<template>
  <div class="w-full">


    <aside :class="[
      'fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r bg-background p-4 transition-all duration-300 ease-in-out',
      isCollapsed ? 'md:w-20' : 'md:w-64',
      isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    ]">

      <div class="mb-4 flex items-center justify-between">
        <div :class="['flex items-center overflow-hidden', isCollapsed ? 'md:w-full md:justify-center' : 'md:gap-2']">
          <LayoutDashboard class="h-6 w-6 flex-shrink-0 text-primary" /> <span
            :class="['text-lg font-semibold whitespace-nowrap transition-opacity duration-200', isCollapsed ? 'md:opacity-0 md:hidden' : 'md:opacity-100']">
            Portal Admin </span>
        </div> <Button variant="ghost" size="icon" class="md:hidden" @click="closeMobileMenu">
          <X class="h-5 w-5" /> <span class="sr-only">Cerrar menú</span>
        </Button>
      </div>
      <Separator class="mb-4" />
      <div :class="['mb-4 flex items-center gap-3 overflow-hidden', isCollapsed ? 'justify-center' : '']">
        <Avatar class="h-10 w-10 flex-shrink-0 border">
          <AvatarImage :src="'/placeholder-avatar.jpg'" alt="Avatar" />
          <AvatarFallback>
            <UserCircle v-if="!authStore.user?.name" class="h-5 w-5" /> <span v-else>{{
              getInitials(authStore.user?.name) }}</span>
          </AvatarFallback>
        </Avatar>
        <div
          :class="['flex flex-col transition-opacity duration-200', isCollapsed ? 'md:opacity-0 md:hidden' : 'md:opacity-100']">
          <p class="text-sm font-medium leading-none whitespace-nowrap"> {{ authStore.user?.name || "Usuario" }} </p>
          <p class="text-xs leading-none text-muted-foreground whitespace-nowrap"> {{ authStore.user?.email }} </p>
        </div>
      </div>
      <Separator class="mb-4" />
      <nav class="flex flex-col gap-1 text-sm font-medium">
        <RouterLink to="/" @click="closeMobileMenu"
          :class="['flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary [&.router-link-exact-active]:bg-muted [&.router-link-exact-active]:text-primary', isCollapsed && 'md:justify-center md:px-0']">
          <LayoutDashboard class="h-4 w-4 flex-shrink-0" /> <span
            :class="['whitespace-nowrap transition-opacity duration-200', isCollapsed ? 'md:opacity-0 md:hidden' : 'md:opacity-100']">Dashboard</span>
        </RouterLink>
        <RouterLink to="/users" @click="closeMobileMenu"
          :class="['flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary [&.router-link-exact-active]:bg-muted [&.router-link-exact-active]:text-primary', isCollapsed && 'md:justify-center md:px-0']">
          <Users class="h-4 w-4 flex-shrink-0" /> <span
            :class="['whitespace-nowrap transition-opacity duration-200', isCollapsed ? 'md:opacity-0 md:hidden' : 'md:opacity-100']">Usuarios</span>
        </RouterLink>
        <RouterLink to="/invoice-upload" @click="closeMobileMenu"
          :class="['flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary [&.router-link-exact-active]:bg-muted [&.router-link-exact-active]:text-primary', isCollapsed && 'md:justify-center md:px-0']">
          <Upload class="h-4 w-4 flex-shrink-0" /> <span
            :class="['whitespace-nowrap transition-opacity duration-200', isCollapsed ? 'md:opacity-0 md:hidden' : 'md:opacity-100']">Carga
            de Facturas</span>
        </RouterLink>
        <!-- <nav class="flex flex-col gap-1 text-sm font-medium"> -->

        <RouterLink to="/http-logs" @click="closeMobileMenu"
          :class="['flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary [&.router-link-exact-active]:bg-muted [&.router-link-exact-active]:text-primary', isCollapsed && 'md:justify-center md:px-0']">
          <ListChecks class="h-4 w-4 flex-shrink-0" />
          <span
            :class="['whitespace-nowrap transition-opacity duration-200', isCollapsed ? 'md:opacity-0 md:hidden' : 'md:opacity-100']">
            Log de Peticiones
          </span>
        </RouterLink>
        <!-- </nav> -->
        <RouterLink to="/settings" @click="closeMobileMenu"
          :class="['flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary [&.router-link-exact-active]:bg-muted [&.router-link-exact-active]:text-primary', isCollapsed && 'md:justify-center md:px-0']">
          <Settings class="h-4 w-4 flex-shrink-0" /> <span
            :class="['whitespace-nowrap transition-opacity duration-200', isCollapsed ? 'md:opacity-0 md:hidden' : 'md:opacity-100']">Configuración</span>
        </RouterLink>
      </nav>
      <div class="mt-auto">
        <Separator class="my-4" /> <Button variant="outline" class="w-full" @click="handleLogout">
          <LogOut :class="['h-4 w-4 flex-shrink-0', !isCollapsed && 'md:mr-2']" /> <span
            :class="['whitespace-nowrap transition-opacity duration-200', isCollapsed ? 'md:opacity-0 md:hidden' : 'md:opacity-100']">
            Cerrar Sesión </span>
        </Button>
      </div>
    </aside>


    <Button variant="outline" size="icon" :class="[
      'fixed top-4 z-50 hidden md:flex items-center justify-center rounded-full bg-background shadow-md transition-all duration-300 ease-in-out',
      isCollapsed ? 'left-20 -ml-4' : 'left-64 -ml-4'
    ]" @click="toggleSidebarCollapse" aria-label="Colapsar/Expandir barra lateral">
      <ChevronsLeft v-if="!isCollapsed" class="h-4 w-4" />
      <ChevronsRight v-else class="h-4 w-4" />
    </Button>


    <Button v-if="!isMobileMenuOpen" variant="outline" size="icon"
      class="fixed top-4 left-4 z-50 flex items-center justify-center rounded-md bg-background shadow-md md:hidden"
      @click="isMobileMenuOpen = !isMobileMenuOpen" aria-label="Abrir menú de navegación">
      <Menu class="h-5 w-5" />
    </Button>


    <div v-if="isMobileMenuOpen" @click="closeMobileMenu" class="fixed inset-0 z-30 bg-black/60 md:hidden"
      aria-hidden="true"></div>


    <div :class="['transition-all duration-300 ease-in-out', isCollapsed ? 'md:ml-16' : 'md:ml-64']">

      <main class="min-h-screen bg-muted/40 p-4 pt-6 sm:px-6 sm:py-6">
        <RouterView />
      </main>
    </div>


    <Toaster richColors position="top-right" />
  </div>
</template>
