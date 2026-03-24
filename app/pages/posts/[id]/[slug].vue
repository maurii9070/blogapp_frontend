<script setup lang="ts">
import type { Post } from '~/schemas/post'

const route = useRoute()
const postId = Number(route.params.id)

const { data: post, error } = await useApi<Post>(`/posts/${postId}`, {
  key: `post-detail-${postId}`,
})

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <div>
    <template v-if="error">
      <UAlert
        color="error"
        variant="soft"
        title="Error al cargar el post"
        :description="error.message"
      />
    </template>

    <template v-else-if="post">
      <article class="max-w-3xl">
        <!-- Header -->
        <header class="mb-8">
          <h1 class="text-4xl font-bold text-highlighted mb-4">
            {{ post.title }}
          </h1>

          <div class="flex flex-wrap items-center gap-4 text-sm text-muted">
            <span>{{ formatDate(post.publishedAt) }}</span>
            <span>·</span>
            <UBadge v-if="post.categoryName" color="primary" variant="soft">
              {{ post.categoryName }}
            </UBadge>
          </div>

          <!-- Tags -->
          <div v-if="post.tagNames?.length" class="flex flex-wrap gap-2 mt-4">
            <UBadge
              v-for="tag in post.tagNames"
              :key="tag"
              variant="subtle"
              color="neutral"
            >
              {{ tag }}
            </UBadge>
          </div>
        </header>

        <!-- Content -->
        <div class="prose prose-lg dark:prose-invert max-w-none">
          {{ post.content }}
        </div>
      </article>
    </template>

    <template v-else>
      <div class="flex items-center justify-center py-12">
        <UProgress color="primary" indeterminate />
      </div>
    </template>
  </div>
</template>
