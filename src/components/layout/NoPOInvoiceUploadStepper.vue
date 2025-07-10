<!-- src/components/InvoiceUploadNoPoStepper.vue -->
<script setup lang="ts">
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-vue-next";

// Este componente solo necesita saber los pasos y cuál es el actual.
defineProps({
  steps: { type: Array as () => { id: string, name: string, icon: unknown }[], required: true },
  currentStepIndex: { type: Number, required: true },
});
</script>

<template>
  <Card class="flex flex-col h-full border-0 border-l rounded-none">
    <CardHeader>
      <CardTitle>Proceso de Carga</CardTitle>
      <nav aria-label="Progreso de carga" class="mt-4">
        <ol class="space-y-4">
          <li v-for="(step, index) in steps" :key="step.id" class="flex items-center text-sm">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full mr-3" :class="{
              'bg-primary text-primary-foreground': index === currentStepIndex,
              'bg-green-600 text-white': index < currentStepIndex,
              'bg-muted text-muted-foreground border': index > currentStepIndex,
            }">
              <component v-if="index < currentStepIndex" :is="CheckCircle" class="h-4 w-4" />
              <component v-else :is="step.icon" class="h-4 w-4" />
            </span>
            <span class="font-medium" :class="{
              'text-primary': index === currentStepIndex,
              'text-green-700': index < currentStepIndex,
              'text-muted-foreground': index > currentStepIndex,
            }">
              {{ step.name }}
            </span>
          </li>
        </ol>
      </nav>
    </CardHeader>
  </Card>
</template>
