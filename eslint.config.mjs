import antfu from '@antfu/eslint-config'
// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(antfu({
  vue: true,
  typescript: true,
  pnpm: true,
  stylistic: {
    indent: 2,
    quotes: 'single',
  },
}))
