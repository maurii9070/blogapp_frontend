<script setup lang="ts">
import type { ToolbarNames } from 'md-editor-v3'
import type { InferInput } from 'valibot'
import { MdEditor } from 'md-editor-v3'
import { CreatePostSchema } from '~/schemas/post'
import 'md-editor-v3/lib/style.css'

interface CategoryOption {
  label: string
  value: number
}

const categoryOptions: CategoryOption[] = [
  { label: 'Tecnologia', value: 1 },
  { label: 'Programacion', value: 2 },
  { label: 'Producto', value: 3 },
  { label: 'Carrera profesional', value: 4 },
]

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

const editorTheme = computed(() => colorMode.value === 'dark' ? 'dark' : 'light')

const state = reactive<InferInput<typeof CreatePostSchema>>({
  title: '',
  content: '',
  categoryId: categoryOptions[0]?.value ?? 0,
  tagNames: [],
  authorId: user.value?.id ?? '',
})

const availableSuggestedTags = computed(() => {
  const selectedTags = new Set(state.tagNames)
  return suggestedTagOptions.filter(tag => !selectedTags.has(tag))
})

watch(
  () => user.value?.id,
  (nextAuthorId) => {
    if (nextAuthorId)
      state.authorId = nextAuthorId
  },
  { immediate: true },
)

const isSubmitting = ref(false)

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
    await $fetch('/posts', {
      baseURL: config.public.apiBase,
      credentials: 'include',
      method: 'POST',
      body: payload,
    })

    toast.add({
      title: 'Post creado',
      description: 'Tu publicacion se guardo correctamente.',
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
        type="submit"
        color="primary"
        icon="i-lucide-send-horizontal"
        label="Publicar post"
        :loading="isSubmitting"
        :disabled="isSubmitting"
      />
    </div>
  </UForm>
</template>
