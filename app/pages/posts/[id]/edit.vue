<script setup lang="ts">
import type { Post } from '~/schemas/post'

definePageMeta({
  middleware: ['auth', 'editor'],
})

interface EditablePost extends Post {
  categoryId?: number
}

const route = useRoute()
const { user } = useSession()

const rawPostId = Number(route.params.id)

if (!Number.isInteger(rawPostId) || rawPostId < 1) {
  throw showError({
    statusCode: 400,
    statusMessage: 'ID de post invalido.',
  })
}

const postId = rawPostId

const { data: post, pending, error } = await useApi<EditablePost>(`/posts/${postId}`, {
  key: `post-edit-${postId}`,
})

const hasEditorRole = computed(() => {
  const roles = user.value?.roles ?? []

  return roles.includes('Editor') || roles.includes('Admin')
})

const canEditPost = computed(() => {
  if (!post.value)
    return false

  if (hasEditorRole.value)
    return true

  const currentUserId = user.value?.id?.toLowerCase()

  if (!currentUserId)
    return false

  const authorId = post.value.authorId?.toLowerCase()
  const authorShortId = post.value.authorShortId?.toLowerCase()

  return Boolean(
    (authorId && authorId === currentUserId)
    || (authorShortId && (authorShortId === currentUserId || currentUserId.endsWith(authorShortId))),
  )
})
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <UCard
      class="border-default/80 bg-default/95 shadow-xl shadow-primary/5"
      :ui="{ body: 'space-y-6 p-6 sm:p-8' }"
    >
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Editor
        </p>
        <h1 class="text-2xl font-semibold text-highlighted">
          Editar post
        </h1>
        <p class="text-sm text-muted">
          Actualiza el contenido de tu post y guarda los cambios.
        </p>
      </div>

      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        icon="i-lucide-circle-x"
        title="No se pudo cargar el post"
        :description="error.message"
      />

      <div v-else-if="pending" class="py-6">
        <UProgress color="primary" indeterminate />
      </div>

      <UAlert
        v-else-if="!post"
        color="warning"
        variant="soft"
        icon="i-lucide-file-warning"
        title="Post no encontrado"
        description="No encontramos la informacion del post para editarlo."
      />

      <UAlert
        v-else-if="!canEditPost"
        color="warning"
        variant="soft"
        icon="i-lucide-shield-alert"
        title="No tienes permisos para editar este post"
        description="Solo el autor o un usuario con rol Editor/Admin puede editar este contenido."
      />

      <PostEditorForm
        v-else
        mode="edit"
        :post-id="post.id"
        :initial-post="post"
      />
    </UCard>
  </div>
</template>
