<script setup lang="ts">
const isMobileMenuOpen = ref(false)
const toast = useToast()

const { status, user, isAuthenticated } = useSession()
const { logout } = useAuth()

const desktopNavLinks = [
  { label: 'Inicio', to: '/' },
]

const authenticatedNavLinks = [
  { label: 'Mi perfil', to: '/profile', icon: 'i-lucide-user-round' },
  { label: 'Crear post', to: '/posts/create', icon: 'i-lucide-square-pen' },
]

const userMenuItems = computed(() => ([
  [
    {
      label: user.value?.userName || user.value?.email || 'Mi cuenta',
      icon: 'i-lucide-circle-user-round',
      disabled: true,
    },
  ],
  authenticatedNavLinks.map(link => ({
    label: link.label,
    icon: link.icon,
    onSelect: () => navigateTo(link.to),
  })),
  [
    {
      label: 'Cerrar sesion',
      icon: 'i-lucide-log-out',
      color: 'error' as const,
      onSelect: async () => await handleLogout(),
    },
  ],
]))

const mobileNavLinks = computed(() => {
  const base = [{ label: 'Inicio', to: '/' }]

  if (!isAuthenticated.value)
    return [...base, { label: 'Iniciar sesion', to: '/login' }]

  return [...base, ...authenticatedNavLinks.map(({ label, to }) => ({ label, to }))]
})

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

async function handleLogout() {
  try {
    await logout()

    toast.add({
      title: 'Sesion cerrada',
      description: 'Hasta pronto.',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })

    closeMobileMenu()
    await navigateTo('/')
  }
  catch (error) {
    if (import.meta.dev)
      console.error(error)

    toast.add({
      title: 'No se pudo cerrar sesion',
      description: 'Intenta nuevamente en unos segundos.',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  }
}
</script>

<template>
  <ClientOnly>
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

            <UButton
              v-if="status === 'unknown' || status === 'loading'"
              variant="soft"
              color="neutral"
              label="Cargando..."
              :disabled="true"
            />

            <UButton v-else-if="!isAuthenticated" variant="ghost" label="Iniciar sesion" to="/login" />

            <UDropdownMenu
              v-else
              :items="userMenuItems"
              :content="{ align: 'end', sideOffset: 8 }"
            >
              <UButton
                variant="soft"
                color="neutral"
                :label="user?.fullName || user?.email || 'Mi cuenta'"
                trailing-icon="i-lucide-chevron-down"
              />
            </UDropdownMenu>
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

            <UButton
              v-if="isAuthenticated"
              color="error"
              variant="ghost"
              label="Cerrar sesion"
              icon="i-lucide-log-out"
              class="justify-start"
              @click="handleLogout"
            />
          </nav>
        </div>
      </div>
    </header>

    <template #fallback>
      <header class="sticky top-0 z-50 bg-default/75 backdrop-blur border-b border-default">
        <div class="max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8">
          <div class="h-(--ui-header-height)" />
        </div>
      </header>
    </template>
  </ClientOnly>
</template>
