<script setup lang="ts">
const { data: recentPosts } = useRecentPosts()

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <UCard class="sticky top-24">
    <template #header>
      <h3 class="text-lg font-semibold text-highlighted">
        Posts Recientes
      </h3>
    </template>

    <div v-if="recentPosts?.items?.length" class="flex flex-col gap-3">
      <NuxtLink
        v-for="post in recentPosts.items.slice(0, 10)"
        :key="post.id"
        :to="`/posts/${post.id}/${post.slug}`"
        class="group block py-2 border-b border-muted last:border-0 hover:text-primary-500 transition-colors"
      >
        <p class="font-medium text-sm group-hover:text-primary-500 line-clamp-2">
          {{ post.title }}
        </p>
        <p class="text-xs text-muted mt-1">
          {{ formatDate(post.publishedAt) }} · {{ post.authorName }}
        </p>
      </NuxtLink>
    </div>

    <template #footer>
      <NuxtLink
        to="/posts"
        class="flex items-center justify-center gap-1 text-sm text-primary-500 hover:text-primary-600 transition-colors"
      >
        Ver todos los posts
        <UIcon name="i-lucide-arrow-right" class="size-4" />
      </NuxtLink>
    </template>
  </UCard>
</template>
