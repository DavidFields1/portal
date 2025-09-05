<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import {
	ArrowLeft,
	ChevronsUpDown,
	Calendar as CalendarIcon,
	Trash2,
	PlusCircle,
	Building,
	CircleDollarSign,
	Fingerprint,
	Pencil,
	FileText,
} from 'lucide-vue-next';
import { type DateValue, getLocalTimeZone } from '@internationalized/date';
import { toast } from 'vue-sonner';

// --- IMPORTS DE LA APLICACIÓN ---
import { useInvoiceMonitorStore } from '@/stores/invoiceMonitorStore';
import { formatCurrency } from '@/lib/utils';

// --- COMPONENTES UI ---
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import InvoiceDetailSkeleton from '@/components/skeleton/InvoiceDetailSkeleton.vue';
import type { Prorrateo } from '@/schemas/prorrateoSchemas';
import type { Concept } from '@/schemas/conceptSchemas';

// --- INTERFACES LOCALES (para el formulario de prorrateo) ---
// interface Prorateo {
// 	id: string;
// 	cuentaContable: string;
// 	centroCosto: string;
// 	indicadorImpuesto: string;
// 	importe: number;
// 	porcentaje: number;
// }
// interface Concepto {
// 	id: string;
// 	descripcion: string;
// 	cantidad: number;
// 	unidad: string;
// 	valorUnitario: number;
// 	importe: number;
// 	estatus: 'Pendiente' | 'Completado';
// 	prorrateos: Prorateo[];
// }

// --- ESTADO DE LA VISTA ---
const route = useRoute();
const router = useRouter();

const invoiceMonitorStore = useInvoiceMonitorStore();
// Extraemos los getters y acciones del store. `selectedInvoice` es ahora el objeto combinado.
const { selectedInvoice, isConceptsLoading, isConceptsError, conceptsError } =
	storeToRefs(invoiceMonitorStore);
const { selectInvoiceForDetail, clearSelectedInvoice } = invoiceMonitorStore;

// --- ESTADO DEL FORMULARIO ---
const descripcion = ref('');
const fechaContabilizacion = ref<DateValue>();
const expandedConceptId = ref<number | null>(null);
const showProrateoFormForConceptId = ref<number | null>(null);
const prorationType = ref<'importe' | 'porcentaje'>('importe');
const editingProrateoId = ref<string | null>(null);

// --- ESTADO DEL FORMULARIO DE PRORRATEO ---
const newProrateoCuenta = ref('');
const newProrateoCentroCosto = ref('');
const newProrateoImpuesto = ref('');
const newProrateoImporte = ref<number | null>(null);
const newProrateoPorcentaje = ref<number | null>(null);

// --- DATOS PARA SELECTS (DUMMY) ---
const cuentasContables = ref([
	{ value: '401.01', label: '401.01 - Gastos de Venta' },
	{ value: '402.01', label: '402.01 - Gastos de Administración' },
	{ value: '121.01', label: '121.01 - Activo Fijo' },
]);
const centrosCosto = ref(['Ventas', 'Marketing', 'IT', 'Administración']);
const indicadoresImpuesto = ref(['IVA 16%', 'IVA 0%', 'Exento']);


// --- MÉTODOS Y CICLO DE VIDA ---
onMounted(() => {
	const uuid = route.params.uuid as string;
	if (uuid) {
		// Esta acción establece el UUID y dispara la carga de conceptos
		selectInvoiceForDetail(uuid);
	} else {
		toast.error('No se encontró el identificador de la factura.');
		router.replace('/invoices-monitor');
	}
});

// Limpiamos el estado cuando el componente se destruye para no mostrar datos viejos
onUnmounted(() => {
	clearSelectedInvoice();
});

watch(
	selectedInvoice,
	(newInvoice) => {
		if (newInvoice) {
			descripcion.value = `Factura ${newInvoice.folio || newInvoice.uuid}`;
		}
	},
	{ immediate: true },
);

const goBackToList = () => {
	router.push('/invoices-monitor');
};

const toggleConceptExpansion = (conceptId: number) => {
	expandedConceptId.value =
		expandedConceptId.value === conceptId ? null : conceptId;
	showProrateoFormForConceptId.value = null;
	editingProrateoId.value = null;
};

const cancelProrateoForm = () => {
	showProrateoFormForConceptId.value = null;
	editingProrateoId.value = null;
};

