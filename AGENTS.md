# Repository Guidelines

## Project Structure & Module Organization

This project uses `Vue 3 + Vite + TypeScript + Pinia + Vue Router` with `pnpm` as the package manager. Keep app code in `src/`, static files in `public/`, and tests in `tests/`. Prefer feature folders such as `src/features/<feature-name>/`, with shared code in `src/components/`, `src/router/`, `src/stores/`, and `src/styles/`.

Example layout:

```text
src/
  components/
  features/
  router/
  stores/
tests/
public/
package.json
pnpm-lock.yaml
AGENTS.md
```

## Build, Test, and Development Commands

Use `pnpm` consistently:

- `pnpm install`: install dependencies.
- `pnpm dev`: start the Vite development server.
- `pnpm build`: run `vue-tsc` and create a production build.
- `pnpm preview`: preview the production build locally.
- `pnpm test`: run Vitest with coverage.
- `pnpm lint`: run ESLint and Prettier checks.

Keep `package.json` scripts and this guide aligned.

## UI & Visual Direction

Default style is `浅色光晕科技感`: bright background, soft gradients, glass-like cards, large radius, clear whitespace, and restrained motion. The site should feel like a curated tool product, not a generic admin template. Prefer custom UI primitives over heavy component-library defaults, and reuse shared design tokens from `src/styles/`.

## Coding Style & Naming Conventions

Use UTF-8 text files and 2-space indentation. Prefer Vue SFCs with `<script setup lang="ts">`. Use `PascalCase` for components, `camelCase` for functions and composables, and `kebab-case` for folders and route-style files. Standardize on `Prettier`, `ESLint`, and the TypeScript compiler.

Keep code easy to read: functions should stay short, focused, and avoid deep nesting, hidden side effects, and cross-layer state coupling. Split complex branches into composables, utils, or store actions instead of piling logic into a component. Enforce low cyclomatic complexity; `complexity <= 10` is the default target if lint rules are added.

## Testing Guidelines

Add tests with each feature. Use `*.test.ts` or `*.spec.ts` consistently. Keep unit and component tests in `tests/`. Any bug fix should include a regression test where practical.

## Commit & Pull Request Guidelines

Use `Gitmoji + Conventional Commits + 中文描述`, for example `✨ feat: 新增首页布局` or `🐛 fix: 修复表格空状态显示异常`. Default workflow is to commit directly on `master`; do not create a new feature branch unless a later task explicitly asks for one. If pull requests are introduced later, include a short summary, linked issue if available, test notes, and screenshots for UI changes.

## Configuration Notes

Do not commit secrets. Keep local-only values in `.env.local` and commit a sanitized `.env.example` when environment variables are introduced.
