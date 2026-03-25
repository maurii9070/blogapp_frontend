import type { LoginRequest } from '~/schemas/auth'

interface LoginResponse {
  token?: string
  refreshToken?: string
  expiresAt?: string
}

export function useAuth() {
  const config = useRuntimeConfig()

  async function login(payload: LoginRequest): Promise<LoginResponse> {
    return await $fetch<LoginResponse>('/users/login', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: payload,
    })
  }

  return {
    login,
  }
}
