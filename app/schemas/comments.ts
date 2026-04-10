import * as v from 'valibot'

export const CommentSchema = v.object({
  id: v.number(),
  postId: v.number(),
  content: v.string(),
  createdAt: v.string(),
  userId: v.string(),
  authorName: v.string(),
})
export type PostComment = v.InferOutput<typeof CommentSchema>

export const PostCommentsResponseSchema = v.array(CommentSchema)
export type PostCommentsResponse = v.InferOutput<typeof PostCommentsResponseSchema>

export const CreateCommentRequestSchema = v.object({
  content: v.pipe(
    v.string('El comentario es obligatorio.'),
    v.trim(),
    v.nonEmpty('Escribe un comentario.'),
    v.maxLength(1000, 'El comentario no puede superar los 1000 caracteres.'),
  ),
})
export type CreateCommentRequest = v.InferInput<typeof CreateCommentRequestSchema>

export const CreateCommentResponseSchema = CommentSchema
export type CreateCommentResponse = v.InferOutput<typeof CreateCommentResponseSchema>

export const UpdateCommentRequestSchema = CreateCommentRequestSchema
export type UpdateCommentRequest = v.InferInput<typeof UpdateCommentRequestSchema>
