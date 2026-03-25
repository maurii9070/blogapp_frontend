# AGENTS.md

Welcome, AI Coding Agent. This repository contains the frontend application for the BlogApp. Please carefully adhere to the following build, test, and style guidelines when modifying or adding code.

## 1. Project Stack & Environment

- **Framework**: Nuxt 4 (Vue 3, Composition API)
- **UI Library**: @nuxt/ui v4
- **Styling**: Tailwind CSS v4
- **Validation**: Valibot v1.x
- **Package Manager**: pnpm v10.x
- **Language**: TypeScript

## 2. Build, Lint, and Test Commands

Always use `pnpm` for executing scripts and installing packages.

### Setup & Development
- **Install dependencies**: `pnpm install`
- **Start development server**: `pnpm dev`
- **Build for production**: `pnpm build`
- **Preview production build**: `pnpm preview`

### Code Quality (Linting & Formatting)
- **Run ESLint (Formatting & Linting)**: `pnpm lint`
  - *Note*: We use `@antfu/eslint-config` combined with `@nuxt/eslint`. Do NOT add Prettier; ESLint handles formatting.
- **Run Typechecking**: `pnpm typecheck`

### Testing
*Note: A testing framework (e.g., Vitest) is not yet fully configured in `package.json`.*
- **Run all tests**: `pnpm test` (when configured)
- **Run a single test file**: `pnpm vitest run path/to/file.test.ts` (when configured)
- **Run tests in watch mode**: `pnpm test:watch` (when configured)
- *Agent Instruction: If asked to write and run a test but Vitest is missing, first ask if you should install and configure `@nuxt/test-utils` and `vitest`.*

---

## 3. Code Style & Architecture Guidelines

### 3.1 Vue & Nuxt Paradigms
- **Script Setup**: Always use `<script setup lang="ts">` for Vue components.
- **Auto-imports**: Rely on Nuxt auto-imports. Do NOT manually import Vue composables (`ref`, `computed`, `watch`), Nuxt composables (`useRouter`, `useFetch`), or components from `components/` unless necessary for type inference.
- **Routing**: Use Nuxt's file-based routing system in the `pages/` directory.

### 3.2 UI & Styling (@nuxt/ui v4 & Tailwind CSS v4)
- **Component Usage**: Use standard `@nuxt/ui` components (e.g., `<UButton>`, `<UInput>`, `<UCard>`, `<UModal>`). Refer to `@nuxt/ui` v4 docs for latest APIs.
- **Styling**: Use Tailwind CSS v4 utility classes.
- **Custom CSS**: Avoid custom `<style>` blocks or `.css` files unless implementing complex animations. Use `<style scoped>` if required.

### 3.3 TypeScript & Typing
- **Strict Typing**: Always type function parameters and return types when not naturally inferred.
- **Interfaces vs Types**: Prefer `interface` for object shapes. Use `type` for unions, intersections, and utility types.
- **Ref Typing**: Provide explicit types for reactive variables initialized with null/undefined (e.g., `const user = ref<User | null>(null)`).

### 3.4 Form & Data Validation (Valibot v1.x)
- **Schema Definition**: Use Valibot for all runtime validation, form validation, and API payload checking.
- **Type Extraction**: Use `InferInput<typeof schema>` to generate TypeScript types directly from Valibot schemas.
- **Form Integration**: Integrate Valibot schemas with `@nuxt/ui` Form components via the `schema` prop.

### 3.5 Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.vue`, `ArticleCard.vue`)
- **Composables**: camelCase, prefixed with `use` (e.g., `useAuth.ts`, `useArticles.ts`)
- **Variables & Functions**: camelCase (e.g., `fetchUserData`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Files**:
  - Components: `PascalCase.vue`
  - Pages/Layouts: `kebab-case.vue`
  - Composables/Utils: `camelCase.ts`

### 3.6 Error Handling
- **API Requests**: Wrap API calls (`$fetch`, `useFetch`) in `try...catch` blocks.
- **User Feedback**: Use `@nuxt/ui` notifications/toasts for user-friendly error messages.
- **Fatal Errors**: Use Nuxt's `showError()` composable for critical failures (404s, auth failures).
- **Logging**: Log raw errors to `console.error` in development only; never expose sensitive backend stack traces to the UI.

### 3.7 State Management
- Prefer Nuxt's `useState` for simple shared state across the application (SSR-friendly).
- Use local `ref` or `reactive` within components for isolated UI state.
- Avoid large monolithic stores unless explicitly requested.

### 3.8 Imports Order
When manual imports are required, group them as follows (separated by blank lines):
1. Nuxt/Vue built-ins (if auto-import unavailable)
2. Third-party libraries (`valibot`, `date-fns`, etc.)
3. Internal utilities/composables (`~/utils/...`)
4. Internal types (`~/types/...`)

---

## 4. Before You Commit

- Run `pnpm lint` to ensure code quality and formatting.
- Run `pnpm typecheck` to catch TypeScript errors.
- Verify that changes align with the style guidelines above.
