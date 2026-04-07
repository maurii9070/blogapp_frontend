<script setup lang="ts">
import type { Post } from '~/schemas/post'

const route = useRoute()
const toast = useToast()
const config = useRuntimeConfig()
const { user } = useSession()
const { start, finish } = useLoadingIndicator()
const postId = Number(route.params.id)

const { data: post, error, refresh } = await useApi<Post>(`/posts/${postId}`, {
  key: `post-detail-${postId}`,
})

const isPublishing = ref(false)

const isDraft = computed(() => !post.value?.publishedAt)

const isAuthor = computed(() => {
  const currentUserId = user.value?.id?.toLowerCase()

  if (!currentUserId || !post.value)
    return false

  const authorId = post.value.authorId?.toLowerCase()
  const authorShortId = post.value.authorShortId?.toLowerCase()

  return Boolean(
    (authorId && authorId === currentUserId)
    || (authorShortId && (authorShortId === currentUserId || currentUserId.endsWith(authorShortId))),
  )
})

const canPublish = computed(() => isDraft.value && isAuthor.value)

const publicationDateLabel = computed(() => isDraft.value ? 'Borrador guardado' : 'Publicado el')
const publicationDateValue = computed(() => isDraft.value ? post.value?.createdAt : post.value?.publishedAt)

function formatDate(dateString: string | null | undefined): string {
  if (!dateString)
    return 'Pendiente de publicacion'

  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

async function onPublish(): Promise<void> {
  if (!post.value || isPublishing.value)
    return

  isPublishing.value = true
  start()

  try {
    await $fetch(`/posts/${post.value.id}/publish`, {
      baseURL: config.public.apiBase,
      credentials: 'include',
      method: 'PATCH',
    })

    await refresh()

    if (post.value?.slug && post.value.slug !== route.params.slug)
      await navigateTo(`/posts/${post.value.id}/${post.value.slug}`, { replace: true })

    toast.add({
      title: 'Post publicado',
      description: 'Tu post ya esta visible para todos.',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
  }
  catch (publishError) {
    if (import.meta.dev)
      console.error(publishError)

    finish({ error: true })

    toast.add({
      title: 'No se pudo publicar',
      description: 'Intenta nuevamente en unos segundos.',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  }
  finally {
    isPublishing.value = false
    finish()
  }
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
        <div
          v-if="canPublish"
          class="mb-6 rounded-xl border border-warning/40 bg-warning/10 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4"
        >
          <div class="space-y-1">
            <p class="text-sm font-semibold text-highlighted">
              Este post todavia es un borrador
            </p>
            <p class="text-xs text-muted">
              Solo tu puedes verlo. Publicalo cuando termines de revisarlo.
            </p>
          </div>

          <UButton
            color="warning"
            icon="i-lucide-send"
            label="Publicar post"
            :loading="isPublishing"
            :disabled="isPublishing"
            @click="onPublish"
          />
        </div>

        <!-- Header -->
        <header class="mb-8">
          <h1 class="text-4xl font-bold text-highlighted mb-4">
            {{ post.title }}
          </h1>

          <div class="flex flex-wrap items-center gap-4 text-sm text-muted">
            <UBadge
              :color="isDraft ? 'warning' : 'success'"
              variant="soft"
            >
              {{ isDraft ? 'Borrador' : 'Publicado' }}
            </UBadge>
            <span>{{ publicationDateLabel }}</span>
            <span>{{ formatDate(publicationDateValue) }}</span>
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
