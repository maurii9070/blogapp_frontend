import type { PublishedPostsResponse } from '~/schemas/post'

export function useRecentPosts() {
  return useApi<PublishedPostsResponse>('/posts', {
    key: 'recent-posts',
  })
}
