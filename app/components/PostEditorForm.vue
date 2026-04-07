<script setup lang="ts">
import type { ToolbarNames } from 'md-editor-v3'
import type { InferInput } from 'valibot'
import type { Category, CreatePostResponse } from '~/schemas/post'
import { MdEditor } from 'md-editor-v3'
import { CreatePostSchema } from '~/schemas/post'
import 'md-editor-v3/lib/style.css'

interface CategoryOption {
  label: string
  value: number
}

type SubmitAction = 'draft' | 'publish'

const suggestedTagOptions = [
  'Nuxt',
  'Vue',
  'TypeScript',
  'Backend',
  'Frontend',
  'Arquitectura',
]

const excludedToolbarItems: ToolbarNames[] = ['save', 'mermaid', 'image', 'katex', 'github']

const toast = useToast()
const config = useRuntimeConfig()
const colorMode = useColorMode()
const { start, finish } = useLoadingIndicator()
const { user } = useSession()
const { data: categories, pending: isLoadingCategories } = useCategories()

const editorTheme = computed(() => colorMode.value === 'dark' ? 'dark' : 'light')

const state = reactive<InferInput<typeof CreatePostSchema>>({
  title: '',
  content: '',
  categoryId: 0,
  tagNames: [],
  authorId: user.value?.id ?? '',
})

const categoryOptions = computed<CategoryOption[]>(() => {
  const categoryItems = categories.value ?? []
  return categoryItems.map((category: Category) => ({
    label: category.name,
    value: category.id,
  }))
})

watch(
  categoryOptions,
  (options) => {
    const [firstOption] = options

    if (!firstOption)
      return

    if (!state.categoryId || !options.some(option => option.value === state.categoryId))
      state.categoryId = firstOption.value
  },
  { immediate: true },
)

const availableSuggestedTags = computed(() => {
  const selectedTags = new Set(state.tagNames)
  return suggestedTagOptions.filter(tag => !selectedTags.has(tag))
})

const canSubmit = computed(() => !isLoadingCategories.value && categoryOptions.value.length > 0)

watch(
  () => user.value?.id,
  (nextAuthorId) => {
    if (nextAuthorId)
      state.authorId = nextAuthorId
  },
  { immediate: true },
)

const isSubmitting = ref(false)
const submitAction = ref<SubmitAction>('draft')

function normalizeTags(tagNames: string[]): string[] {
  const normalizedTags = tagNames
    .map(tag => tag.trim())
    .filter(Boolean)

  return [...new Set(normalizedTags)]
}

function addSuggestedTag(tag: string): void {
  if (state.tagNames.includes(tag))
    return

  state.tagNames = [...state.tagNames, tag]
}

async function onSubmit(): Promise<void> {
  if (isSubmitting.value)
    return

  isSubmitting.value = true
  start()

  state.tagNames = normalizeTags(state.tagNames)
  state.authorId = user.value?.id ?? state.authorId

  const payload: InferInput<typeof CreatePostSchema> = {
    title: state.title.trim(),
    content: state.content,
    categoryId: state.categoryId,
    tagNames: state.tagNames,
    authorId: state.authorId,
  }

  try {
    const createdPost = await $fetch<CreatePostResponse>('/posts', {
      baseURL: config.public.apiBase,
      credentials: 'include',
      method: 'POST',
      body: payload,
    })

    if (submitAction.value === 'publish') {
      await $fetch(`/posts/${createdPost.id}/publish`, {
        baseURL: config.public.apiBase,
        credentials: 'include',
        method: 'PATCH',
      })

      toast.add({
        title: 'Post publicado',
        description: 'Tu post ya esta visible para todos.',
        color: 'success',
        icon: 'i-lucide-circle-check',
      })

      await navigateTo(`/posts/${createdPost.id}/${createdPost.slug}`)
      return
    }

    toast.add({
      title: 'Borrador guardado',
      description: `Se guardo correctamente (ID: ${createdPost.id}).`,
      color: 'success',
      icon: 'i-lucide-circle-check',
    })

    await navigateTo('/')
  }
  catch (error) {
    if (import.meta.dev)
      console.error(error)

    finish({ error: true })

    toast.add({
      title: 'No se pudo crear el post',
      description: 'Revisa los campos e intenta nuevamente.',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  }
  finally {
    isSubmitting.value = false
    finish()
  }
}
</script>

<template>
  <UForm
    :schema="CreatePostSchema"
    :state="state"
    class="space-y-5"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
      <UFormField name="title" label="Titulo" required class="md:col-span-2">
        <UInput
          v-model="state.title"
          placeholder="Ej: Guia practica para escribir posts tecnicos"
          icon="i-lucide-pen-line"
          class="w-full"
        />
      </UFormField>

      <UFormField name="categoryId" label="Categoria" required>
        <USelect
          v-model="state.categoryId"
          :items="categoryOptions"
          value-key="value"
          label-key="label"
          :loading="isLoadingCategories"
          :disabled="isLoadingCategories || !categoryOptions.length"
          placeholder="Selecciona una categoria"
          class="w-full"
        />
      </UFormField>
    </div>

    <UFormField
      name="tagNames"
      label="Tags"
      description="Presiona Enter para agregar cada tag."
    >
      <div class="space-y-3">
        <UInputTags
          v-model="state.tagNames"
          class="w-full"
          placeholder="Ej: Nuxt, Vue, API"
          :max="12"
        />

        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="tag in availableSuggestedTags"
            :key="tag"
            type="button"
            color="neutral"
            variant="soft"
            size="xs"
            :label="`+ ${tag}`"
            @click="addSuggestedTag(tag)"
          />
        </div>
      </div>
    </UFormField>

    <UFormField name="content" label="Contenido" required>
      <ClientOnly>
        <MdEditor
          v-model="state.content"
          editor-id="create-post-editor"
          language="en-US"
          :theme="editorTheme"
          :toolbars-exclude="excludedToolbarItems"
          class="rounded-xl border border-default"
        />

        <template #fallback>
          <USkeleton class="h-96 w-full rounded-xl" />
        </template>
      </ClientOnly>
    </UFormField>

    <div class="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
      <UButton
        to="/"
        color="neutral"
        variant="soft"
        icon="i-lucide-arrow-left"
        label="Cancelar"
        :disabled="isSubmitting"
      />

      <UButton
        label="Guardar borrador"
        type="submit"
        color="neutral"
        variant="soft"
        icon="i-lucide-save"
        :loading="isSubmitting"
        :disabled="isSubmitting || !canSubmit"
        @click="submitAction = 'draft'"
      />

      <UButton
        label="Crear y publicar"
        type="submit"
        color="primary"
        icon="i-lucide-send-horizontal"
        :loading="isSubmitting && submitAction === 'publish'"
        :disabled="isSubmitting || !canSubmit"
        @click="submitAction = 'publish'"
      />
    </div>
  </UForm>
</template>
