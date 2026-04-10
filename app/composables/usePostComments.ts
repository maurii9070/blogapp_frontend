import type { Ref } from 'vue'
import type { CreateCommentRequest, CreateCommentResponse, PostCommentsResponse } from '~/schemas/comments'

function createEmptyCommentsResponse(): PostCommentsResponse {
  return []
}

export function usePostComments(postId: Ref<number>) {
  const config = useRuntimeConfig()

  const commentsState = useAsyncData<PostCommentsResponse>(
    () => `post-comments-${postId.value || 'invalid'}`,
    async () => {
      if (!Number.isInteger(postId.value) || postId.value < 1)
        return createEmptyCommentsResponse()

      return await $fetch<PostCommentsResponse>(`/posts/${postId.value}/comments`, {
        baseURL: config.public.apiBase,
      })
    },
    {
      watch: [postId],
      default: createEmptyCommentsResponse,
    },
  )

  async function createComment(payload: CreateCommentRequest): Promise<CreateCommentResponse> {
    if (!Number.isInteger(postId.value) || postId.value < 1)
      throw createError({ statusCode: 400, statusMessage: 'Post invalido.' })

    return await $fetch<CreateCommentResponse>(`/posts/${postId.value}/comments`, {
      baseURL: config.public.apiBase,
      credentials: 'include',
      method: 'POST',
      body: payload,
    })
  }

  async function updateComment(commentId: number, payload: CreateCommentRequest): Promise<CreateCommentResponse> {
    if (!Number.isInteger(postId.value) || postId.value < 1)
      throw createError({ statusCode: 400, statusMessage: 'Post invalido.' })

    return await $fetch<CreateCommentResponse>(`/posts/${postId.value}/comments/${commentId}`, {
      baseURL: config.public.apiBase,
      credentials: 'include',
      method: 'PUT',
      body: payload,
    })
  }

  async function deleteComment(commentId: number): Promise<void> {
    if (!Number.isInteger(postId.value) || postId.value < 1)
      throw createError({ statusCode: 400, statusMessage: 'Post invalido.' })

    await $fetch(`/posts/${postId.value}/comments/${commentId}`, {
      baseURL: config.public.apiBase,
      credentials: 'include',
      method: 'DELETE',
    })
  }

  return {
    ...commentsState,
    createComment,
    updateComment,
    deleteComment,
  }
}
