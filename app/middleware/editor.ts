export default defineNuxtRouteMiddleware(() => {
  const { user } = useSession()

  const roles = user.value?.roles ?? []
  const canCreatePosts = roles.includes('Editor') || roles.includes('Admin')

  if (canCreatePosts)
    return

  return navigateTo('/')
})
