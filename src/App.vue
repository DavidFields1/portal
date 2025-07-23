<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Toaster } from 'vue-sonner';

</script>

<template>
  <!-- Aquí podrías añadir un Layout general (Header, Sidebar) si lo necesitas -->
  <!-- Por ahora, solo mostramos la vista de la ruta actual -->
  <Toaster richColors position="top-right" />
  <RouterView />
</template>

<style>
/* Puedes mantener o ajustar los estilos globales en src/assets/main.css */
</style>
