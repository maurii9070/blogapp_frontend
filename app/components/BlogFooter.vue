<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-gray-200 dark:border-gray-800 py-6">
    <UContainer class="text-center text-sm text-gray-500 dark:text-gray-400">
      © {{ currentYear }} Blog App. Todos los derechos reservados.
    </UContainer>
  </footer>
</template>