const showAddProrateoForm = (conceptId: number) => {
	editingProrateoId.value = null;
	newProrateoCuenta.value = '';
	newProrateoCentroCosto.value = '';
	newProrateoImpuesto.value = '';
	newProrateoImporte.value = null;
	newProrateoPorcentaje.value = null;
	showProrateoFormForConceptId.value = conceptId;
};

const editProrateo = (conceptId: number, prorateo: Prorrateo) => {
	editingProrateoId.value = prorateo.id_prorrateo.toString();
	newProrateoCuenta.value = prorateo.cuenta_contable;
	newProrateoCentroCosto.value = prorateo.centro_costo;
	newProrateoImpuesto.value = prorateo.indicador_impuesto;
	if (prorationType.value === 'importe') {
		newProrateoImporte.value = prorateo.valor_importe;
		newProrateoPorcentaje.value = null;
	} else {
		newProrateoPorcentaje.value = prorateo.valor_porcentaje;
		newProrateoImporte.value = null;
	}
	showProrateoFormForConceptId.value = conceptId;
};

const saveProrateo = (conceptId: number) => {
	const concept = selectedInvoice.value?.conceptos.find(
		(c) => c.id === conceptId,
	);
	if (!concept) return;

	// Aquí iría la lógica de validación y guardado real
	// Por ahora, simulamos la adición/edición
	toast.success('Prorrateo guardado (Simulado).');
	cancelProrateoForm();
};

const deleteProrateo = (conceptId: number, prorateoId: number) => {
	const concept = selectedInvoice.value?.conceptos.find(
		(c) => c.id === conceptId,
	);
	if (!concept) return;
	console.log(prorateoId);
	// concept.prorrateos = concept.prorrateos.filter((p) => p.id_prorrateo !== prorateoId);
	concept.estatus = 'Pendiente';
	toast.info('Prorrateo eliminado.');
};

const contabilizar = () => {
	toast.success('¡Factura contabilizada exitosamente! (Simulado)');
};

const df = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' });

watch(prorationType, (newType) => {
	if (newType === 'importe') {
		newProrateoPorcentaje.value = null;
	} else {
		newProrateoImporte.value = null;
	}
});
</script>

