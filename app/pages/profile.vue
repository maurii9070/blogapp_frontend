<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const toast = useToast()
const config = useRuntimeConfig()
const { user } = useSession()

const currentPage = ref(1)
const pageSize = ref(10)
const deletingPostId = ref<number | null>(null)
const publishingPostId = ref<number | null>(null)
const isDeleteModalOpen = ref(false)
const postToDelete = ref<{ id: number, title: string } | null>(null)

const userId = computed(() => user.value?.id ?? '')

const {
  data: userPostsResponse,
  pending: isLoadingUserPosts,
  error: userPostsError,
  refresh: refreshUserPosts,
} = useUserPosts(userId, currentPage, pageSize)

const userPosts = computed(() => userPostsResponse.value?.items ?? [])
const totalPosts = computed(() => userPostsResponse.value?.totalCount ?? 0)
const hasPreviousPage = computed(() => currentPage.value > 1)
const hasNextPage = computed(() => Boolean(userPostsResponse.value?.hasNextPage))
const publishedPostsCount = computed(() => userPosts.value.filter(post => Boolean(post.publishedAt)).length)
const draftPostsCount = computed(() => userPosts.value.filter(post => !post.publishedAt).length)

function formatDate(dateString: string | null | undefined): string {
  if (!dateString)
    return 'Sin fecha'

  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function goToPreviousPage(): void {
  if (!hasPreviousPage.value)
    return

  currentPage.value -= 1
}

function goToNextPage(): void {
  if (!hasNextPage.value)
    return

  currentPage.value += 1
}

function requestDeletePost(postId: number, title: string): void {
  postToDelete.value = {
    id: postId,
    title,
  }

  isDeleteModalOpen.value = true
}

function closeDeleteModal(): void {
  if (deletingPostId.value)
    return

  isDeleteModalOpen.value = false
  postToDelete.value = null
}

async function onDeletePost(): Promise<void> {
  const selectedPost = postToDelete.value

  if (!selectedPost)
    return

  if (deletingPostId.value)
    return

  deletingPostId.value = selectedPost.id

  try {
    await $fetch(`/posts/${selectedPost.id}`, {
      baseURL: config.public.apiBase,
      credentials: 'include',
      method: 'DELETE',
    })

    if (userPosts.value.length === 1 && currentPage.value > 1)
      currentPage.value -= 1

    isDeleteModalOpen.value = false
    postToDelete.value = null
    await refreshUserPosts()
    await refreshNuxtData('recent-posts')

    toast.add({
      title: 'Post eliminado',
      description: 'El post se elimino correctamente.',
      color: 'success',
      icon: 'i-lucide-trash-2',
    })
  }
  catch (error) {
    if (import.meta.dev)
      console.error(error)

    toast.add({
      title: 'No se pudo eliminar el post',
      description: 'Intenta nuevamente en unos segundos.',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  }
  finally {
    deletingPostId.value = null
  }
}

async function onPublishPost(postId: number): Promise<void> {
  if (publishingPostId.value)
    return

  publishingPostId.value = postId

  try {
    await $fetch(`/posts/${postId}/publish`, {
      baseURL: config.public.apiBase,
      credentials: 'include',
      method: 'PATCH',
    })

    await refreshUserPosts()
    await refreshNuxtData('recent-posts')

    toast.add({
      title: 'Post publicado',
      description: 'Tu post ya esta visible para todos.',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
  }
  catch (error) {
    if (import.meta.dev)
      console.error(error)

    toast.add({
      title: 'No se pudo publicar el post',
      description: 'Intenta nuevamente en unos segundos.',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  }
  finally {
    publishingPostId.value = null
  }
}
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-6 md:space-y-8">
    <section class="space-y-4">
      <UCard class="rounded-3xl border border-default/70 bg-default/80 shadow-sm" :ui="{ body: 'space-y-4 p-6 sm:p-7' }">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
          Cuenta
        </p>
        <div class="space-y-1">
          <h1 class="text-3xl font-semibold tracking-tight text-highlighted">
            Mi perfil
          </h1>
          <p class="text-sm text-muted">
            Administra tus publicaciones y mantén tu perfil siempre activo.
          </p>
        </div>

        <UAlert
          color="neutral"
          variant="soft"
          icon="i-lucide-user-round"
          :title="user?.fullName || user?.userName || 'Usuario autenticado'"
          :description="user?.email || 'Sesion activa detectada por cookie.'"
        />

        <div class="flex flex-wrap items-center justify-between gap-3">
          <UButton
            to="/posts/create"
            color="primary"
            variant="soft"
            icon="i-lucide-square-pen"
            label="Nuevo post"
            class="rounded-full"
          />
          <p class="text-sm text-muted">
            Tu espacio de gestion de contenido
          </p>
        </div>
      </UCard>

      <div class="grid gap-3 sm:grid-cols-3">
        <UCard class="rounded-2xl border border-default/70 bg-default/80 shadow-sm" :ui="{ body: 'space-y-1.5 p-4' }">
          <p class="text-xs uppercase tracking-[0.14em] text-muted">
            Total
          </p>
          <p class="text-2xl font-semibold tracking-tight text-highlighted">
            {{ totalPosts }}
          </p>
          <p class="text-sm text-muted">
            Posts creados
          </p>
        </UCard>

        <UCard class="rounded-2xl border border-default/70 bg-default/80 shadow-sm" :ui="{ body: 'space-y-1.5 p-4' }">
          <p class="text-xs uppercase tracking-[0.14em] text-muted">
            Publicados
          </p>
          <p class="text-2xl font-semibold tracking-tight text-highlighted">
            {{ publishedPostsCount }}
          </p>
          <p class="text-sm text-muted">
            Visibles para todos
          </p>
        </UCard>

        <UCard class="rounded-2xl border border-default/70 bg-default/80 shadow-sm" :ui="{ body: 'space-y-1.5 p-4' }">
          <p class="text-xs uppercase tracking-[0.14em] text-muted">
            Borradores
          </p>
          <p class="text-2xl font-semibold tracking-tight text-highlighted">
            {{ draftPostsCount }}
          </p>
          <p class="text-sm text-muted">
            Pendientes de publicar
          </p>
        </UCard>
      </div>
    </section>

    <UCard class="rounded-3xl border border-default/70 bg-default/80 shadow-sm" :ui="{ body: 'space-y-5 p-5 sm:p-6 md:p-7' }">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-xl font-semibold tracking-tight text-highlighted">
          Mis posts
        </h2>

        <div class="flex items-center gap-2">
          <UButton
            color="neutral"
            variant="soft"
            icon="i-lucide-chevron-left"
            class="rounded-full"
            :disabled="!hasPreviousPage || isLoadingUserPosts"
            @click="goToPreviousPage"
          />

          <span class="text-sm text-muted">Pagina {{ currentPage }}</span>

          <UButton
            color="neutral"
            variant="soft"
            icon="i-lucide-chevron-right"
            class="rounded-full"
            :disabled="!hasNextPage || isLoadingUserPosts"
            @click="goToNextPage"
          />
        </div>
      </div>

      <UAlert
        v-if="userPostsError"
        color="error"
        variant="soft"
        icon="i-lucide-circle-x"
        title="No se pudieron cargar tus posts"
        :description="userPostsError.message"
      />

      <div v-else-if="isLoadingUserPosts && !userPosts.length" class="space-y-3">
        <USkeleton class="h-28 w-full rounded-2xl" />
        <USkeleton class="h-28 w-full rounded-2xl" />
        <USkeleton class="h-28 w-full rounded-2xl" />
      </div>

      <UAlert
        v-else-if="!userPosts.length"
        color="neutral"
        variant="soft"
        icon="i-lucide-book-open"
        title="Aun no tienes posts"
        description="Crea tu primer post para verlo aqui."
      />

      <div v-else class="space-y-3">
        <article
          v-for="post in userPosts"
          :key="post.id"
          class="group rounded-2xl border border-default/70 bg-elevated/25 p-4 transition-all hover:border-primary/20 hover:bg-elevated/40"
        >
          <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div class="space-y-2.5">
              <h3 class="text-base font-semibold tracking-tight text-highlighted sm:text-lg">
                {{ post.title }}
              </h3>

              <div class="flex flex-wrap items-center gap-2 text-xs text-muted">
                <UBadge
                  :color="post.publishedAt ? 'success' : 'warning'"
                  variant="soft"
                  class="rounded-full px-2.5 py-1"
                >
                  {{ post.publishedAt ? 'Publicado' : 'Borrador' }}
                </UBadge>

                <span class="inline-flex items-center gap-1">
                  <UIcon name="i-lucide-calendar" class="size-3.5" />
                  {{ formatDate(post.createdAt) }}
                </span>

                <UBadge v-if="post.categoryName" color="primary" variant="subtle" class="rounded-full px-2.5 py-1">
                  {{ post.categoryName }}
                </UBadge>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton
                v-if="post.publishedAt"
                :to="`/posts/${post.id}/edit`"
                color="primary"
                variant="soft"
                icon="i-lucide-pencil"
                label="Editar"
                class="rounded-full"
              />

              <UButton
                v-if="post.publishedAt && post.slug"
                :to="`/posts/${post.id}/${post.slug}`"
                color="neutral"
                variant="ghost"
                icon="i-lucide-eye"
                label="Ver"
                class="rounded-full"
              />

              <UButton
                v-if="!post.publishedAt"
                color="warning"
                variant="soft"
                icon="i-lucide-send"
                label="Publicar"
                class="rounded-full"
                :loading="publishingPostId === post.id"
                :disabled="publishingPostId !== null || deletingPostId !== null"
                @click="onPublishPost(post.id)"
              />

              <UButton
                v-if="post.publishedAt"
                color="error"
                variant="soft"
                icon="i-lucide-trash-2"
                label="Eliminar"
                class="rounded-full"
                :loading="deletingPostId === post.id"
                :disabled="deletingPostId !== null || publishingPostId !== null"
                @click="requestDeletePost(post.id, post.title)"
              />
            </div>
          </div>
        </article>

        <div class="flex items-center justify-between border-t border-default/70 pt-3">
          <p class="text-xs text-muted">
            Total: {{ totalPosts }} posts
          </p>

          <p class="text-xs text-muted">
            Mostrando {{ userPosts.length }} resultados
          </p>
        </div>
      </div>
    </UCard>

    <UModal v-model:open="isDeleteModalOpen">
      <template #content>
        <UCard class="rounded-2xl" :ui="{ body: 'space-y-4 p-5', footer: 'flex justify-end gap-2 p-4' }">
          <template #header>
            <div class="flex items-center gap-2 text-error">
              <UIcon name="i-lucide-triangle-alert" class="size-5" />
              <h3 class="text-base font-semibold">
                Confirmar eliminacion
              </h3>
            </div>
          </template>

          <p class="text-sm text-muted">
            Esta accion eliminara el post
            <span class="font-semibold text-highlighted">"{{ postToDelete?.title || 'sin titulo' }}"</span>
            y no se puede deshacer.
          </p>

          <template #footer>
            <UButton
              color="neutral"
              variant="soft"
              label="Cancelar"
              :disabled="deletingPostId !== null"
              @click="closeDeleteModal"
            />
            <UButton
              color="error"
              icon="i-lucide-trash-2"
              label="Eliminar"
              :loading="deletingPostId !== null"
              :disabled="deletingPostId !== null"
              @click="onDeletePost"
            />
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
