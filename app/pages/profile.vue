<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { user } = useSession()
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <UCard :ui="{ body: 'space-y-4 p-6 sm:p-8' }">
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Cuenta
        </p>
        <h1 class="text-2xl font-semibold text-highlighted">
          Mi perfil
        </h1>
        <p class="text-sm text-muted">
          Esta pantalla es temporal mientras terminas el backend de perfil.
        </p>
      </div>

      <UAlert
        color="neutral"
        variant="soft"
        icon="i-lucide-user-round"
        :title="user?.fullName || user?.userName || 'Usuario autenticado'"
        :description="user?.email || 'Sesion activa detectada por cookie.'"
      />
    </UCard>
  </div>
</template>
