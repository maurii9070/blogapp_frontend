export default defineNuxtPlugin(async () => {
  const { status, fetchMe } = useSession()

  if (status.value === 'unknown')
    await fetchMe()
})
