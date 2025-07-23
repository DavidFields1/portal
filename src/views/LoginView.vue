<script setup lang="ts">
import AuthCard from '@/components/auth/AuthCard.vue';
import AuthLayout from '@/components/auth/AuthLayout.vue';
import IllustrationSide from '@/components/auth/IllustrationSide.vue';
import LoginForm from '@/components/auth/LoginForm.vue';
import LogoBrand from '@/components/auth/LogoBrand.vue';
import CardDescription from '@/components/ui/card/CardDescription.vue';
import CardTitle from '@/components/ui/card/CardTitle.vue';

</script>
<template>
  <AuthLayout>
    <template #left>
      <LogoBrand />
      <AuthCard>
        <template #title>
          <CardTitle class="text-xl text-center">
            Iniciar Sesión
          </CardTitle>
        </template>
        <template #description>
          <CardDescription class="text-center">
            Ingresa tu email y contraseña para acceder al portal.<br />
          </CardDescription>
        </template>
        <LoginForm />
      </AuthCard>
    </template>

    <template #right>
      <IllustrationSide />
    </template>
  </AuthLayout>
</template>
