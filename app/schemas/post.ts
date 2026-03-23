import * as v from 'valibot'

export const PostSchema = v.object({
  id: v.number(),
  title: v.string(),
  publishedAt: v.string(),
  authorName: v.string(),
})
export type Post = v.InferOutput<typeof PostSchema>

export const PostsResponseSchema = v.object({
  items: v.array(PostSchema),
  totalCount: v.number(),
  currentPage: v.number(),
  pageSize: v.number(),
  hasNextPage: v.boolean(),
})
export type PostsResponse = v.InferOutput<typeof PostsResponseSchema>
