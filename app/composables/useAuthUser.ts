export function useAuthUser() {
  const { user, status, isAuthenticated, fetchMe } = useSession()

  const isLoading = computed(() => status.value === 'loading' || status.value === 'unknown')

  return {
    user,
    status,
    isAuthenticated,
    isLoading,
    fetchMe,
  }
}
