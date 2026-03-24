import * as v from 'valibot'

export const PublishedPostSchema = v.object({
  id: v.number(),
  title: v.string(),
  publishedAt: v.string(),
  authorName: v.string(),
  slug: v.string(),
})
export type PublishedPost = v.InferOutput<typeof PublishedPostSchema>

export const PostSchema = v.object({
  id: v.number(),
  title: v.string(),
  content: v.string(),
  slug: v.string(),
  authorShortId: v.string(),
  createdAt: v.string(),
  publishedAt: v.string(),
  categoryName: v.string(),
  tagNames: v.array(v.string()),
})
export type Post = v.InferOutput<typeof PostSchema>

export const PublishedPostsResponseSchema = v.object({
  items: v.array(PublishedPostSchema),
  totalCount: v.number(),
  currentPage: v.number(),
  pageSize: v.number(),
  hasNextPage: v.boolean(),
})
export type PublishedPostsResponse = v.InferOutput<typeof PublishedPostsResponseSchema>
