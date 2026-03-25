<script setup lang="ts">
import type { InferInput } from 'valibot'
import { LoginRequestSchema } from '~/schemas/auth'

definePageMeta({
  layout: 'auth',
})

const toast = useToast()
const { login } = useAuth()
const route = useRoute()

const { start, finish } = useLoadingIndicator()

const state = reactive<InferInput<typeof LoginRequestSchema>>({
  email: '',
  password: '',
  rememberMe: false,
})

const isSubmitting = ref(false)

async function onSubmit(): Promise<void> {
  start()
  if (isSubmitting.value)
    return

  isSubmitting.value = true

  try {
    await login(state)

    toast.add({
      title: 'Sesion iniciada',
      description: 'Bienvenido de nuevo.',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })

    const redirectTo = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await navigateTo(redirectTo)
  }
  catch (error) {
    finish({ error: true })
    if (import.meta.dev)
      console.error(error)

    toast.add({
      title: 'No se pudo iniciar sesion',
      description: 'Verifica tu email y password e intenta nuevamente.',
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
          Iniciar sesion
        </h1>
        <p class="text-sm text-muted">
          Ingresa tus datos para acceder a tu cuenta.
        </p>
      </div>

      <UForm
        :schema="LoginRequestSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
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

        <UFormField name="password" label="Password" required>
          <UInput
            v-model="state.password"
            type="password"
            placeholder="********"
            icon="i-lucide-lock"
            class="w-full"
            autocomplete="current-password"
          />
        </UFormField>

        <UFormField name="rememberMe">
          <UCheckbox v-model="state.rememberMe" label="Recordarme" />
        </UFormField>

        <UButton
          type="submit"
          color="primary"
          block
          :loading="isSubmitting"
          :disabled="isSubmitting"
          label="Entrar"
        />
      </UForm>
    </UCard>
  </div>
</template>
