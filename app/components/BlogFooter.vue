<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-default/70 bg-default/80 py-8 backdrop-blur">
    <UContainer class="text-center text-sm text-muted">
      <p class="font-medium text-toned">
        © {{ currentYear }} Blog App
      </p>
      <p class="mt-1 text-xs">
        Escribe, comparte y lee con una experiencia limpia.
      </p>
    </UContainer>
  </footer>
</template>
