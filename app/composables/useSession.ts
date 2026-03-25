interface SessionUser {
  id: string
  email: string
  userName: string
  fullName: string
}

type SessionStatus = 'unknown' | 'loading' | 'authenticated' | 'guest'

export function useSession() {
  const config = useRuntimeConfig()

  const status = useState<SessionStatus>('session-status', () => 'unknown')
  const user = useState<SessionUser | null>('session-user', () => null)

  const isAuthenticated = computed(() => status.value === 'authenticated')

  async function fetchMe(): Promise<SessionUser | null> {
    if (status.value === 'loading')
      return user.value

    status.value = 'loading'

    try {
      const me = await $fetch<SessionUser>('/users/me', {
        baseURL: config.public.apiBase,
        credentials: 'include',
      })

      user.value = me
      status.value = 'authenticated'
      return me
    }
    catch {
      user.value = null
      status.value = 'guest'
      return null
    }
  }

  function setAuthenticated(nextUser: SessionUser): void {
    user.value = nextUser
    status.value = 'authenticated'
  }

  function clearSession(): void {
    user.value = null
    status.value = 'guest'
  }

  return {
    status,
    user,
    isAuthenticated,
    fetchMe,
    setAuthenticated,
    clearSession,
  }
}
