<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <UCard :ui="{ body: 'space-y-4 p-6 sm:p-8' }">
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Editor
        </p>
        <h1 class="text-2xl font-semibold text-highlighted">
          Crear nuevo post
        </h1>
        <p class="text-sm text-muted">
          Vista placeholder para confirmar acceso autenticado.
        </p>
      </div>

      <UAlert
        color="info"
        variant="soft"
        icon="i-lucide-info"
        title="Proxima feature"
        description="Aca vamos a implementar el formulario completo de creacion de posts."
      />
    </UCard>
  </div>
</template>
