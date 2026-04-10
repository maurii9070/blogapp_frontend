<script setup lang="ts">
import type { InferInput } from 'valibot'
import { RegisterRequestSchema } from '~/schemas/auth'

definePageMeta({
  layout: 'auth',
})

const toast = useToast()
const { register } = useAuth()

const { start, finish } = useLoadingIndicator()

const state = reactive<InferInput<typeof RegisterRequestSchema>>({
  fullName: '',
  email: '',
  password: '',
  passwordConfirmation: '',
})

const isSubmitting = ref(false)

async function onSubmit(): Promise<void> {
  if (isSubmitting.value)
    return

  start()
  isSubmitting.value = true

  try {
    await register(state)

    toast.add({
      title: 'Cuenta creada',
      description: 'Tu registro fue exitoso.',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })

    await navigateTo('/')
  }
  catch (error) {
    finish({ error: true })
    if (import.meta.dev)
      console.error(error)

    toast.add({
      title: 'No se pudo crear la cuenta',
      description: 'Revisa tus datos e intenta nuevamente.',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  }
  finally {
    isSubmitting.value = false
    finish()
  }
}
</script>

<template>
  <div class="mx-auto max-w-md">
    <UCard
      class="border-default/80 bg-default/95 shadow-xl shadow-primary/5"
      :ui="{ body: 'space-y-6 p-6 sm:p-7' }"
    >
      <div class="space-y-2 text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Blog App
        </p>
        <h1 class="text-2xl font-semibold text-highlighted">
          Crear cuenta
        </h1>
        <p class="text-sm text-muted">
          Completa tus datos para empezar a publicar.
        </p>
      </div>

      <UForm
        :schema="RegisterRequestSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField name="fullName" label="Nombre completo" required>
          <UInput
            v-model="state.fullName"
            placeholder="Juan Perez"
            icon="i-lucide-user-round"
            class="w-full"
            autocomplete="name"
          />
        </UFormField>

        <UFormField name="email" label="Email" required>
          <UInput
            v-model="state.email"
            type="email"
            placeholder="tu@email.com"
            icon="i-lucide-mail"
            class="w-full"
            autocomplete="email"
          />
        </UFormField>

        <UFormField name="password" label="Contraseña" required>
          <UInput
            v-model="state.password"
            type="password"
            placeholder="********"
            icon="i-lucide-lock"
            class="w-full"
            autocomplete="new-password"
          />
        </UFormField>

        <UFormField name="passwordConfirmation" label="Confirmar contraseña" required>
          <UInput
            v-model="state.passwordConfirmation"
            type="password"
            placeholder="********"
            icon="i-lucide-shield-check"
            class="w-full"
            autocomplete="new-password"
          />
        </UFormField>

        <UButton
          type="submit"
          color="primary"
          block
          :loading="isSubmitting"
          :disabled="isSubmitting"
          label="Crear cuenta"
        />

        <p class="text-center text-sm text-muted">
          Ya tienes cuenta?
          <NuxtLink to="/login" class="font-medium text-primary hover:underline">
            Inicia sesion aqui
          </NuxtLink>
        </p>
      </UForm>
    </UCard>
  </div>
</template>
