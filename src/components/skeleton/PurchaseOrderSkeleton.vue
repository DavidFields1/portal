<script setup lang="ts">
import Skeleton from '../ui/skeleton/Skeleton.vue';

</script>

<template>
  <div v-for="i in 3" :key="i" class="w-full h-[120px] p-3 flex-col items-start gap-2 justify-start ">
    <div class="flex w-full justify-center mb-3">
      <Skeleton class="h-4 w-2/5" />
    </div>
    <div class="flex w-full justify-between mb-2">
      <Skeleton class="h-4 w-1/4" />
      <Skeleton class="h-4 w-1/3" />
    </div>
    <Skeleton class="h-4 w-1/5 mb-2" />
    <div class="flex w-full justify-between mt-auto">
      <Skeleton class="h-4 w-1/4" />
      <Skeleton class="h-4 w-1/5" />
    </div>
  </div>
</template>
