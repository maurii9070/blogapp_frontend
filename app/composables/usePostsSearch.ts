import type { PublishedPostsResponse } from '~/schemas/post'

function parsePositiveInteger(value: unknown, fallback: number): number {
  const raw = Array.isArray(value) ? value[0] : value
  const parsed = Number(raw)

  if (!Number.isInteger(parsed) || parsed < 1)
    return fallback

  return parsed
}

function parseString(value: unknown): string {
  const raw = Array.isArray(value) ? value[0] : value

  if (typeof raw !== 'string')
    return ''

  return raw.trim()
}

function parseTags(value: unknown): string[] {
  if (!value)
    return []

  if (Array.isArray(value))
    return value.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0).map(tag => tag.trim())

  if (typeof value === 'string' && value.trim().length > 0)
    return [value.trim()]

  return []
}

function createEmptyPublishedPostsResponse(): PublishedPostsResponse {
  return {
    items: [],
    totalCount: 0,
    currentPage: 1,
    pageSize: 10,
    hasNextPage: false,
  }
}

export function usePostsSearch() {
  const config = useRuntimeConfig()
  const route = useRoute()
  const router = useRouter()

  const searchText = ref('')
  const selectedCategoryId = ref<number | undefined>(undefined)
  const tags = ref<string[]>([])
  const currentPage = ref(1)
  const pageSize = ref(10)

  const nextTag = ref('')
  const isSyncingFromRoute = ref(false)

  function syncFromRoute(): void {
    isSyncingFromRoute.value = true

    searchText.value = parseString(route.query.q)

    const parsedCategoryId = parsePositiveInteger(route.query.categoryId, 0)
    selectedCategoryId.value = parsedCategoryId > 0 ? parsedCategoryId : undefined

    tags.value = parseTags(route.query.tags)
    currentPage.value = parsePositiveInteger(route.query.page, 1)
    pageSize.value = Math.min(parsePositiveInteger(route.query.pageSize, 10), 50)

    isSyncingFromRoute.value = false
  }

  function buildRouteQuery(): Record<string, string | string[] | undefined> {
    return {
      q: searchText.value || undefined,
      categoryId: selectedCategoryId.value ? String(selectedCategoryId.value) : undefined,
      tags: tags.value.length ? tags.value : undefined,
      page: currentPage.value > 1 ? String(currentPage.value) : undefined,
      pageSize: pageSize.value !== 10 ? String(pageSize.value) : undefined,
    }
  }

  async function syncRouteQuery(): Promise<void> {
    await router.replace({
      query: buildRouteQuery(),
    })
  }

  function resetToFirstPage(): void {
    currentPage.value = 1
  }

  function addTagFromInput(): void {
    const parsed = nextTag.value.trim()

    if (!parsed)
      return

    if (tags.value.includes(parsed)) {
      nextTag.value = ''
      return
    }

    tags.value = [...tags.value, parsed]
    nextTag.value = ''
    resetToFirstPage()
  }

  function removeTag(tag: string): void {
    tags.value = tags.value.filter(item => item !== tag)
    resetToFirstPage()
  }

  function clearFilters(): void {
    searchText.value = ''
    selectedCategoryId.value = undefined
    tags.value = []
    currentPage.value = 1
    pageSize.value = 10
    nextTag.value = ''
  }

  function goToPreviousPage(): void {
    if (currentPage.value <= 1)
      return

    currentPage.value -= 1
  }

  watch(
    () => route.query,
    () => {
      syncFromRoute()
    },
    { immediate: true },
  )

  watch(
    [searchText, selectedCategoryId, tags, currentPage, pageSize],
    async () => {
      if (isSyncingFromRoute.value)
        return

      await syncRouteQuery()
    },
    { deep: true },
  )

  const searchTextModel = computed({
    get: () => searchText.value,
    set: (value: string) => {
      if (value === searchText.value)
        return

      searchText.value = value

      if (currentPage.value > 1)
        currentPage.value = 1
    },
  })

  const selectedCategoryIdModel = computed({
    get: () => selectedCategoryId.value,
    set: (value: number | undefined) => {
      if (value === selectedCategoryId.value)
        return

      selectedCategoryId.value = value

      if (currentPage.value > 1)
        currentPage.value = 1
    },
  })

  const tagsModel = computed({
    get: () => tags.value,
    set: (value: string[]) => {
      const normalized = value.map(tag => tag.trim()).filter(tag => tag.length > 0)

      if (normalized.length === tags.value.length && normalized.every((tag, index) => tag === tags.value[index]))
        return

      tags.value = normalized

      if (currentPage.value > 1)
        currentPage.value = 1
    },
  })

  const pageSizeModel = computed({
    get: () => pageSize.value,
    set: (value: number) => {
      if (value === pageSize.value)
        return

      pageSize.value = value

      if (currentPage.value > 1)
        currentPage.value = 1
    },
  })

  const {
    data: postsResponse,
    pending,
    error,
    refresh,
  } = useAsyncData<PublishedPostsResponse>(
    () => `posts-search-${JSON.stringify(buildRouteQuery())}`,
    async () => {
      return await $fetch<PublishedPostsResponse>('/posts', {
        baseURL: config.public.apiBase,
        query: {
          q: searchText.value || undefined,
          categoryId: selectedCategoryId.value || undefined,
          tags: tags.value.length ? tags.value : undefined,
          page: currentPage.value,
          pageSize: pageSize.value,
        },
      })
    },
    {
      watch: [searchText, selectedCategoryId, tags, currentPage, pageSize],
      default: createEmptyPublishedPostsResponse,
    },
  )

  const totalPosts = computed(() => postsResponse.value?.totalCount ?? 0)
  const hasPreviousPage = computed(() => currentPage.value > 1)
  const hasNextPage = computed(() => Boolean(postsResponse.value?.hasNextPage))

  function goToNextPage(): void {
    if (!hasNextPage.value)
      return

    currentPage.value += 1
  }

  return {
    postsResponse,
    pending,
    error,
    refresh,
    searchTextModel,
    selectedCategoryIdModel,
    tagsModel,
    nextTag,
    currentPage,
    pageSizeModel,
    totalPosts,
    hasPreviousPage,
    hasNextPage,
    addTagFromInput,
    removeTag,
    clearFilters,
    resetToFirstPage,
    goToPreviousPage,
    goToNextPage,
  }
}
