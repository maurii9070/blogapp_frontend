<script setup lang="ts">
const isMobileMenuOpen = ref(false)

const desktopNavLinks = [
  { label: 'Inicio', to: '/' },
]

const mobileNavLinks = [
  { label: 'Inicio', to: '/' },
  { label: 'Iniciar Sesión', to: '/login' },
]

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-default/75 backdrop-blur border-b border-default">
    <div class="max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-(--ui-header-height)">
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="text-xl font-bold text-highlighted hover:text-primary-500 transition-colors"
          @click="closeMobileMenu"
        >
          Blog App
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex items-center gap-1">
          <UButton
            v-for="link in desktopNavLinks"
            :key="link.to"
            :to="link.to"
            variant="ghost"
            :label="link.label"
          />
          <UButton variant="ghost" label="Iniciar Sesión" to="/login" />
        </nav>

        <!-- Mobile Menu Button -->
        <UButton
          variant="ghost"
          :icon="isMobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'"
          class="lg:hidden"
          @click="toggleMobileMenu"
        />
      </div>

      <!-- Mobile Menu -->
      <div v-if="isMobileMenuOpen" class="lg:hidden py-4 border-t border-default">
        <nav class="flex flex-col gap-1">
          <UButton
            v-for="link in mobileNavLinks"
            :key="link.to"
            :to="link.to"
            variant="ghost"
            :label="link.label"
            class="justify-start"
            @click="closeMobileMenu"
          />
        </nav>
      </div>
    </div>
  </header>
</template>
