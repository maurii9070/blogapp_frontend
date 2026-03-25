import * as v from 'valibot'

export const LoginRequestSchema = v.object({
  email: v.pipe(
    v.string('El email es obligatorio.'),
    v.trim(),
    v.nonEmpty('Ingresa tu email.'),
    v.email('Ingresa un email valido.'),
  ),
  password: v.pipe(
    v.string('La contrasena es obligatoria.'),
    v.nonEmpty('Ingresa tu contrasena.'),
    v.minLength(6, 'La contrasena debe tener al menos 6 caracteres.'),
  ),
  rememberMe: v.boolean(),
})

export type LoginRequest = v.InferInput<typeof LoginRequestSchema>
