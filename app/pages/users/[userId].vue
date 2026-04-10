<script setup lang="ts">
import type { Post } from '~/schemas/post'
import type { PublicUserProfile } from '~/schemas/users'

const route = useRoute()
const config = useRuntimeConfig()
const userId = computed(() => String(route.params.userId || ''))
const currentPage = ref(1)
const pageSize = ref(10)

const { data: profile, pending, error } = await useAsyncData<PublicUserProfile | null>(
  () => `public-user-profile-${userId.value}`,
  async () => {
    if (!userId.value)
      return null

    return await $fetch<PublicUserProfile>(`/users/${userId.value}/profile`, {
      baseURL: config.public.apiBase,
    })
  },
  {
    watch: [userId],
    default: () => null,
  },
)

interface PublicUserPostsResponse {
  items: Post[]
  totalCount: number
  currentPage: number
  pageSize: number
  hasNextPage: boolean
}

const {
  data: postsResponse,
  pending: postsPending,
  error: postsError,
} = await useAsyncData<PublicUserPostsResponse>(
  () => `public-user-posts-${userId.value}-${currentPage.value}-${pageSize.value}`,
  async () => {
    return await $fetch<PublicUserPostsResponse>(`/users/${userId.value}/posts`, {
      baseURL: config.public.apiBase,
      credentials: 'include',
      query: {
        page: currentPage.value,
        pageSize: pageSize.value,
      },
    })
  },
  {
    watch: [userId, currentPage, pageSize],
    default: () => ({
      items: [],
      totalCount: 0,
      currentPage: 1,
      pageSize: 10,
      hasNextPage: false,
    }),
  },
)

const publicPosts = computed(() => postsResponse.value?.items?.filter(post => Boolean(post.publishedAt)) ?? [])
const hasPreviousPage = computed(() => currentPage.value > 1)
const hasNextPage = computed(() => Boolean(postsResponse.value?.hasNextPage))

function formatDate(dateString: string | null | undefined): string {
  if (!dateString)
    return 'Sin fecha'

  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function goToPreviousPage(): void {
  if (!hasPreviousPage.value)
    return

  currentPage.value -= 1
}

function goToNextPage(): void {
  if (!hasNextPage.value)
    return

  currentPage.value += 1
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-5">
    <header class="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
        Comunidad
      </p>
      <h1 class="text-3xl font-semibold tracking-tight text-highlighted">
        Perfil publico
      </h1>
    </header>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-circle-x"
      title="No se pudo cargar el perfil"
      :description="error.message"
    />

    <UCard
      v-else-if="pending"
      class="rounded-3xl border border-default/70 bg-default/80 shadow-sm"
      :ui="{ body: 'space-y-3 p-6' }"
    >
      <USkeleton class="h-8 w-60 rounded-xl" />
      <USkeleton class="h-6 w-40 rounded-xl" />
    </UCard>

    <UAlert
      v-else-if="!profile"
      color="warning"
      variant="soft"
      icon="i-lucide-user-x"
      title="Usuario no encontrado"
      description="No pudimos encontrar el perfil solicitado."
    />

    <UCard
      v-else
      class="rounded-3xl border border-default/70 bg-default/80 shadow-sm"
      :ui="{ body: 'space-y-5 p-6 sm:p-7' }"
    >
      <div class="space-y-1">
        <h2 class="text-2xl font-semibold tracking-tight text-highlighted">
          {{ profile.fullName }}
        </h2>
        <p class="text-sm text-muted">
          Miembro de la comunidad Blog App
        </p>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <UCard class="rounded-2xl border border-default/70 bg-elevated/30" :ui="{ body: 'space-y-1.5 p-4' }">
          <p class="text-xs uppercase tracking-[0.14em] text-muted">
            Posts publicados
          </p>
          <p class="text-2xl font-semibold tracking-tight text-highlighted">
            {{ profile.publishedPostsCount }}
          </p>
          <p class="text-sm text-muted">
            Contenido publico disponible
          </p>
        </UCard>
      </div>

      <section class="space-y-3">
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-lg font-semibold text-highlighted">
            Posts publicos
          </h3>
          <span class="text-xs text-muted">
            {{ profile.publishedPostsCount }} publicados
          </span>
        </div>

        <UAlert
          v-if="postsError"
          color="error"
          variant="soft"
          icon="i-lucide-circle-x"
          title="No se pudieron cargar los posts del usuario"
          :description="postsError.message"
        />

        <div v-else-if="postsPending" class="space-y-2">
          <USkeleton class="h-24 w-full rounded-xl" />
          <USkeleton class="h-24 w-full rounded-xl" />
        </div>

        <UAlert
          v-else-if="!publicPosts.length"
          color="neutral"
          variant="soft"
          icon="i-lucide-book-open"
          title="Este usuario aun no tiene posts publicos"
          description="Cuando publique contenido aparecera aqui."
        />

        <div v-else class="space-y-2">
          <UCard
            v-for="post in publicPosts"
            :key="post.id"
            class="rounded-2xl border border-default/70 bg-default/80"
            :ui="{ body: 'space-y-2 p-4' }"
          >
            <NuxtLink
              :to="`/posts/${post.id}/${post.slug}`"
              class="text-base font-semibold text-highlighted transition-colors hover:text-primary"
            >
              {{ post.title }}
            </NuxtLink>

            <div class="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span class="inline-flex items-center gap-1">
                <UIcon name="i-lucide-calendar" class="size-3.5" />
                {{ formatDate(post.publishedAt) }}
              </span>
              <UBadge v-if="post.categoryName" color="primary" variant="subtle" class="rounded-full">
                {{ post.categoryName }}
              </UBadge>
            </div>
          </UCard>

          <div class="flex items-center justify-between pt-1">
            <UButton
              color="neutral"
              variant="soft"
              icon="i-lucide-chevron-left"
              label="Anterior"
              :disabled="!hasPreviousPage || postsPending"
              @click="goToPreviousPage"
            />

            <span class="text-xs text-muted">
              Pagina {{ currentPage }}
            </span>

            <UButton
              color="neutral"
              variant="soft"
              icon="i-lucide-chevron-right"
              trailing
              label="Siguiente"
              :disabled="!hasNextPage || postsPending"
              @click="goToNextPage"
            />
          </div>
        </div>
      </section>
    </UCard>
  </div>
</template>
