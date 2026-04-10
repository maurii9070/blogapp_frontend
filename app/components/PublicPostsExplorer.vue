<script setup lang="ts">
import { usePostsSearch } from '~/composables/usePostsSearch'

const {
  postsResponse,
  pending,
  error,
  searchTextModel,
  selectedCategoryIdModel,
  tagsModel,
  currentPage,
  pageSizeModel,
  totalPosts,
  hasPreviousPage,
  hasNextPage,
  clearFilters,
  goToPreviousPage,
  goToNextPage,
} = usePostsSearch()

const { data: categories, pending: isLoadingCategories } = useCategories()

const categoryOptions = computed(() => {
  const options = categories.value?.map(category => ({
    label: category.name,
    value: category.id,
  })) ?? []

  return [{ label: 'Todas', value: 0 }, ...options]
})

const pageSizeOptions = [
  { label: '10 por pagina', value: 10 },
  { label: '20 por pagina', value: 20 },
  { label: '50 por pagina', value: 50 },
]

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function onClearFilters(): void {
  clearFilters()
}
</script>

<template>
  <section class="space-y-5 md:space-y-6">
    <header class="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
        Publicaciones recientes
      </p>
      <h1 class="text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl">
        Explora posts de la comunidad
      </h1>
      <p class="text-sm text-muted">
        Usa filtros por texto, categoria y tags para compartir una URL con el mismo estado.
      </p>
    </header>

    <UCard class="rounded-3xl border border-default/70 bg-default/80 shadow-sm" :ui="{ body: 'space-y-4 p-5 sm:p-6' }">
      <div class="grid grid-cols-1 gap-3 lg:grid-cols-4">
        <UFormField label="Buscar">
          <UInput
            v-model="searchTextModel"
            placeholder="Buscar por titulo o contenido"
            icon="i-lucide-search"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Categoria">
          <USelect
            v-model="selectedCategoryIdModel"
            :items="categoryOptions"
            value-key="value"
            label-key="label"
            :loading="isLoadingCategories"
            :disabled="isLoadingCategories"
            placeholder="Todas"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Tags">
          <UInputTags
            v-model="tagsModel"
            class="w-full"
            placeholder="Ej: nuxt, api"
          />
        </UFormField>

        <UFormField label="Tamano de pagina">
          <USelect
            v-model="pageSizeModel"
            :items="pageSizeOptions"
            value-key="value"
            label-key="label"
            class="w-full"
          />
        </UFormField>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-sm text-muted">
          <UIcon name="i-lucide-list-filter" class="size-4" />
          <span>{{ totalPosts }} resultados</span>
        </div>

        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-rotate-ccw"
          label="Limpiar filtros"
          class="rounded-full"
          @click="onClearFilters"
        />
      </div>
    </UCard>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-circle-x"
      title="No se pudieron cargar los posts"
      :description="error.message"
    />

    <div v-else-if="pending && !postsResponse?.items?.length" class="space-y-3">
      <USkeleton class="h-28 w-full rounded-2xl" />
      <USkeleton class="h-28 w-full rounded-2xl" />
      <USkeleton class="h-28 w-full rounded-2xl" />
    </div>

    <UAlert
      v-else-if="!postsResponse?.items?.length"
      color="neutral"
      variant="soft"
      icon="i-lucide-book-open"
      title="No hay posts para estos filtros"
      description="Prueba con otra categoria o elimina algunos tags."
    />

    <div v-else class="grid gap-4 md:gap-5">
      <UCard
        v-for="post in postsResponse.items"
        :key="post.id"
        class="group relative overflow-hidden rounded-3xl border border-default/70 bg-default/75 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg"
        :ui="{ body: 'space-y-5' }"
      >
        <NuxtLink
          :to="`/posts/${post.id}/${post.slug}`"
          class="absolute inset-0 z-10"
          :aria-label="`Leer post: ${post.title}`"
        />
        <template #header>
          <h2 class="text-xl font-semibold tracking-tight text-highlighted transition-colors group-hover:text-primary sm:text-2xl">
            {{ post.title }}
          </h2>
        </template>

        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          <span class="inline-flex items-center gap-2">
            <UIcon name="i-lucide-user" class="size-4" />
            <span>{{ post.authorName }}</span>
          </span>
          <span class="inline-flex items-center gap-2">
            <UIcon name="i-lucide-calendar" class="size-4" />
            <span>{{ formatDate(post.publishedAt) }}</span>
          </span>
          <span class="ml-auto inline-flex items-center gap-2 text-primary">
            Leer post
            <UIcon name="i-lucide-arrow-up-right" class="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </UCard>
    </div>

    <UCard class="rounded-2xl border border-default/70 bg-default/80 shadow-sm" :ui="{ body: 'flex items-center justify-between gap-3 p-4' }">
      <UButton
        color="neutral"
        variant="soft"
        icon="i-lucide-chevron-left"
        label="Anterior"
        class="rounded-full"
        :disabled="!hasPreviousPage || pending"
        @click="goToPreviousPage"
      />

      <p class="text-sm text-muted">
        Pagina {{ currentPage }}
      </p>

      <UButton
        color="neutral"
        variant="soft"
        icon="i-lucide-chevron-right"
        trailing
        label="Siguiente"
        class="rounded-full"
        :disabled="!hasNextPage || pending"
        @click="goToNextPage"
      />
    </UCard>
  </section>
</template>
