<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
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
	LoaderCircle,
} from 'lucide-vue-next';
import { type DateValue, getLocalTimeZone } from '@internationalized/date';
import { toast } from 'vue-sonner';

// --- IMPORTS DE LA APLICACIÓN ---
import { useInvoiceMonitorStore } from '@/stores/invoiceMonitorStore';
import { formatCurrency } from '@/lib/utils';
import { useProrrateosQuery } from '@/composables/useProrrateos'; 

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
import {
	useCentrosCostoSAPQuery,
	useCuentasGastoSAPQuery,
	useIndicadoresIvaSAPQuery,
} from '@/composables/useCatalogoSAP';

// --- ESTADO DE LA VISTA ---
const route = useRoute();
const router = useRouter();
const invoiceMonitorStore = useInvoiceMonitorStore();
const { selectedInvoice, isConceptsLoading, isConceptsError, conceptsError } =
	storeToRefs(invoiceMonitorStore);
const { selectInvoiceForDetail, clearSelectedInvoice } = invoiceMonitorStore;

// --- GESTIÓN DE CATÁLOGOS DE SAP (PARA EL FORMULARIO) ---
const areCatalogsEnabled = ref(false);
const sociedadFactura = computed(() => selectedInvoice.value?.sociedad ?? '');

const { data: cuentasGasto, isLoading: isCuentasGastoLoading } =
	useCuentasGastoSAPQuery(
		{
			enabled: computed(() => areCatalogsEnabled.value && !!sociedadFactura.value),
		},
		sociedadFactura,
	);
const { data: centrosCosto, isLoading: isCentrosCostoLoading } =
	useCentrosCostoSAPQuery(
		{
			enabled: computed(() => areCatalogsEnabled.value && !!sociedadFactura.value),
		},
		sociedadFactura,
	);
const { data: indicadoresIva, isLoading: isIndicadoresIvaLoading } =
	useIndicadoresIvaSAPQuery({ enabled: areCatalogsEnabled });

const areCatalogsLoading = computed(
	() =>
		isCuentasGastoLoading.value ||
		isCentrosCostoLoading.value ||
		isIndicadoresIvaLoading.value,
);
const areCatalogsInError = computed(
	() =>
		!cuentasGasto.value?.object ||
		!centrosCosto.value?.object ||
		!indicadoresIva.value?.object,
);

// --- GESTIÓN DE PRORRATEOS (CARGA BAJO DEMANDA) ---
const invoiceUuid = computed(() => selectedInvoice.value?.uuid ?? null);
const areProrateosEnabled = ref(false);

const {
	data: prorateosResponse,
	isLoading: isProrateosLoading,
	isError: isProrateosError,
} = useProrrateosQuery(invoiceUuid, {
	enabled: areProrateosEnabled,
});

watch(prorateosResponse, (newResponse) => {
	if (newResponse?.object && selectedInvoice.value?.conceptos) {
		const allProrateos = newResponse.object;
		selectedInvoice.value.conceptos.forEach((concept) => {
			concept.prorrateos = allProrateos.filter(
				(p) => p.id_concepto === concept.id_concepto,
			);
		});
	}
});

// --- ESTADO DEL FORMULARIO ---
const descripcion = ref('');
const fechaContabilizacion = ref<DateValue>();
const expandedConceptId = ref<number | null>(null);
const showProrateoFormForConceptId = ref<number | null>(null);
const prorationType = ref<'importe' | 'porcentaje'>('importe');
const editingProrateoId = ref<number | null>(null);

// --- ESTADO DEL FORMULARIO DE PRORRATEO ---
const newProrateoCuenta = ref('');
const newProrateoCentroCosto = ref('');
const newProrateoImpuesto = ref('');
const newProrateoImporte = ref<number | null>(null);
const newProrateoPorcentaje = ref<number | null>(null);

// --- LÓGICA DE SINCRONIZACIÓN DE IMPORTE/PORCENTAJE ---
const isSyncing = ref(false);

const currentProrateoConcept = computed(() => {
	if (!showProrateoFormForConceptId.value || !selectedInvoice.value) {
		return null;
	}
	return selectedInvoice.value.conceptos.find(
		(c) => c.id_concepto === showProrateoFormForConceptId.value,
	);
});

