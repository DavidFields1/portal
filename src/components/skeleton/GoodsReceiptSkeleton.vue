<script setup lang="ts">
import Skeleton from '../ui/skeleton/Skeleton.vue';

</script>

<template>
  <div v-for="i in 2" :key="i">
    <div class="flex-1 min-w-0">
      <div class="flex justify-between mb-2 items-center">
        <div class="flex gap-2 items-baseline">
          <Skeleton class="h-4 w-4 rounded-sm mt-1" />
          <Skeleton class="h-4 w-20" />
        </div>
        <Skeleton class="h-4 w-28" />
      </div>
      <Skeleton class="h-6 w-3/4 my-2" />
      <div class="flex my-4 justify-between">
        <div>
          <Skeleton class="h-4 w-24 mb-1" />
          <Skeleton class="h-5 w-16" />
        </div>
        <div>
          <Skeleton class="h-4 w-20 mb-1" />
          <Skeleton class="h-5 w-12" />
        </div>
        <div>
          <Skeleton class="h-4 w-24 mb-1" />
          <Skeleton class="h-5 w-16" />
        </div>
      </div>
    </div>
  </div>
</template>
