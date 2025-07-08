<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  PlusCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users as UsersIcon,
  Filter, // NUEVO: Icono para el botón de filtros
} from "lucide-vue-next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // NUEVO: Para el formulario del dialog
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "vue-sonner";
// NUEVO: Imports para el Dialog
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// --- Tipos y Datos Simulados ---
interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  status: "Active" | "Inactive";
  createdAt: string;
  avatarUrl?: string;
}

const allUsers = ref<User[]>([
  { id: "usr_1", name: "Alice Wonderland", email: "alice@example.com", role: "Admin", status: "Active", createdAt: "2024-01-15T10:00:00Z", avatarUrl: "/placeholder-avatar.jpg" },
  { id: "usr_2", name: "Bob The Builder", email: "bob@example.com", role: "Editor", status: "Active", createdAt: "2024-02-20T11:30:00Z" },
  { id: "usr_3", name: "Charlie Chaplin", email: "charlie@example.com", role: "Viewer", status: "Inactive", createdAt: "2024-03-10T08:15:00Z" },
  { id: "usr_4", name: "Diana Prince", email: "diana@example.com", role: "Editor", status: "Active", createdAt: "2024-04-05T14:00:00Z", avatarUrl: "/placeholder-avatar.jpg" },
  { id: "usr_5", name: "Ethan Hunt", email: "ethan@example.com", role: "Viewer", status: "Active", createdAt: "2023-12-01T09:00:00Z" },
  { id: "usr_6", name: "Fiona Shrek", email: "fiona@example.com", role: "Admin", status: "Inactive", createdAt: "2024-01-25T16:45:00Z" },
]);
const isLoading = ref(false);

// --- Estado para Filtros y UI ---
const showFilters = ref(false); // NUEVO
const searchTerm = ref("");
const selectedRole = ref<User["role"] | "all">("all");
const selectedStatus = ref<User["status"] | "all">("all");

// --- Estado para Ordenación ---
const sortKey = ref<keyof User | null>("createdAt");
const sortOrder = ref<"asc" | "desc">("desc");

// --- Estado para Paginación ---
const currentPage = ref(1);
const itemsPerPage = ref(5);

// --- Estado para el Dialog de Crear Usuario ---
const isCreateUserDialogOpen = ref(false);
const newUserName = ref("");
const newUserEmail = ref("");
const newUserRole = ref<User["role"]>("Viewer"); // Valor por defecto

// --- Lógica Computada ---

// 1. Contar filtros activos
const activeFilterCount = computed(() => {
  let count = 0;
  if (searchTerm.value) count++;
  if (selectedRole.value !== "all") count++;
  if (selectedStatus.value !== "all") count++;
  return count;
});

// 2. Filtrar Usuarios
const filteredUsers = computed(() => {
  let users = allUsers.value;
  if (searchTerm.value) {
    const lowerSearch = searchTerm.value.toLowerCase();
    users = users.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerSearch) ||
        user.email.toLowerCase().includes(lowerSearch),
    );
  }
  if (selectedRole.value !== "all") {
    users = users.filter((user) => user.role === selectedRole.value);
  }
  if (selectedStatus.value !== "all") {
    users = users.filter((user) => user.status === selectedStatus.value);
  }
  return users;
});

// 3. Ordenar Usuarios Filtrados
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

// 4. Paginar Usuarios Ordenados
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedUsers.value.slice(start, end);
});

// 5. Calcular Total de Páginas
const totalPages = computed(() => {
  return Math.ceil(sortedUsers.value.length / itemsPerPage.value);
});

// --- Métodos ---

// Limpiar filtros
const clearFilters = () => {
  searchTerm.value = "";
  selectedRole.value = "all";
  selectedStatus.value = "all";
};

// Cambiar ordenación
const setSort = (key: keyof User) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortOrder.value = "asc";
  }
  currentPage.value = 1;
};

// Paginación
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };

// Acciones de CRUD
const handleCreateUser = () => {
  if (!newUserName.value || !newUserEmail.value) {
    toast.error("El nombre y el email son obligatorios.");
    return;
  }
  const newUser: User = {
    id: `usr_${Date.now()}`,
    name: newUserName.value,
    email: newUserEmail.value,
    role: newUserRole.value,
    status: "Active",
    createdAt: new Date().toISOString(),
  };
  allUsers.value.unshift(newUser); // Añadir al principio de la lista
  toast.success(`Usuario "${newUser.name}" creado.`);
  isCreateUserDialogOpen.value = false; // Cerrar dialog
  // Resetear formulario
  newUserName.value = "";
  newUserEmail.value = "";
  newUserRole.value = "Viewer";
};