watch(newProrateoImporte, (newVal) => {
	if (isSyncing.value || !currentProrateoConcept.value) return;
	if (currentProrateoConcept.value.importe === 0) return;

	isSyncing.value = true;
	if (newVal === null || newVal === undefined || newVal === 0) {
		newProrateoPorcentaje.value = null;
	} else {
		const percentage = (newVal / currentProrateoConcept.value.importe) * 100;
		newProrateoPorcentaje.value = parseFloat(percentage.toFixed(2));
	}
	isSyncing.value = false;
});

watch(newProrateoPorcentaje, (newVal) => {
	if (isSyncing.value || !currentProrateoConcept.value) return;

	isSyncing.value = true;
	if (newVal === null || newVal === undefined || newVal === 0) {
		newProrateoImporte.value = null;
	} else {
		const amount = (newVal / 100) * currentProrateoConcept.value.importe;
		newProrateoImporte.value = parseFloat(amount.toFixed(2));
	}
	isSyncing.value = false;
});

// --- MÉTODOS Y CICLO DE VIDA ---
onMounted(() => {
	const uuid = route.params.uuid as string;
	if (uuid) {
		selectInvoiceForDetail(uuid);
	} else {
		toast.error('No se encontró el identificador de la factura.');
		router.replace('/invoices-monitor');
	}
});

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

const df = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' });

// CORREGIDO: Todas las funciones se declaran con la palabra clave `function`
function prepareProrrateoForm() {
	if (areCatalogsEnabled.value) return;
	if (!sociedadFactura.value) {
		toast.error('No hay datos de sociedad para cargar los catálogos.');
		return;
	}
	areCatalogsEnabled.value = true;
}

function goBackToList() {
	router.push('/invoices-monitor');
}

function toggleConceptExpansion(conceptId: number) {
	const isOpening = expandedConceptId.value !== conceptId;
	expandedConceptId.value = isOpening ? conceptId : null;
	if (isOpening && !areProrateosEnabled.value) {
		areProrateosEnabled.value = true;
	}
	if (!isOpening) {
		cancelProrateoForm();
	}
}

function cancelProrateoForm() {
	showProrateoFormForConceptId.value = null;
	editingProrateoId.value = null;
}

function resetProrateoFormFields() {
	newProrateoCuenta.value = '';
	newProrateoCentroCosto.value = '';
	newProrateoImpuesto.value = '';
	newProrateoImporte.value = null;
	newProrateoPorcentaje.value = null;
}

function showAddProrateoForm(conceptId: number) {
	prepareProrrateoForm();
	editingProrateoId.value = null;
	resetProrateoFormFields();
	showProrateoFormForConceptId.value = conceptId;
}

function editProrateo(conceptId: number, prorateo: Prorrateo) {
	prepareProrrateoForm();
	editingProrateoId.value = prorateo.id_prorrateo;
	newProrateoCuenta.value = prorateo.cuenta_contable;
	newProrateoCentroCosto.value = prorateo.centro_costo;
	newProrateoImpuesto.value = prorateo.indicador_impuesto;
	newProrateoImporte.value = prorateo.valor_importe;
	newProrateoPorcentaje.value = prorateo.valor_porcentaje;
	showProrateoFormForConceptId.value = conceptId;
}

