import type { ValidationProblemResponse } from '~/schemas/users'

interface ApiErrorLike {
  data?: unknown
  statusCode?: number
  statusMessage?: string
  message?: string
}

function isValidationProblemResponse(value: unknown): value is ValidationProblemResponse {
  if (!value || typeof value !== 'object')
    return false

  const maybeProblem = value as ValidationProblemResponse
  return typeof maybeProblem.errors === 'object' && maybeProblem.errors !== null
}

export function extractErrorMessage(error: unknown, fallback = 'Ocurrio un error inesperado.'): string {
  const apiError = error as ApiErrorLike

  if (isValidationProblemResponse(apiError?.data)) {
    const entries = Object.entries(apiError.data.errors ?? {})

    if (!entries.length)
      return fallback

    return entries
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join(' | ')
  }

  if (typeof apiError?.statusMessage === 'string' && apiError.statusMessage.length)
    return apiError.statusMessage

  if (typeof apiError?.message === 'string' && apiError.message.length)
    return apiError.message

  return fallback
}
