<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  PlusCircle, // Para botón Crear
  ArrowUpDown, // Para ordenar
  ArrowUp, // Para ordenar Asc
  ArrowDown, // Para ordenar Desc
  Users as UsersIcon, // Para estado vacío
} from "lucide-vue-next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox"; // Para selección (opcional futuro)
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "vue-sonner"; // Para notificaciones (ej. al crear/eliminar)

// --- Tipos y Datos Simulados ---
interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  status: "Active" | "Inactive";
  createdAt: string; // Usar string para simplificar ordenación, idealmente sería Date
  avatarUrl?: string; // Opcional
}

// Usaremos 'allUsers' como fuente original
const allUsers = ref<User[]>([
  { id: "usr_1", name: "Alice Wonderland", email: "alice@example.com", role: "Admin", status: "Active", createdAt: "2024-01-15T10:00:00Z", avatarUrl: "/placeholder-avatar.jpg" },
  { id: "usr_2", name: "Bob The Builder", email: "bob@example.com", role: "Editor", status: "Active", createdAt: "2024-02-20T11:30:00Z" },
  { id: "usr_3", name: "Charlie Chaplin", email: "charlie@example.com", role: "Viewer", status: "Inactive", createdAt: "2024-03-10T08:15:00Z" },
  { id: "usr_4", name: "Diana Prince", email: "diana@example.com", role: "Editor", status: "Active", createdAt: "2024-04-05T14:00:00Z", avatarUrl: "/placeholder-avatar.jpg" },
  { id: "usr_5", name: "Ethan Hunt", email: "ethan@example.com", role: "Viewer", status: "Active", createdAt: "2023-12-01T09:00:00Z" },
  { id: "usr_6", name: "Fiona Shrek", email: "fiona@example.com", role: "Admin", status: "Inactive", createdAt: "2024-01-25T16:45:00Z" },
  // ... añadir más usuarios para probar paginación
]);
const isLoading = ref(false); // Simular carga inicial si fuera necesario

// --- Estado para Filtros ---
const searchTerm = ref("");
const selectedRole = ref<User["role"] | "all">("all");
const selectedStatus = ref<User["status"] | "all">("all");

// --- Estado para Ordenación ---
const sortKey = ref<keyof User | null>("createdAt"); // Columna inicial de ordenación
const sortOrder = ref<"asc" | "desc">("desc"); // Orden inicial

// --- Estado para Paginación ---
const currentPage = ref(1);
const itemsPerPage = ref(5); // Usuarios por página

// --- Lógica Computada ---

// 1. Filtrar Usuarios
const filteredUsers = computed(() => {
  let users = allUsers.value;

  // Filtrar por término de búsqueda (nombre o email)
  if (searchTerm.value) {
    const lowerSearch = searchTerm.value.toLowerCase();
    users = users.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerSearch) ||
        user.email.toLowerCase().includes(lowerSearch),
    );
  }

  // Filtrar por Rol
  if (selectedRole.value !== "all") {
    users = users.filter((user) => user.role === selectedRole.value);
  }

  // Filtrar por Estado
  if (selectedStatus.value !== "all") {
    users = users.filter((user) => user.status === selectedStatus.value);
  }

  return users;
});

// 2. Ordenar Usuarios Filtrados
const sortedUsers = computed(() => {
  if (!sortKey.value) return filteredUsers.value;

  return [...filteredUsers.value].sort((a, b) => {
    const valA = a[sortKey.value!];
    const valB = b[sortKey.value!];

    if (valA !== undefined && valB !== undefined) {
      if (valA < valB) return sortOrder.value === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder.value === "asc" ? 1 : -1;
    }
    return 0;
  });
});

// 3. Paginar Usuarios Ordenados
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedUsers.value.slice(start, end);
});

// 4. Calcular Total de Páginas
const totalPages = computed(() => {
  return Math.ceil(sortedUsers.value.length / itemsPerPage.value);
});