<template>
	<div class="container mx-auto py-6 md:py-10">
		<!-- Estado de carga: se muestra mientras se cargan los conceptos o si la factura base aún no está disponible -->
		<InvoiceDetailSkeleton v-if="isConceptsLoading || !selectedInvoice" />

		<!-- 2. Muestra el mensaje de ERROR si falla la carga de conceptos -->
		<div v-else-if="isConceptsError" class="py-10 text-center">
			<p class="text-red-500">
				Error al cargar los conceptos: {{ conceptsError?.message }}
			</p>
			<Button variant="outline" @click="goBackToList" class="mt-4">
				<ArrowLeft class="mr-2 h-4 w-4" /> Volver al monitor
			</Button>
		</div>

		<!-- 3. Muestra el contenido REAL cuando todo está cargado -->
		<div v-else class="space-y-6">
			<Button
				variant="outline"
				@click="goBackToList"
				class="flex items-center gap-2"
			>
				<ArrowLeft class="h-4 w-4" /> Volver a la lista de facturas
			</Button>

			<!-- Sección de Información -->
			<Card>
				<CardHeader>
					<CardTitle class="text-2xl">
						Factura:
						<span class="text-primary">{{ selectedInvoice.folio }}</span>
					</CardTitle>
					<CardDescription class="text-lg">
						Proveedor: {{ selectedInvoice.razonsocial_emisor }}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div
						class="grid grid-cols-1 gap-x-6 gap-y-4 text-sm md:grid-cols-2 lg:grid-cols-3"
					>
						<div class="space-y-2">
							<div class="flex items-start gap-3">
								<Fingerprint class="mt-1 h-5 w-5 text-muted-foreground" />
								<div>
									<Label>UUID</Label>
									<p class="font-mono text-xs leading-tight">
										{{ selectedInvoice.uuid }}
									</p>
								</div>
							</div>
							<div class="flex items-center gap-3">
								<Building class="h-5 w-5 text-muted-foreground" />
								<div>
									<Label>Sociedad</Label>
									<p class="font-semibold">{{ selectedInvoice.sociedad }}</p>
								</div>
							</div>
						</div>
						<div class="space-y-2">
							<div class="flex items-center gap-3">
								<FileText class="h-5 w-5 text-muted-foreground" />
								<div>
									<Label>RFC Emisor</Label>
									<p class="font-semibold">{{ selectedInvoice.rfc_emisor }}</p>
								</div>
							</div>
							<div class="flex items-center gap-3">
								<FileText class="h-5 w-5 text-muted-foreground" />
								<div>
									<Label>RFC Receptor</Label>
									<p class="font-semibold">
										{{ selectedInvoice.rfc_receptor }}
									</p>
								</div>
							</div>
						</div>
						<div class="space-y-2">
							<div class="flex justify-between">
								<span class="text-muted-foreground">Subtotal:</span>
								<span class="font-mono">{{
									formatCurrency(
										selectedInvoice.subtotal,
										selectedInvoice.moneda,
									)
								}}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground">Impuestos:</span>
								<span class="font-mono">{{
									formatCurrency(
										selectedInvoice.total_impuestos_trasladados,
										selectedInvoice.moneda,
									)
								}}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground">Retenciones:</span>
								<span class="font-mono text-red-500"
									>-{{
										formatCurrency(
											selectedInvoice.total_impuestos_retenidos,
											selectedInvoice.moneda,
										)
									}}</span
								>
							</div>
						</div>
					</div>
					<Separator class="my-4" />
					<div class="flex flex-col items-end">
						<Label>TOTAL</Label>
						<p class="flex items-center gap-2 text-4xl font-bold">
							<CircleDollarSign class="h-8 w-8 text-primary" />
							{{ formatCurrency(selectedInvoice.total, selectedInvoice.moneda) }}
						</p>
					</div>
				</CardContent>
			</Card>

			<!-- Sección de Descripción y Fecha -->
			<Card>
				<CardHeader>
					<CardTitle>Datos de Contabilización</CardTitle>
				</CardHeader>
				<CardContent class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="descripcion">Descripción</Label>
						<Input id="descripcion" v-model="descripcion" />
					</div>
					<div class="space-y-2">
						<Label>Fecha</Label>
						<Popover>
							<PopoverTrigger as-child>
								<Button
									variant="outline"
									class="w-full justify-start text-left font-normal"
									:class="!fechaContabilizacion && 'text-muted-foreground'"
								>
									<CalendarIcon class="mr-2 h-4 w-4" />
									<span>{{
										fechaContabilizacion
											? df.format(
													fechaContabilizacion.toDate(getLocalTimeZone()),
												)
											: 'Seleccionar fecha'
									}}</span>
								</Button>
							</PopoverTrigger>
							<PopoverContent class="w-auto p-0">
								<Calendar v-model="fechaContabilizacion" />
							</PopoverContent>
						</Popover>
					</div>
				</CardContent>
			</Card>

			<!-- Sección de Prorrateos -->
			<Card>
				<CardHeader>
					<div class="flex items-center justify-between">
						<CardTitle>Prorrateo de Conceptos</CardTitle>
						<div class="flex items-center space-x-2">
							<Label for="proration-type">Importe</Label>
							<Switch
								id="proration-type"
								:checked="prorationType === 'porcentaje'"
								@update:checked="
									(val: boolean) =>
										(prorationType = val ? 'porcentaje' : 'importe')
								"
							/>
							<Label for="proration-type">Porcentaje</Label>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div
						v-if="!selectedInvoice.conceptos?.length"
						class="py-4 text-center text-muted-foreground"
					>
						No hay conceptos detallados en esta factura para prorratear.
					</div>
					<Table v-else>
						<TableHeader>
							<TableRow>
								<TableHead class="w-10"></TableHead>
								<TableHead>Descripción</TableHead>
								<TableHead class="text-center">Cantidad</TableHead>
								<TableHead class="text-center">Unidad</TableHead>
								<TableHead>Importe</TableHead>
								<TableHead>Estatus</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<template
								v-for="concept in (selectedInvoice.conceptos as Concept[])"
								:key="concept.id_concepto"
							>
								<TableRow
									@click="toggleConceptExpansion(concept.id_concepto)"
									class="cursor-pointer"
								>
									<TableCell
										><Button variant="ghost" size="icon" class="h-8 w-8">
											<ChevronsUpDown class="h-4 w-4" /> </Button
									></TableCell>
									<TableCell class="font-medium">{{
										concept.descripcion
									}}</TableCell>
									<TableCell class="text-center">{{
										concept.cantidad
									}}</TableCell>
									<TableCell class="text-center">{{
										concept.unidad
									}}</TableCell>
									<TableCell>{{
										formatCurrency(concept.importe, selectedInvoice.moneda)
									}}</TableCell>
									<TableCell>
										<Badge
											:variant="
												concept.estatus === 'Completado'
													? 'success'
													: 'destructive'
											"
											>{{ concept.estatus }}
										</Badge>
									</TableCell>
								</TableRow>
								<TableRow v-if="expandedConceptId === concept.id_concepto">
									<TableCell colspan="6" class="bg-muted/50 p-4">
										<div class="space-y-4">
											<div
												v-if="concept.prorrateos.length > 0"
												class="space-y-2"
											>
												<div
													v-for="p in concept.prorrateos"
													:key="p.id"
													class="flex items-center justify-between rounded-md border p-2"
												>
													<div class="text-xs">
														<p>
															<strong>Cta:</strong>
															{{ p.cuentaContable }} |
															<strong>CC:</strong>
															{{ p.centroCosto }} |
															<strong>Imp:</strong>
															{{ p.indicadorImpuesto }}
														</p>
														<p class="font-bold">
															{{
																formatCurrency(
																	p.importe,
																	selectedInvoice.moneda,
																)
															}}
															({{ p.porcentaje.toFixed(2) }}%)
														</p>
													</div>
													<div class="flex gap-2">
														<Button
															variant="outline"
															size="icon"
															class="h-7 w-7"
															@click="editProrateo(concept.id_concepto, p)"
														>
															<Pencil class="h-4 w-4" />
														</Button>
														<Button
															variant="destructive"
															size="icon"
															class="h-7 w-7"
															@click="deleteProrateo(concept.id_concepto, p.id)"
														>
															<Trash2 class="h-4 w-4" />
														</Button>
													</div>
												</div>
											</div>
											<p
												v-else
												class="text-center text-sm text-muted-foreground"
											>
												No hay prorrateos para este concepto.
											</p>
											<div
												v-if="showProrateoFormForConceptId === concept.id_concepto"
												class="space-y-4 border-t p-4"
											>
												<h4 class="font-semibold">
													{{ editingProrateoId ? 'Editar' : 'Nuevo' }}
													Prorrateo
												</h4>
												<div
													class="grid grid-cols-1 gap-4 md:grid-cols-3"
												>
													<div class="space-y-1">
														<Label>Cuenta Contable</Label>
														<Select v-model="newProrateoCuenta">
															<SelectTrigger>
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																<SelectItem
																	v-for="cta in cuentasContables"
																	:key="cta.value"
																	:value="cta.value"
																	>{{ cta.label }}
																</SelectItem>
															</SelectContent>
														</Select>
													</div>
													<div class="space-y-1">
														<Label>Centro de Costo</Label>
														<Select v-model="newProrateoCentroCosto">
															<SelectTrigger>
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																<SelectItem
																	v-for="cc in centrosCosto"
																	:key="cc"
																	:value="cc"
																	>{{ cc }}</SelectItem
																>
															</SelectContent>
														</Select>
													</div>
													<div class="space-y-1">
														<Label>Indicador Impuesto</Label>
														<Select v-model="newProrateoImpuesto">
															<SelectTrigger>
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																<SelectItem
																	v-for="imp in indicadoresImpuesto"
																	:key="imp"
																	:value="imp"
																	>{{ imp }}</SelectItem
																>
															</SelectContent>
														</Select>
													</div>
												</div>
												<div class="grid grid-cols-2 gap-4">
													<div class="space-y-1">
														<Label>Importe</Label>
														<Input
															type="number"
															v-model="newProrateoImporte!"
															:disabled="prorationType !== 'importe'"
														/>
													</div>
													<div class="space-y-1">
														<Label>Porcentaje</Label>
														<Input
															type="number"
															v-model="newProrateoPorcentaje!"
															:disabled="prorationType !== 'porcentaje'"
														/>
													</div>
												</div>
												<div class="flex justify-end gap-2">
													<Button variant="ghost" @click="cancelProrateoForm"
														>Cancelar</Button
													>
													<Button @click="saveProrateo(concept.id_concepto)"
														>Guardar Prorrateo</Button
													>
												</div>
											</div>
											<Button
												v-if="
													showProrateoFormForConceptId !== concept.id_concepto &&
													concept.estatus !== 'Completado'
												"
												variant="outline"
												size="sm"
												class="w-full"
												@click="showAddProrateoForm(concept.id_concepto)"
											>
												<PlusCircle class="mr-2 h-4 w-4" /> Agregar
												Prorrateo
											</Button>
										</div>
									</TableCell>
								</TableRow>
							</template>
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<div class="flex justify-end">
				<Button size="lg" @click="contabilizar"
					>Contabilizar Prorrateos</Button
				>
			</div>
		</div>
	</div>
</template>