const editUser = (userId: string) => {
  toast.info(`Funcionalidad 'Editar Usuario ${userId}' pendiente.`);
};

const deleteUser = (userId: string) => {
  if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${userId}?`)) {
    allUsers.value = allUsers.value.filter((user) => user.id !== userId);
    if (paginatedUsers.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }
    toast.success(`Usuario ${userId} eliminado (simulado).`);
  }
};

// Helpers
const getInitials = (name: string | undefined): string => {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
};
const formatDate = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

// Watchers
watch([searchTerm, selectedRole, selectedStatus], () => {
  currentPage.value = 1;
});

const getFiltersButtonVariant = () => {
  if (showFilters.value) return 'default'
  else if (!showFilters.value && activeFilterCount.value == 0) return 'outline'
}
</script>

<template>
  <div class="container mx-auto py-6 md:py-10">
    <!-- Encabezado y Acciones Principales -->
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold md:text-3xl">Usuarios</h1>
      <div class="flex items-center gap-2">
        <Button :variant="getFiltersButtonVariant()" @click="showFilters = !showFilters" :class="activeFilterCount > 0
          ? 'bg-primary text-white hover:bg-violet-400 hover:text-white'
          : ''
          ">
          <Filter class="mr-2 h-4 w-4" />
          Filtros
          <Badge v-if="activeFilterCount > 0" variant="secondary" class="ml-2">{{ activeFilterCount }}</Badge>
        </Button>
        <Dialog v-model:open="isCreateUserDialogOpen">
          <DialogTrigger as-child>
            <Button>
              <PlusCircle class="mr-2 h-4 w-4" /> Crear Usuario
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Completa los detalles para añadir un nuevo usuario al sistema.
              </DialogDescription>
            </DialogHeader>
            <div class="grid gap-4 py-4">
              <div class="grid grid-cols-4 items-center gap-4">
                <Label for="name" class="text-right"> Nombre </Label>
                <Input id="name" v-model="newUserName" class="col-span-3" />
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <Label for="email" class="text-right"> Email </Label>
                <Input id="email" type="email" v-model="newUserEmail" class="col-span-3" />
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <Label for="role" class="text-right"> Rol </Label>
                <Select v-model="newUserRole">
                  <SelectTrigger class="col-span-3">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Editor">Editor</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" @click="handleCreateUser">
                Guardar Usuario
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    <!-- Contenido Principal: Tabla y Filtros -->
    <div class="flex gap-6">
      <!-- Columna de la Tabla -->
      <div class="flex-1">
        <Card>
          <CardContent class="p-0">
            <div class="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
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
                    <TableRow v-for="user in paginatedUsers" :key="user.id">
                      <TableCell>
                        <Avatar>
                          <!-- @vue-expect-error -->
                          <AvatarImage :src="user.avatarUrl" :alt="user.name" />
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
                        <Badge class="capitalize" :class="{
                          'border-green-500 text-green-600 bg-transparent font-bold': user.status === 'Active',
                          'border-red-500 text-red-600 bg-transparent font-bold': user.status === 'Inactive',
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
                    <TableRow>
                      <TableCell colspan="7" class="h-48 text-center">
                        <div class="flex flex-col items-center justify-center gap-4">
                          <UsersIcon class="h-16 w-16 text-muted-foreground/50" />
                          <p class="text-lg font-medium">No se encontraron usuarios</p>
                          <p class="text-sm text-muted-foreground">Intenta ajustar tu búsqueda o filtros.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  </template>
                </TableBody>
              </Table>
            </div>
          </CardContent>
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
      </div>

      <!-- Columna de Filtros (Sidebar) -->
      <Transition name="slide-fade">
        <div v-if="showFilters" class="w-64 flex-shrink-0">
          <Card class="sticky top-6">
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent class="flex flex-col gap-6">
              <div class="flex flex-col gap-2">
                <Label for="search-filter">Búsqueda</Label>
                <Input id="search-filter" placeholder="Nombre o email..." v-model="searchTerm" />
              </div>
              <div class="flex flex-col gap-2">
                <Label for="role-filter">Rol</Label>
                <Select v-model="selectedRole">
                  <SelectTrigger id="role-filter">
                    <SelectValue placeholder="Filtrar por Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Roles</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Editor">Editor</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="flex flex-col gap-2">
                <Label for="status-filter">Estado</Label>
                <Select v-model="selectedStatus">
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Filtrar por Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Estados</SelectItem>
                    <SelectItem value="Active">Activo</SelectItem>
                    <SelectItem value="Inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" class="w-full cursor-pointer" @click="clearFilters"
                :disabled="activeFilterCount === 0">
                Limpiar filtros
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
