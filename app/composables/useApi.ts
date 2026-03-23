export const useApi = createUseFetch(callerOptions => ({
  baseURL: useRuntimeConfig().public.apiBase,
  ...callerOptions,
}))
