<script setup lang="ts">
import { ref } from "vue";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Copy } from "lucide-vue-next"; // Añadir Copy
import { toast } from "vue-sonner";

// --- Tipos y Datos Simulados (sin cambios) ---
interface HttpLogEntry {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  action: string;
  endpoint: string;
  module: string;
  userId: string;
  status: number;
  timestamp: string;
  requestPayload?: object | string | null;
  responsePayload?: object | string | null;
}

const httpLogs = ref<HttpLogEntry[]>([
  { id: "log_001", method: "POST", action: "Crear Usuario", endpoint: "/api/v1/users", module: "Usuarios", userId: "admin-001", status: 201, timestamp: "2024-05-14T10:30:15Z", requestPayload: { name: "Nuevo Usuario", email: "nuevo@example.com", role: "Viewer" }, responsePayload: { id: "usr_125", name: "Nuevo Usuario", email: "nuevo@example.com", role: "Viewer", createdAt: "2024-05-14T10:30:15Z" }, },
  { id: "log_002", method: "GET", action: "Obtener Facturas", endpoint: "/api/v1/invoices?status=pending", module: "Facturación", userId: "user-002", status: 200, timestamp: "2024-05-14T10:32:45Z", requestPayload: null, responsePayload: { count: 2, data: [{ id: "inv_001" }, { id: "inv_002" }] }, },
  { id: "log_003", method: "PUT", action: "Actualizar Configuración", endpoint: "/api/v1/settings/profile", module: "Configuración", userId: "admin-001", status: 401, timestamp: "2024-05-14T10:35:00Z", requestPayload: { bio: "Nueva biografía actualizada." }, responsePayload: { error: "Unauthorized", message: "Token inválido o expirado." }, },
  { id: "log_004", method: "DELETE", action: "Eliminar Factura", endpoint: "/api/v1/invoices/inv_003", module: "Facturación", userId: "user-002", status: 204, timestamp: "2024-05-14T10:38:22Z", requestPayload: null, responsePayload: null, },
]);
// --- Fin Datos Simulados ---

// --- Estado para Filas Expandidas (sin cambios) ---
const expandedRows = ref<Set<string>>(new Set());
const toggleRowExpansion = (logId: string) => { if (expandedRows.value.has(logId)) { expandedRows.value.delete(logId); } else { expandedRows.value.add(logId); } };
const isRowExpanded = (logId: string) => { return expandedRows.value.has(logId); };
// --- Fin Estado Expansión ---

// --- Helpers (sin cambios) ---
const formatDate = (dateString: string) => { try { return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateString)); } catch { return dateString; } };
const getStatusVariant = (status: number): "default" | "destructive" | "outline" | "secondary" => { if (status >= 200 && status < 300) return "outline"; if (status >= 400 && status < 500) return "destructive"; if (status >= 500) return "destructive"; if (status >= 300 && status < 400) return "secondary"; return "default"; };
const getMethodVariant = (method: HttpLogEntry["method"]): "default" | "secondary" | "outline" | "destructive" => { switch (method) { case 'GET': return 'default'; case 'POST': return 'secondary'; case 'PUT': case 'PATCH': return 'outline'; case 'DELETE': return 'destructive'; default: return 'default'; } }
// --- Fin Helpers ---

// --- Función para Copiar al Portapapeles ---
const copyToClipboard = async (payload: object | string | null | undefined, type: 'Request' | 'Response') => {
  if (!payload) {
    toast.info(`No hay ${type.toLowerCase()} payload para copiar.`);
    return;
  }
  try {
    const textToCopy = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
    await navigator.clipboard.writeText(textToCopy);
    toast.success(`${type} payload copiado al portapapeles.`);
  } catch (err) {
    console.error("Error al copiar al portapapeles:", err);
    toast.error(`No se pudo copiar el ${type.toLowerCase()} payload.`);
  }
};

