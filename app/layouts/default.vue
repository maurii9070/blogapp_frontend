<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <BlogHeader />

    <!-- Main Content -->
    <main class="flex-1">
      <UContainer class="py-8">
        <slot />
      </UContainer>
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-200 dark:border-gray-800 py-6">
      <UContainer class="text-center text-sm text-gray-500 dark:text-gray-400">
        © {{ currentYear }} Blog App. Todos los derechos reservados.
      </UContainer>
    </footer>
  </div>
</template>
