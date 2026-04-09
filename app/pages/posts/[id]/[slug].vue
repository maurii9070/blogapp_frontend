<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
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
    await refreshNuxtData('recent-posts')

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
      <article class="mx-auto max-w-4xl space-y-8 md:space-y-10">
        <div
          v-if="canPublish"
          class="rounded-2xl border border-warning/40 bg-warning/10 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4"
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
        <header class="space-y-5 border-b border-default/70 pb-6 md:space-y-6 md:pb-8">
          <h1 class="text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl lg:text-5xl">
            {{ post.title }}
          </h1>

          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
            <UBadge
              :color="isDraft ? 'warning' : 'success'"
              variant="soft"
              class="rounded-full px-3 py-1"
            >
              {{ isDraft ? 'Borrador' : 'Publicado' }}
            </UBadge>
            <span class="inline-flex items-center gap-2">
              <UIcon name="i-lucide-calendar" class="size-4" />
              {{ publicationDateLabel }} {{ formatDate(publicationDateValue) }}
            </span>
            <UBadge v-if="post.categoryName" color="primary" variant="soft" class="rounded-full px-3 py-1">
              {{ post.categoryName }}
            </UBadge>
          </div>

          <!-- Tags -->
          <div v-if="post.tagNames?.length" class="flex flex-wrap gap-2">
            <UBadge
              v-for="tag in post.tagNames"
              :key="tag"
              variant="subtle"
              color="neutral"
              class="rounded-full px-3 py-1"
            >
              {{ tag }}
            </UBadge>
          </div>
        </header>

        <!-- Content -->
        <section class="px-1 py-2 sm:px-2 sm:py-3 md:px-3 md:py-4">
          <MdPreview
            editor-id="post-reader"
            class="post-markdown"
            preview-theme="github"
            code-theme="github"
            :model-value="post.content"
          />
        </section>
        <div class="h-2" />
      </article>
    </template>

    <template v-else>
      <div class="flex items-center justify-center py-12">
        <UProgress color="primary" indeterminate />
      </div>
    </template>
  </div>
</template>
