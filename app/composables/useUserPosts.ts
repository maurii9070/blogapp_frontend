import type { Ref } from 'vue'
import type { Post } from '~/schemas/post'

export interface UserPostsResponse {
  items: Post[]
  totalCount: number
  currentPage: number
  pageSize: number
  hasNextPage: boolean
}

function createEmptyUserPostsResponse(): UserPostsResponse {
  return {
    items: [],
    totalCount: 0,
    currentPage: 1,
    pageSize: 10,
    hasNextPage: false,
  }
}

export function useUserPosts(userId: Ref<string>, currentPage: Ref<number>, pageSize: Ref<number>) {
  const config = useRuntimeConfig()

  return useAsyncData<UserPostsResponse>(
    () => `user-posts-${userId.value || 'anonymous'}-${currentPage.value}-${pageSize.value}`,
    async () => {
      if (!userId.value)
        return createEmptyUserPostsResponse()

      return await $fetch<UserPostsResponse>(`/users/${userId.value}/posts`, {
        baseURL: config.public.apiBase,
        credentials: 'include',
        query: {
          page: currentPage.value,
          pageSize: pageSize.value,
        },
      })
    },
    {
      watch: [userId, currentPage, pageSize],
      default: createEmptyUserPostsResponse,
    },
  )
}
