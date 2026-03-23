<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="border-b border-gray-200 dark:border-gray-800">
      <UContainer class="flex items-center justify-between h-16">
        <!-- Logo / Brand -->
        <NuxtLink to="/" class="text-xl font-bold text-gray-900 dark:text-white hover:text-primary-500 transition-colors">
          Blog App
        </NuxtLink>

        <!-- Navigation -->
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/"
            class="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors"
          >
            Inicio
          </NuxtLink>

          <UButton variant="ghost" label="Iniciar Sesión" />
        </div>
      </UContainer>
    </header>

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
