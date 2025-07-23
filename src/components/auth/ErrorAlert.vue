<script setup lang="ts">
import { Terminal } from 'lucide-vue-next';
import Alert from '../ui/alert/Alert.vue';
import AlertTitle from '../ui/alert/AlertTitle.vue';
import AlertDescription from '../ui/alert/AlertDescription.vue';

defineProps({ message: String })
</script>
<template>
  <Alert variant="destructive" class="mb-4">
    <Terminal class="h-4 w-4" />
    <AlertTitle>Error de Autenticación</AlertTitle>
    <AlertDescription>{{ message }}</AlertDescription>
  </Alert>
</template>
