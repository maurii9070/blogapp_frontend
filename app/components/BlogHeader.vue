<script setup lang="ts">
const isMobileMenuOpen = ref(false)
const toast = useToast()

const { status, user, isAuthenticated } = useSession()
const { logout } = useAuth()

const desktopNavLinks = [
  { label: 'Inicio', to: '/' },
]

const guestNavLinks = [
  { label: 'Iniciar sesion', to: '/login' },
  { label: 'Registrarse', to: '/register' },
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
    return [...base, ...guestNavLinks]

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
    <header class="sticky top-0 z-50 border-b border-default/70 bg-default/70 backdrop-blur-xl supports-backdrop-filter:bg-default/50">
      <div class="mx-auto max-w-(--ui-container) px-4 sm:px-6 lg:px-8">
        <div class="flex h-(--ui-header-height) items-center justify-between gap-3">
          <!-- Logo -->
          <NuxtLink
            to="/"
            class="rounded-full px-3 py-1 text-lg font-semibold tracking-tight text-highlighted transition-colors hover:text-primary"
            @click="closeMobileMenu"
          >
            Blog App
          </NuxtLink>

          <!-- Desktop Navigation -->
          <nav class="hidden items-center gap-1 rounded-full border border-default/80 bg-elevated/70 p-1 lg:flex">
            <UButton
              v-for="link in desktopNavLinks"
              :key="link.to"
              :to="link.to"
              variant="ghost"
              :label="link.label"
              class="rounded-full"
            />

            <UButton
              v-if="status === 'unknown' || status === 'loading'"
              variant="soft"
              color="neutral"
              label="Cargando..."
              :disabled="true"
            />

            <template v-else-if="!isAuthenticated">
              <UButton
                v-for="link in guestNavLinks"
                :key="link.to"
                :to="link.to"
                variant="ghost"
                :label="link.label"
                class="rounded-full"
              />
            </template>

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
                class="rounded-full"
              />
            </UDropdownMenu>
          </nav>

          <!-- Mobile Menu Button -->
          <UButton
            variant="ghost"
            :icon="isMobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'"
            class="rounded-full lg:hidden"
            @click="toggleMobileMenu"
          />
        </div>

        <!-- Mobile Menu -->
        <div v-if="isMobileMenuOpen" class="border-t border-default/80 py-4 lg:hidden">
          <nav class="flex flex-col gap-2 rounded-2xl border border-default/70 bg-elevated/70 p-2">
            <UButton
              v-for="link in mobileNavLinks"
              :key="link.to"
              :to="link.to"
              variant="ghost"
              :label="link.label"
              class="justify-start rounded-xl"
              @click="closeMobileMenu"
            />

            <UButton
              v-if="isAuthenticated"
              color="error"
              variant="ghost"
              label="Cerrar sesion"
              icon="i-lucide-log-out"
              class="justify-start rounded-xl"
              @click="handleLogout"
            />
          </nav>
        </div>
      </div>
    </header>

    <template #fallback>
      <header class="sticky top-0 z-50 border-b border-default/70 bg-default/70 backdrop-blur-xl supports-backdrop-filter:bg-default/50">
        <div class="mx-auto max-w-(--ui-container) px-4 sm:px-6 lg:px-8">
          <div class="flex h-(--ui-header-height) items-center justify-between gap-4">
            <USkeleton class="h-6 w-28" />
            <div class="hidden lg:flex items-center gap-2">
              <USkeleton class="h-8 w-18 rounded-md" />
              <USkeleton class="h-8 w-24 rounded-md" />
            </div>
            <USkeleton class="h-8 w-8 rounded-md lg:hidden" />
          </div>
        </div>
      </header>
    </template>
  </ClientOnly>
</template>
