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

export const RegisterRequestSchema = v.pipe(
  v.object({
    fullName: v.pipe(
      v.string('El nombre completo es obligatorio.'),
      v.trim(),
      v.nonEmpty('Ingresa tu nombre completo.'),
      v.minLength(3, 'El nombre completo debe tener al menos 3 caracteres.'),
    ),
    email: v.pipe(
      v.string('El email es obligatorio.'),
      v.trim(),
      v.nonEmpty('Ingresa tu email.'),
      v.email('Ingresa un email valido.'),
    ),
    password: v.pipe(
      v.string('La contrasena es obligatoria.'),
      v.nonEmpty('Ingresa tu contrasena.'),
      v.minLength(6, 'La contraseña debe tener al menos 6 caracteres.'),
    ),
    passwordConfirmation: v.pipe(
      v.string('Debes confirmar la contraseña.'),
      v.nonEmpty('Confirma tu contrasena.'),
    ),
  }),
  v.forward(
    v.check(input => input.password === input.passwordConfirmation, 'Las contraseñas no coinciden.'),
    ['passwordConfirmation'],
  ),
)

export type LoginRequest = v.InferInput<typeof LoginRequestSchema>
export type RegisterRequest = v.InferInput<typeof RegisterRequestSchema>