// --- Métodos ---

// Cambiar ordenación
const setSort = (key: keyof User) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortOrder.value = "asc";
  }
  currentPage.value = 1; // Resetear a página 1 al cambiar orden
};

// Ir a página anterior
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// Ir a página siguiente
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// Placeholder para acciones
const openCreateUserModal = () => {
  console.log("Abrir modal/sheet para crear usuario...");
  toast.info("Funcionalidad 'Crear Usuario' pendiente.");
};

const editUser = (userId: string) => {
  console.log("Editar usuario:", userId);
  toast.info(`Funcionalidad 'Editar Usuario ${userId}' pendiente.`);
};

const deleteUser = (userId: string) => {
  console.log("Eliminar usuario:", userId);
  if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${userId}?`)) {
    // Simular eliminación y mostrar toast
    allUsers.value = allUsers.value.filter((user) => user.id !== userId);
    // Recalcular página si la actual queda vacía (opcional avanzado)
    if (paginatedUsers.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }
    toast.success(`Usuario ${userId} eliminado (simulado).`);
  }
};

// Helpers visuales (opcional)
const getInitials = (name: string | undefined): string => {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
};
const formatDate = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateString));
  } catch {
    return dateString; // Fallback si la fecha no es válida
  }
};

// --- Watchers para resetear página al filtrar ---
watch([searchTerm, selectedRole, selectedStatus], () => {
  currentPage.value = 1;
});

</script>

<template>
  <div class="container mx-auto py-6 md:py-10">
    <!-- Encabezado y Filtros -->
    <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <h1 class="text-2xl font-bold md:text-3xl">Usuarios</h1>
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
        <Input placeholder="Buscar por nombre o email..." class="max-w-sm" v-model="searchTerm" />
        <div class="flex gap-2">
          <Select v-model="selectedRole">
            <SelectTrigger class="w-[140px]">
              <SelectValue placeholder="Filtrar por Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Roles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Editor">Editor</SelectItem>
              <SelectItem value="Viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="selectedStatus">
            <SelectTrigger class="w-[140px]">
              <SelectValue placeholder="Filtrar por Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Estados</SelectItem>
              <SelectItem value="Active">Activo</SelectItem>
              <SelectItem value="Inactive">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button @click="openCreateUserModal">
          <PlusCircle class="mr-2 h-4 w-4" /> Crear Usuario
        </Button>
      </div>
    </div>

    <!-- Tabla de Usuarios -->
    <Card>
      <CardContent class="p-0">
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <!-- Cabeceras Ordenables -->
                <TableHead class="w-[80px]">Avatar</TableHead>
                <TableHead>
                  <Button variant="ghost" @click="setSort('name')" class="px-1">
                    Nombre
                    <template v-if="sortKey === 'name'">
                      <ArrowUp v-if="sortOrder === 'asc'" class="ml-2 h-4 w-4" />
                      <ArrowDown v-else class="ml-2 h-4 w-4" />
                    </template>
                    <ArrowUpDown v-else class="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </TableHead>
                <TableHead class="hidden md:table-cell">
                  <Button variant="ghost" @click="setSort('email')" class="px-1">
                    Email
                    <template v-if="sortKey === 'email'">
                      <ArrowUp v-if="sortOrder === 'asc'" class="ml-2 h-4 w-4" />
                      <ArrowDown v-else class="ml-2 h-4 w-4" />
                    </template>
                    <ArrowUpDown v-else class="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead class="hidden lg:table-cell">
                  <Button variant="ghost" @click="setSort('createdAt')" class="px-1">
                    Creado
                    <template v-if="sortKey === 'createdAt'">
                      <ArrowUp v-if="sortOrder === 'asc'" class="ml-2 h-4 w-4" />
                      <ArrowDown v-else class="ml-2 h-4 w-4" />
                    </template>
                    <ArrowUpDown v-else class="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </TableHead>
                <TableHead class="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="isLoading">
                <!-- Skeleton Loader -->
                <TableRow v-for="i in itemsPerPage" :key="`skel-${i}`">
                  <TableCell>
                    <Skeleton class="h-10 w-10 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton class="h-4 w-3/4" />
                  </TableCell>
                  <TableCell class="hidden md:table-cell">
                    <Skeleton class="h-4 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton class="h-6 w-16 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton class="h-6 w-16 rounded-md" />
                  </TableCell>
                  <TableCell class="hidden lg:table-cell">
                    <Skeleton class="h-4 w-24" />
                  </TableCell>
                  <TableCell class="text-right">
                    <Skeleton class="h-8 w-8" />
                  </TableCell>
                </TableRow>
              </template>
              <template v-else-if="paginatedUsers.length > 0">
                <!-- Filas de Datos -->
                <TableRow v-for="user in paginatedUsers" :key="user.id" class="hover:bg-muted/50">
                  <TableCell>
                    <Avatar>
                      <AvatarImage :src="''" :alt="user.name" />
                      <AvatarFallback>{{ getInitials(user.name) }}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell class="font-medium">{{ user.name }}</TableCell>
                  <TableCell class="hidden md:table-cell">{{ user.email }}</TableCell>
                  <TableCell>
                    <Badge :variant="user.role === 'Admin' ? 'default' : 'secondary'">
                      {{ user.role }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge :variant="user.status === 'Active' ? 'outline' : 'destructive'" class="capitalize" :class="{
                      'border-green-500 text-green-600': user.status === 'Active',
                      'border-red-500 text-red-600 bg-white': user.status === 'Inactive',
                    }">
                      {{ user.status }}
                    </Badge>
                  </TableCell>
                  <TableCell class="hidden lg:table-cell">{{ formatDate(user.createdAt) }}</TableCell>
                  <TableCell class="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button variant="ghost" class="h-8 w-8 p-0">
                          <span class="sr-only">Abrir menú</span>
                          <MoreHorizontal class="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem @click="editUser(user.id)">
                          <Pencil class="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="deleteUser(user.id)"
                          class="text-red-600 focus:bg-red-100 focus:text-red-700">
                          <Trash2 class="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              </template>
              <template v-else>
                <!-- Estado Vacío -->
                <TableRow>
                  <TableCell colspan="7" class="h-48 text-center">
                    <div class="flex flex-col items-center justify-center gap-4">
                      <UsersIcon class="h-16 w-16 text-muted-foreground/50" />
                      <p class="text-lg font-medium">No se encontraron usuarios</p>
                      <p class="text-sm text-muted-foreground">Intenta ajustar tu búsqueda o
                        filtros.</p>
                    </div>
                  </TableCell>
                </TableRow>
              </template>
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <!-- Footer con Paginación -->
      <CardFooter class="flex items-center justify-between border-t px-6 py-4">
        <div class="text-sm text-muted-foreground">
          Mostrando {{ paginatedUsers.length }} de {{ sortedUsers.length }} usuarios.
        </div>
        <div class="flex items-center space-x-2">
          <Button variant="outline" size="sm" @click="prevPage" :disabled="currentPage === 1">
            Anterior
          </Button>
          <span class="text-sm font-medium">
            Página {{ totalPages > 0 ? currentPage : 0 }} de {{ totalPages }}
          </span>
          <Button variant="outline" size="sm" @click="nextPage"
            :disabled="currentPage === totalPages || totalPages === 0">
            Siguiente
          </Button>
        </div>
      </CardFooter>
    </Card>

    <!-- Aquí iría el Dialog/Sheet para Crear/Editar Usuario -->

  </div>
</template>

<style scoped>
/* Ajustes menores si son necesarios */
.table {
  /* Asegura que la tabla ocupe el ancho */
  width: 100%;
}
</style>
