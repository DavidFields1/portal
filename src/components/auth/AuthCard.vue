<script setup lang="ts">
import Card from '../ui/card/Card.vue';
import CardContent from '../ui/card/CardContent.vue';
import CardHeader from '../ui/card/CardHeader.vue';

</script>

<template>
  <Card class="w-full shadow-none border-none">
    <CardHeader>
      <slot name="title" />
      <slot name="description" />
    </CardHeader>
    <CardContent>
      <slot />
    </CardContent>
  </Card>
</template>
