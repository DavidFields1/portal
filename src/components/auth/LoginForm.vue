<script setup lang="ts">
import { credentialsSchema, useLogin, type Credentials } from '@/composables/useAuth'
import Label from '../ui/label/Label.vue'
import Input from '../ui/input/Input.vue'
import Button from '../ui/button/Button.vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useForm } from '@/composables/useForm'

const mutation = useLogin()
const router = useRouter();

const { form, errors, validateField, handleSubmit } = useForm(
  credentialsSchema,
  {
    email: 'ruizleafar7@gmail.com',
    password: 'leafar123',
  }
)

const submitLogin = (validatedData: Credentials) => {
  mutation.mutate(validatedData, {
    onSuccess() {
      router.push('/')
      toast.success('Bienvenido')
    },
    onError(error) {
      // @ts-expect-error api error response
      const errorData = error.response?.data as { message?: string }
      toast.error(errorData?.message || error.message || 'Ocurrió un error')
    },
  })
}

const onSubmit = handleSubmit(submitLogin)
</script>

<template>
  <form @submit.prevent="onSubmit" class="grid gap-4">
    <div class="grid gap-2">
      <Label for="email">Email</label>
      <Input id="email" v-model="form.email" type="email" @blur="validateField('email')" />
      <div v-if="errors.email" class="text-red-400 text-xs font-bold">
        {{ errors.email }}
      </div>
    </div>

    <div class="grid gap-2">
      <Label for="password">Contraseña</label>
      <Input id="password" v-model="form.password" type="password" @blur="validateField('password')" />
      <div v-if="errors.password" class="text-red-400 text-xs font-bold">
        {{ errors.password }}
      </div>
    </div>

    <Button type="submit" class="w-full" :disabled="mutation.isPending.value">
      {{ mutation.isPending.value ? 'Ingresando…' : 'Ingresar' }}
    </button>
  </form>
</template>