</script>
<template>
  <div class="container mx-auto py-6 md:py-10">
    <h1 class="mb-6 text-2xl font-bold md:text-3xl">Log de Peticiones HTTP</h1>

    <Card>
      <CardContent class="p-0">
        <div class="overflow-x-auto">
          <Table class="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead class="w-[50px] px-2 sm:px-4"><span class="sr-only">Expandir</span></TableHead>
                <TableHead class="w-[100px] px-2 sm:px-4">ID</TableHead>
                <TableHead class="px-2 sm:px-4">Método</TableHead>
                <TableHead class="px-2 sm:px-4">Acción</TableHead>
                <TableHead class="px-2 sm:px-4">Endpoint</TableHead>
                <TableHead class="px-2 sm:px-4">Módulo</TableHead>
                <TableHead class="px-2 sm:px-4">ID Usuario</TableHead>
                <TableHead class="px-2 sm:px-4">Estatus</TableHead>
                <TableHead class="text-right px-2 sm:px-4">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="httpLogs.length > 0">
                <template v-for="log in httpLogs" :key="log.id">
                  <!-- {/* Fila Principal */} -->
                  <TableRow class="hover:bg-muted/50">
                    <TableCell class="w-[50px] px-2 sm:px-4">
                      <Button variant="ghost" size="icon" @click="toggleRowExpansion(log.id)" class="h-7 w-7">
                        <ChevronDown v-if="!isRowExpanded(log.id)" class="h-4 w-4" />
                        <ChevronUp v-else class="h-4 w-4" />
                        <span class="sr-only">Expandir/Colapsar</span>
                      </Button>
                    </TableCell>
                    <TableCell class="font-medium px-2 sm:px-4">{{ log.id }}</TableCell>
                    <TableCell class="px-2 sm:px-4">
                      <Badge :variant="getMethodVariant(log.method)">{{ log.method }}</Badge>
                    </TableCell>
                    <TableCell class="px-2 sm:px-4">{{ log.action }}</TableCell>
                    <TableCell class="max-w-xs truncate px-2 sm:px-4">{{ log.endpoint }}</TableCell>
                    <TableCell class="px-2 sm:px-4">{{ log.module }}</TableCell>
                    <TableCell class="px-2 sm:px-4">{{ log.userId }}</TableCell>
                    <TableCell class="px-2 sm:px-4">
                      <Badge :variant="getStatusVariant(log.status)"
                        :class="{ 'border-green-500 text-green-600': log.status >= 200 && log.status < 300, 'border-red-500 text-red-600 bg-white': log.status >= 400, }">
                        {{ log.status }} </Badge>
                    </TableCell>
                    <TableCell class="text-right px-2 sm:px-4">{{ formatDate(log.timestamp) }}</TableCell>
                  </TableRow>

                  <!-- {/* Fila Expandible (Condicional) */} -->
                  <TableRow v-if="isRowExpanded(log.id)" class="bg-muted/10">
                    <TableCell class="p-0"></TableCell>
                    <TableCell :colspan="8" class="p-0">
                      <div class="p-4 space-y-4">
                        <!-- {/* Request Payload con Botón de Copia */} -->
                        <div class="relative">
                          <div class="flex justify-between items-center mb-1">
                            <h4 class="text-sm font-semibold">Request Payload:</h4>
                            <Button v-if="log.requestPayload" variant="ghost" size="icon"
                              @click="copyToClipboard(log.requestPayload, 'Request')" class="h-6 w-6 p-0.5"
                              aria-label="Copiar Request Payload">
                              <Copy class="h-3 w-3" />
                            </Button>
                          </div>
                          <pre v-if="log.requestPayload"
                            class="text-xs bg-background border rounded-md p-2 overflow-x-auto max-h-60">{{ JSON.stringify(log.requestPayload, null, 2) }}</pre>
                          <p v-else class="text-xs text-muted-foreground">No request payload.</p>
                        </div>
                        <!-- {/* Response Payload con Botón de Copia */} -->
                        <div class="relative">
                          <div class="flex justify-between items-center mb-1">
                            <h4 class="text-sm font-semibold">Response Payload:</h4>
                            <Button v-if="log.responsePayload" variant="ghost" size="icon"
                              @click="copyToClipboard(log.responsePayload, 'Response')" class="h-6 w-6 p-0.5"
                              aria-label="Copiar Response Payload">
                              <Copy class="h-3 w-3" />
                            </Button>
                          </div>
                          <pre v-if="log.responsePayload"
                            class="text-xs bg-background border rounded-md p-2 overflow-x-auto max-h-60">{{ JSON.stringify(log.responsePayload, null, 2) }}</pre>
                          <p v-else class="text-xs text-muted-foreground">No response payload.</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </template>
              </template>
              <template v-else>
                <TableRow>
                  <TableCell :colspan="9" class="h-24 text-center">
                    No hay logs de peticiones para mostrar.
                  </TableCell>
                </TableRow>
              </template>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
