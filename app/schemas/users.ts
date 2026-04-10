import * as v from 'valibot'

export const UserRoleSchema = v.string()

export const AuthUserSchema = v.object({
  id: v.string(),
  email: v.string(),
  fullName: v.string(),
  userName: v.string(),
  roles: v.array(UserRoleSchema),
})
export type AuthUser = v.InferOutput<typeof AuthUserSchema>

export const PublicUserProfileSchema = v.object({
  id: v.string(),
  fullName: v.string(),
  publishedPostsCount: v.number(),
})
export type PublicUserProfile = v.InferOutput<typeof PublicUserProfileSchema>

export const UpdateMyProfileRequestSchema = v.object({
  fullName: v.pipe(
    v.string('El nombre completo es obligatorio.'),
    v.trim(),
    v.nonEmpty('Ingresa tu nombre completo.'),
    v.minLength(3, 'El nombre completo debe tener al menos 3 caracteres.'),
    v.maxLength(120, 'El nombre completo no puede superar los 120 caracteres.'),
  ),
  email: v.pipe(
    v.string('El email es obligatorio.'),
    v.trim(),
    v.nonEmpty('Ingresa tu email.'),
    v.email('Ingresa un email valido.'),
  ),
})
export type UpdateMyProfileRequest = v.InferInput<typeof UpdateMyProfileRequestSchema>

export const UpdateMyProfileResponseSchema = v.object({
  id: v.string(),
  email: v.string(),
  fullName: v.string(),
  userName: v.string(),
})
export type UpdateMyProfileResponse = v.InferOutput<typeof UpdateMyProfileResponseSchema>

export interface ValidationProblemResponse {
  title?: string
  status?: number
  errors?: Record<string, string[]>
}
