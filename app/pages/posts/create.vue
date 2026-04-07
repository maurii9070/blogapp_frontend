<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'editor'],
})
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <UCard
      class="border-default/80 bg-default/95 shadow-xl shadow-primary/5"
      :ui="{ body: 'space-y-6 p-6 sm:p-8' }"
    >
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Editor
        </p>
        <h1 class="text-2xl font-semibold text-highlighted">
          Crear nuevo post
        </h1>
        <p class="text-sm text-muted">
          Escribe tu contenido con un editor Markdown sencillo y elige si quieres guardarlo como borrador o publicarlo al instante.
        </p>
      </div>

      <PostEditorForm />
    </UCard>
  </div>
</template>
