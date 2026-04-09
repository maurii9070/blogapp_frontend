<script setup lang="ts">
const { data } = useRecentPosts()

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <section class="space-y-5 md:space-y-6">
    <header class="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
        Publicaciones recientes
      </p>
      <h1 class="text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl">
        Lo nuevo en la comunidad
      </h1>
    </header>

    <div class="grid gap-4 md:gap-5">
      <UCard
        v-for="post in data?.items"
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
  </section>
</template>
