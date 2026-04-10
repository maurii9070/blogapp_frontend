import type { Ref } from 'vue'
import type { Post } from '~/schemas/post'

export function usePostDetail(postId: Ref<number>) {
  const config = useRuntimeConfig()

  return useAsyncData<Post | null>(
    () => `post-detail-${postId.value || 'invalid'}`,
    async () => {
      if (!Number.isInteger(postId.value) || postId.value < 1)
        return null

      return await $fetch<Post>(`/posts/${postId.value}`, {
        baseURL: config.public.apiBase,
      })
    },
    {
      watch: [postId],
      default: () => null,
    },
  )
}
