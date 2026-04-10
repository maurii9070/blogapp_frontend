<script setup lang="ts">
import type { InferInput } from 'valibot'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { CreateCommentRequestSchema } from '~/schemas/comments'
import type { PostComment } from '~/schemas/comments'
import { extractErrorMessage } from '~/utils/apiErrors'

const route = useRoute()
const toast = useToast()
const config = useRuntimeConfig()
const { user, isAuthenticated } = useAuthUser()
const { start, finish } = useLoadingIndicator()
const postId = Number(route.params.id)

const { data: post, error, refresh } = await usePostDetail(ref(postId))

const {
  data: comments,
  pending: isLoadingComments,
  error: commentsError,
  refresh: refreshComments,
  createComment,
  updateComment,
  deleteComment,
} = usePostComments(ref(postId))

const commentState = reactive<InferInput<typeof CreateCommentRequestSchema>>({
  content: '',
})

const isSubmittingComment = ref(false)
const editingCommentId = ref<number | null>(null)
const editingCommentContent = ref('')
const processingCommentId = ref<number | null>(null)
const confirmingDeleteCommentId = ref<number | null>(null)

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
const postAuthorProfileId = computed(() => post.value?.authorId || post.value?.authorShortId || '')

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

async function onSubmitComment(): Promise<void> {
  if (!isAuthenticated.value) {
    await navigateTo({
      path: '/login',
      query: { redirect: route.fullPath },
    })
    return
  }

  if (isSubmittingComment.value)
    return

  isSubmittingComment.value = true

  try {
    await createComment({
      content: commentState.content,
    })

    commentState.content = ''
    await refreshComments()

    toast.add({
      title: 'Comentario publicado',
      description: 'Tu comentario ya aparece en la conversacion.',
      color: 'success',
      icon: 'i-lucide-message-circle-check',
    })
  }
  catch (commentError) {
    if (import.meta.dev)
      console.error(commentError)

    toast.add({
      title: 'No se pudo publicar el comentario',
      description: extractErrorMessage(commentError, 'Revisa el contenido e intenta nuevamente.'),
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  }
  finally {
    isSubmittingComment.value = false
  }
}

function canManageComment(comment: PostComment): boolean {
  const currentUserId = user.value?.id?.toLowerCase()

  if (!currentUserId)
    return false

  return comment.userId.toLowerCase() === currentUserId || isAuthor.value
}

function startEditComment(comment: PostComment): void {
  editingCommentId.value = comment.id
  editingCommentContent.value = comment.content
  confirmingDeleteCommentId.value = null
}

function cancelEditComment(): void {
  editingCommentId.value = null
  editingCommentContent.value = ''
}

async function onSaveComment(comment: PostComment): Promise<void> {
  if (processingCommentId.value !== null)
    return

  processingCommentId.value = comment.id

  try {
    await updateComment(comment.id, {
      content: editingCommentContent.value,
    })

    await refreshComments()
    cancelEditComment()

    toast.add({
      title: 'Comentario actualizado',
      description: 'Se guardaron los cambios correctamente.',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
  }
  catch (commentError) {
    if (import.meta.dev)
      console.error(commentError)

    toast.add({
      title: 'No se pudo actualizar el comentario',
      description: extractErrorMessage(commentError, 'Revisa el contenido e intenta nuevamente.'),
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  }
  finally {
    processingCommentId.value = null
  }
}

async function onDeleteComment(comment: PostComment): Promise<void> {
  if (processingCommentId.value !== null)
    return

  if (confirmingDeleteCommentId.value !== comment.id) {
    confirmingDeleteCommentId.value = comment.id
    return
  }

  processingCommentId.value = comment.id

  try {
    await deleteComment(comment.id)
    await refreshComments()

    confirmingDeleteCommentId.value = null

    if (editingCommentId.value === comment.id)
      cancelEditComment()

    toast.add({
      title: 'Comentario eliminado',
      description: 'El comentario fue eliminado correctamente.',
      color: 'success',
      icon: 'i-lucide-trash-2',
    })
  }
  catch (commentError) {
    if (import.meta.dev)
      console.error(commentError)

    toast.add({
      title: 'No se pudo eliminar el comentario',
      description: extractErrorMessage(commentError, 'Intenta nuevamente en unos segundos.'),
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  }
  finally {
    processingCommentId.value = null
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
            <NuxtLink
              v-if="postAuthorProfileId"
              :to="`/users/${postAuthorProfileId}`"
              class="relative z-20 inline-flex items-center gap-2 rounded-full px-2 py-1 transition-colors hover:bg-elevated hover:text-primary"
            >
              <UIcon name="i-lucide-user-round" class="size-4" />
              {{ post.authorFullName || 'Autor no disponible' }}
            </NuxtLink>
            <span v-else class="inline-flex items-center gap-2">
              <UIcon name="i-lucide-user-round" class="size-4" />
              {{ post.authorFullName || 'Autor no disponible' }}
            </span>
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

        <section class="space-y-5 border-t border-default/70 pt-6 md:pt-8">
          <div class="space-y-1">
            <h2 class="text-2xl font-semibold tracking-tight text-highlighted">
              Comentarios
            </h2>
            <p class="text-sm text-muted">
              Conversacion publica sobre este post.
            </p>
          </div>

          <UCard class="rounded-2xl border border-default/70 bg-default/80" :ui="{ body: 'space-y-4 p-4 sm:p-5' }">
            <template v-if="isAuthenticated">
              <UForm
                :schema="CreateCommentRequestSchema"
                :state="commentState"
                class="space-y-3"
                @submit="onSubmitComment"
              >
                <UFormField
                  name="content"
                  label="Tu comentario"
                  required
                  description="Maximo 1000 caracteres."
                >
                  <UTextarea
                    v-model="commentState.content"
                    :rows="4"
                    class="w-full"
                    placeholder="Comparte tu opinion sobre este post"
                  />
                </UFormField>

                <div class="flex items-center justify-between gap-3">
                  <p class="text-xs text-muted">
                    {{ commentState.content.length }} / 1000
                  </p>
                  <UButton
                    type="submit"
                    color="primary"
                    icon="i-lucide-send"
                    label="Publicar comentario"
                    class="rounded-full"
                    :loading="isSubmittingComment"
                    :disabled="isSubmittingComment"
                  />
                </div>
              </UForm>
            </template>

            <template v-else>
              <UAlert
                color="info"
                variant="soft"
                icon="i-lucide-lock"
                title="Inicia sesion para comentar"
                description="Puedes leer los comentarios publicos, pero necesitas autenticarte para participar."
              />

              <UButton
                to="/login"
                color="primary"
                variant="soft"
                icon="i-lucide-log-in"
                label="Ir a login"
                class="rounded-full"
              />
            </template>
          </UCard>

          <UAlert
            v-if="commentsError"
            color="error"
            variant="soft"
            icon="i-lucide-circle-x"
            title="No se pudieron cargar los comentarios"
            :description="commentsError.message"
          />

          <div v-else-if="isLoadingComments" class="space-y-3">
            <USkeleton class="h-20 w-full rounded-2xl" />
            <USkeleton class="h-20 w-full rounded-2xl" />
          </div>

          <UAlert
            v-else-if="!comments?.length"
            color="neutral"
            variant="soft"
            icon="i-lucide-message-circle"
            title="Aun no hay comentarios"
            description="Se el primero en dejar una opinion sobre este post."
          />

          <div v-else class="space-y-3">
            <UCard
              v-for="comment in comments"
              :key="comment.id"
              class="rounded-2xl border border-default/70 bg-default/80"
              :ui="{ body: 'space-y-2 p-4' }"
            >
              <div class="flex flex-wrap items-center gap-3 text-xs text-muted">
                <NuxtLink
                  :to="`/users/${comment.userId}`"
                  class="inline-flex items-center gap-1 rounded-full px-2 py-1 transition-colors hover:bg-elevated hover:text-primary"
                >
                  <UIcon name="i-lucide-user-round" class="size-3.5" />
                  {{ comment.authorName }}
                </NuxtLink>
                <span class="inline-flex items-center gap-1">
                  <UIcon name="i-lucide-calendar" class="size-3.5" />
                  {{ formatDate(comment.createdAt) }}
                </span>
              </div>

              <UForm
                v-if="editingCommentId === comment.id"
                :schema="CreateCommentRequestSchema"
                :state="{ content: editingCommentContent }"
                class="space-y-3"
                @submit="onSaveComment(comment)"
              >
                <UFormField name="content" required>
                  <UTextarea
                    v-model="editingCommentContent"
                    :rows="3"
                    class="w-full"
                  />
                </UFormField>

                <div class="flex flex-wrap items-center justify-end gap-2">
                  <UButton
                    color="neutral"
                    variant="soft"
                    label="Cancelar"
                    :disabled="processingCommentId === comment.id"
                    @click="cancelEditComment"
                  />
                  <UButton
                    type="submit"
                    color="primary"
                    icon="i-lucide-save"
                    label="Guardar"
                    :loading="processingCommentId === comment.id"
                    :disabled="processingCommentId === comment.id"
                  />
                </div>
              </UForm>

              <template v-else>
                <p class="whitespace-pre-wrap text-sm text-toned">
                  {{ comment.content }}
                </p>

                <div v-if="canManageComment(comment)" class="flex flex-wrap items-center justify-end gap-2 pt-1">
                  <UButton
                    color="neutral"
                    variant="soft"
                    icon="i-lucide-pencil"
                    label="Editar"
                    :disabled="processingCommentId !== null"
                    @click="startEditComment(comment)"
                  />

                  <UButton
                    color="error"
                    variant="soft"
                    icon="i-lucide-trash-2"
                    :label="confirmingDeleteCommentId === comment.id ? 'Confirmar eliminar' : 'Eliminar'"
                    :loading="processingCommentId === comment.id"
                    :disabled="processingCommentId !== null"
                    @click="onDeleteComment(comment)"
                  />

                  <UButton
                    v-if="confirmingDeleteCommentId === comment.id"
                    color="neutral"
                    variant="ghost"
                    label="Cancelar"
                    :disabled="processingCommentId !== null"
                    @click="confirmingDeleteCommentId = null"
                  />
                </div>
              </template>
            </UCard>
          </div>
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
