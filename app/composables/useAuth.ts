import type { LoginRequest, RegisterRequest } from '~/schemas/auth'

export function useAuth() {
  const config = useRuntimeConfig()
  const { fetchMe, clearSession } = useSession()

  async function login(payload: LoginRequest): Promise<void> {
    await $fetch('/users/login', {
      baseURL: config.public.apiBase,
      credentials: 'include',
      method: 'POST',
      body: payload,
    })

    await fetchMe()
  }

  async function register(payload: RegisterRequest): Promise<void> {
    await $fetch('/users/register', {
      baseURL: config.public.apiBase,
      credentials: 'include',
      method: 'POST',
      body: payload,
    })

    await fetchMe()
  }

  async function logout(): Promise<void> {
    await $fetch('/users/logout', {
      baseURL: config.public.apiBase,
      credentials: 'include',
      method: 'POST',
    })

    clearSession()
  }

  return {
    login,
    register,
    logout,
  }
}
