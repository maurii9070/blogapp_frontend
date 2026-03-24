<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <BlogHeader />

    <!-- Main Content with Sidebar -->
    <main class="flex-1">
      <UContainer class="py-8">
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Main Content Area -->
          <div class="flex-1 min-w-0">
            <slot />
          </div>

          <!-- Sidebar -->
          <aside class="w-full lg:w-80 shrink-0">
            <RecentPostsSidebar />
          </aside>
        </div>
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
