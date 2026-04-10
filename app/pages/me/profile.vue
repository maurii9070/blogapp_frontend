<script setup lang="ts">
import type { InferInput } from 'valibot'
import { useUpdateProfile } from '~/composables/useUpdateProfile'
import { UpdateMyProfileRequestSchema } from '~/schemas/users'
import { extractErrorMessage } from '~/utils/apiErrors'

definePageMeta({
  middleware: 'auth',
})

const toast = useToast()
const { start, finish } = useLoadingIndicator()
const { profile, pending, error, fetchProfile, updateProfile } = useUpdateProfile()

const state = reactive<InferInput<typeof UpdateMyProfileRequestSchema>>({
  fullName: '',
  email: '',
})

const isSubmitting = ref(false)

await fetchProfile()

watch(
  profile,
  (nextProfile) => {
    if (!nextProfile)
      return

    state.fullName = nextProfile.fullName
    state.email = nextProfile.email
  },
  { immediate: true },
)

async function onSubmit(): Promise<void> {
  if (isSubmitting.value)
    return

  isSubmitting.value = true
  start()

  try {
    const updated = await updateProfile({
      fullName: state.fullName,
      email: state.email,
    })

    state.fullName = updated.fullName
    state.email = updated.email

    toast.add({
      title: 'Perfil actualizado',
      description: 'Tus datos se guardaron correctamente.',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
  }
  catch (submitError) {
    finish({ error: true })

    if (import.meta.dev)
      console.error(submitError)

    toast.add({
      title: 'No se pudo actualizar el perfil',
      description: extractErrorMessage(submitError, 'Revisa los campos y vuelve a intentar.'),
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
  <div class="mx-auto max-w-2xl space-y-5">
    <header class="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
        Cuenta
      </p>
      <h1 class="text-3xl font-semibold tracking-tight text-highlighted">
        Editar mi perfil
      </h1>
      <p class="text-sm text-muted">
        Actualiza tu nombre y email asociados a la cuenta.
      </p>
    </header>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-circle-x"
      title="No se pudo cargar tu perfil"
      :description="error.message"
    />

    <UCard v-else class="rounded-3xl border border-default/70 bg-default/80 shadow-sm" :ui="{ body: 'space-y-5 p-5 sm:p-6' }">
      <div v-if="pending" class="space-y-3">
        <USkeleton class="h-10 w-full rounded-xl" />
        <USkeleton class="h-10 w-full rounded-xl" />
      </div>

      <UForm
        v-else
        :schema="UpdateMyProfileRequestSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField name="fullName" label="Nombre completo" required>
          <UInput
            v-model="state.fullName"
            class="w-full"
            placeholder="Tu nombre completo"
            icon="i-lucide-user-round"
          />
        </UFormField>

        <UFormField name="email" label="Email" required>
          <UInput
            v-model="state.email"
            type="email"
            class="w-full"
            placeholder="tu@email.com"
            icon="i-lucide-mail"
          />
        </UFormField>

        <div class="flex flex-wrap justify-end gap-2 pt-1">
          <UButton
            type="submit"
            color="primary"
            icon="i-lucide-save"
            label="Guardar cambios"
            class="rounded-full"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          />
        </div>
      </UForm>
    </UCard>
  </div>
</template>
