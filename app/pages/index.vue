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
  <div class="grid gap-4">
    <UCard
      v-for="post in data?.items"
      :key="post.id"
      class="relative hover:ring-2 hover:ring-primary-500 transition-all"
    >
      <NuxtLink
        :to="`/posts/${post.id}/${post.slug}`"
        class="absolute inset-0 z-10"
        :aria-label="`Leer post: ${post.title}`"
      />
      <template #header>
        <h2 class="text-xl font-semibold text-highlighted">
          {{ post.title }}
        </h2>
      </template>

      <div class="flex items-center gap-3 text-sm text-muted">
        <UIcon name="i-lucide-user" class="size-4" />
        <span>{{ post.authorName }}</span>
        <span class="text-muted-foreground">·</span>
        <UIcon name="i-lucide-calendar" class="size-4" />
        <span>{{ formatDate(post.publishedAt) }}</span>
      </div>
    </UCard>
  </div>
</template>
