<script setup lang="ts">
import type { PostsResponse } from '~/schemas/post'

const { data } = useApi<PostsResponse>('/posts', {
  key: 'posts',
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div v-for="post in data?.items" :key="post.id">
      <h2>{{ post.title }}</h2>
    </div>
  </div>
</template>
