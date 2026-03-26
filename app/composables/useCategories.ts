import type { CategoriesResponse } from '~/schemas/post'

export function useCategories() {
  return useApi<CategoriesResponse>('/categories', {
    key: 'categories-list',
  })
}
