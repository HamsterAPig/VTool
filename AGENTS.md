# Repository Guidelines

## Project Structure & Module Organization
This project should be scaffolded as a Vue 3 app with Vite, TypeScript, Pinia, Vue Router, and either Naive UI or Element Plus. Keep the root for `package.json`, lockfiles, Vite config, and this guide. Place app code in `src/`, static files in `public/`, and shared tests in `tests/`. Prefer feature folders such as `src/features/<feature-name>/`, with shared code in `src/components/`, `src/stores/`, and `src/router/`.

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
AGENTS.md
```

## Build, Test, and Development Commands
Expose standard Vite scripts through `package.json` and keep them stable:

- `npm install`: install dependencies.
- `npm run dev`: start the Vite development server.
- `npm run build`: run `vue-tsc` and create a production build.
- `npm run preview`: preview the production build locally.
- `npm run test`: run the test suite.
- `npm run lint`: run ESLint and formatting checks.

Document any new required command in `package.json` and keep this file aligned.

## Coding Style & Naming Conventions
Use UTF-8 text files and 2-space indentation. Prefer Vue SFCs with `<script setup lang="ts">`. Use `PascalCase` for components, `camelCase` for functions and composables, and `kebab-case` for folders and route-style files. Standardize on `Prettier`, `ESLint`, and the TypeScript compiler.

Keep code easy to read: functions should stay short, focused, and avoid deep nesting, hidden side effects, and cross-layer state coupling. Split complex branches into composables, utils, or store actions instead of piling logic into a component. Enforce low cyclomatic complexity; `complexity <= 10` is the default target if lint rules are added.

## Testing Guidelines
Add tests with each feature. Use `*.test.ts` or `*.spec.ts` consistently. Keep unit tests in `tests/unit/` or next to the module, and place browser flows in `tests/e2e/`. Any bug fix should include a regression test where practical.

## Commit & Pull Request Guidelines
Use `Gitmoji + Conventional Commits + 中文描述`, for example `✨ feat: 新增首页布局` or `🐛 fix: 修复表格空状态显示异常`. Default workflow is to commit directly on `master`; do not create a new feature branch unless a later task explicitly asks for one. If pull requests are introduced later, include a short summary, linked issue if available, test notes, and screenshots for UI changes.

## Configuration Notes
Do not commit secrets. Keep local-only values in `.env.local` and commit a sanitized `.env.example` when environment variables are introduced.