function saveProrateo(conceptId: number) {
	const concept = selectedInvoice.value?.conceptos.find(
		(c) => c.id_concepto === conceptId,
	);
	if (!concept) return;
	if (
		!newProrateoCuenta.value ||
		!newProrateoCentroCosto.value ||
		!newProrateoImpuesto.value
	) {
		toast.error('Todos los campos son obligatorios.');
		return;
	}
	if (editingProrateoId.value !== null) {
		const prorateoToUpdate = concept.prorrateos.find(
			(p) => p.id_prorrateo === editingProrateoId.value,
		);
		if (prorateoToUpdate) {
			prorateoToUpdate.cuenta_contable = newProrateoCuenta.value;
			prorateoToUpdate.centro_costo = newProrateoCentroCosto.value;
			prorateoToUpdate.indicador_impuesto = newProrateoImpuesto.value;
			prorateoToUpdate.valor_importe = newProrateoImporte.value ?? 0;
			prorateoToUpdate.valor_porcentaje = newProrateoPorcentaje.value ?? 0;
			toast.success('Prorrateo actualizado.');
		}
	} else {
		const newProrateo: Prorrateo = {
			id_prorrateo: Date.now(),
			id_concepto: conceptId,
			cuenta_contable: newProrateoCuenta.value,
			centro_costo: newProrateoCentroCosto.value,
			indicador_impuesto: newProrateoImpuesto.value,
			valor_importe: newProrateoImporte.value ?? 0,
			valor_porcentaje: newProrateoPorcentaje.value ?? 0,
			fecha_creacion: new Date().toISOString(),
			fecha_modificacion: new Date().toISOString(),
			estatus: 'Activo',
		};
		concept.prorrateos.push(newProrateo);
		toast.success('Prorrateo agregado.');
	}
	cancelProrateoForm();
}

function deleteProrateo(conceptId: number, prorateoId: number) {
	const concept = selectedInvoice.value?.conceptos.find(
		(c) => c.id_concepto === conceptId,
	);
	if (!concept) return;
	const index = concept.prorrateos.findIndex(
		(p) => p.id_prorrateo === prorateoId,
	);
	if (index !== -1) {
		concept.prorrateos.splice(index, 1);
		toast.info('Prorrateo eliminado.');
	}
}

function contabilizar() {
	toast.success('¡Factura contabilizada exitosamente! (Simulado)');
}
</script>

