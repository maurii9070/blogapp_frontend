import type { UpdateMyProfileRequest, UpdateMyProfileResponse } from '~/schemas/users'

export function useUpdateProfile() {
  const config = useRuntimeConfig()
  const { user } = useSession()

  const profile = useState<UpdateMyProfileResponse | null>('my-profile-state', () => null)
  const pending = ref(false)
  const error = ref<Error | null>(null)

  async function fetchProfile(): Promise<UpdateMyProfileResponse | null> {
    pending.value = true
    error.value = null

    try {
      const me = await $fetch<UpdateMyProfileResponse>('/users/me', {
        baseURL: config.public.apiBase,
        credentials: 'include',
      })

      profile.value = me
      return me
    }
    catch (err) {
      error.value = err as Error
      return null
    }
    finally {
      pending.value = false
    }
  }

  async function updateProfile(payload: UpdateMyProfileRequest): Promise<UpdateMyProfileResponse> {
    const updated = await $fetch<UpdateMyProfileResponse>('/users/me', {
      baseURL: config.public.apiBase,
      credentials: 'include',
      method: 'PUT',
      body: payload,
    })

    profile.value = updated

    if (user.value) {
      user.value = {
        ...user.value,
        fullName: updated.fullName,
        email: updated.email,
      }
    }

    await refreshNuxtData('recent-posts')

    return updated
  }

  return {
    profile,
    pending,
    error,
    fetchProfile,
    updateProfile,
  }
}
