export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, status, fetchMe } = useSession()

  if (status.value === 'unknown' || status.value === 'loading')
    await fetchMe()

  if (isAuthenticated.value)
    return

  return navigateTo({
    path: '/login',
    query: { redirect: to.fullPath },
  })
})