<template>
	<div class="container mx-auto py-6 md:py-10">
		<InvoiceDetailSkeleton v-if="isConceptsLoading || !selectedInvoice" />
		<div v-else-if="isConceptsError" class="py-10 text-center">
			<p class="text-red-500">
				Error al cargar los conceptos: {{ conceptsError?.message }}
			</p>
			<Button variant="outline" @click="goBackToList" class="mt-4">
				<ArrowLeft class="mr-2 h-4 w-4" /> Volver al monitor
			</Button>
		</div>
		<div v-else class="space-y-6">
			<!-- ... (sección de volver, card de información, card de contabilización sin cambios) ... -->
			<Button
				variant="outline"
				@click="goBackToList"
				class="flex items-center gap-2"
			>
				<ArrowLeft class="h-4 w-4" /> Volver a la lista de facturas
			</Button>

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
					<Table>
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
									<TableCell>
										<Button variant="ghost" size="icon" class="h-8 w-8">
											<ChevronsUpDown class="h-4 w-4" />
										</Button>
									</TableCell>
									<TableCell class="font-medium">
										{{ concept.descripcion }}
									</TableCell>
									<TableCell class="text-center">
										{{ concept.cantidad }}
									</TableCell>
									<TableCell class="text-center">
										{{ concept.unidad }}
									</TableCell>
									<TableCell>
										{{ formatCurrency(concept.importe, selectedInvoice.moneda) }}
									</TableCell>
									<TableCell>
										<Badge
											:variant="
												concept.estatus === 'Completado'
													? 'success'
													: 'destructive'
											"
										>
											{{ concept.estatus }}
										</Badge>
									</TableCell>
								</TableRow>
								<TableRow v-if="expandedConceptId === concept.id_concepto">
									<TableCell colspan="6" class="bg-muted/50 p-4">
										<div
											v-if="isProrateosLoading"
											class="flex items-center justify-center py-4"
										>
											<LoaderCircle class="h-6 w-6 animate-spin text-primary" />
											<span class="ml-2">Cargando prorrateos...</span>
										</div>
										<div
											v-else-if="isProrateosError"
											class="text-center text-red-500"
										>
											Error al cargar los prorrateos.
										</div>
										<div v-else class="space-y-4">
											<div
												v-if="concept.prorrateos && concept.prorrateos.length > 0"
												class="space-y-2"
											>
												<div
													v-for="p in concept.prorrateos"
													:key="p.id_prorrateo"
													class="flex items-center justify-between rounded-md border p-2"
												>
													<div class="text-xs">
														<p>
															<strong>Cta:</strong>
															{{ p.cuenta_contable }} |
															<strong>CC:</strong>
															{{ p.centro_costo }} |
															<strong>Imp:</strong>
															{{ p.indicador_impuesto }}
														</p>
														<p class="font-bold">
															{{
																formatCurrency(
																	p.valor_importe,
																	selectedInvoice.moneda,
																)
															}}
															({{
																p.valor_porcentaje.toFixed(2)
															}}%)
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
															@click="
																deleteProrateo(
																	concept.id_concepto,
																	p.id_prorrateo,
																)
															"
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

											<!-- FORMULARIO CORREGIDO CON LAS NUEVAS INTERFACES -->
											<div
												v-if="
													showProrateoFormForConceptId === concept.id_concepto
												"
												class="space-y-4 rounded-md border-t p-4"
											>
												<h4 class="font-semibold">
													{{ editingProrateoId ? 'Editar' : 'Nuevo' }}
													Prorrateo
												</h4>
												<div
													v-if="areCatalogsLoading"
													class="flex items-center justify-center py-4"
												>
													<LoaderCircle
														class="h-6 w-6 animate-spin text-primary"
													/>
													<span class="ml-2">Cargando catálogos...</span>
												</div>
												<div
													v-else-if="areCatalogsInError"
													class="text-center text-red-500"
												>
													Error al cargar los catálogos. Intenta de nuevo.
												</div>
												<div
													v-else
													class="grid grid-cols-1 gap-4 md:grid-cols-3"
												>
													<div class="space-y-1">
														<Label>Cuenta Contable</Label>
														<Select v-model="newProrateoCuenta">
															<SelectTrigger>
																<SelectValue
																	placeholder="Seleccionar cuenta"
																/>
															</SelectTrigger>
															<SelectContent>
																<!-- CORREGIDO: Se itera sobre `cuentasGasto.object` -->
																<SelectItem
																	v-for="cta in cuentasGasto?.object"
																	:key="cta.NumCuentaMayor"
																	:value="cta.NumCuentaMayor"
																>
																	{{ cta.NumCuentaMayor }} -
																	{{ cta.Denominacion }}
																</SelectItem>
															</SelectContent>
														</Select>
													</div>
													<div class="space-y-1">
														<Label>Centro de Costo</Label>
														<Select v-model="newProrateoCentroCosto">
															<SelectTrigger>
																<SelectValue
																	placeholder="Seleccionar centro de costo"
																/>
															</SelectTrigger>
															<SelectContent>
																<!-- CORREGIDO: Se itera sobre `centrosCosto.object` -->
																<SelectItem
																	v-for="cc in centrosCosto?.object"
																	:key="cc.CentroCosto"
																	:value="cc.CentroCosto"
																>
																	{{ cc.CentroCosto }} -
																	{{ cc.Descripcion }}
																</SelectItem>
															</SelectContent>
														</Select>
													</div>
													<div class="space-y-1">
														<Label>Indicador Impuesto</Label>
														<Select v-model="newProrateoImpuesto">
															<SelectTrigger>
																<SelectValue
																	placeholder="Seleccionar indicador"
																/>
															</SelectTrigger>
															<SelectContent>
																<!-- CORREGIDO: Se itera sobre `indicadoresIva.object` -->
																<SelectItem
																	v-for="imp in indicadoresIva?.object"
																	:key="imp.IndImpuesto"
																	:value="imp.IndImpuesto"
																>
																	{{ imp.IndImpuesto }} -
																	{{ imp.Denominacion }}
																</SelectItem>
															</SelectContent>
														</Select>
													</div>
												</div>
												<div class="grid grid-cols-2 gap-4">
													<div class="space-y-1">
														<Label>Importe</Label>
														<Input
															type="number"
															v-model="newProrateoImporte"
															:disabled="prorationType !== 'importe'"
														/>
													</div>
													<div class="space-y-1">
														<Label>Porcentaje (%)</Label>
														<Input
															type="number"
															v-model="newProrateoPorcentaje"
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