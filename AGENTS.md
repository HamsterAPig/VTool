# Repository Guidelines

## Task Execution Rules

以下内容同步自 `RULES.md`，作为本仓库每次任务都必须遵守的执行规则。

### 第一部分：规则 AI

> AI 在编码过程中应自主执行的规则

### 一、核心原则

1. AI 输出是候选稿，不是定稿。所有生成代码必须经过审阅才能进入主干。
2. 概念完整性高于局部聪明。目标、术语、边界、约束必须在多轮迭代中保持一致。
3. 效率 = 单位时间增加的确定性，不是单位时间产出的代码量。
4. 绝不接受"先这样吧，后面再改"作为合并理由。

### 二、代码结构约束

#### 2.1 职责原子化

- 每个函数/模块只对应一个主要任务，职责可以一句话说清。
- 状态推进留在纯逻辑层，渲染层只负责输出，输入层只负责收集事件。
- 禁止"上帝对象"：不要在一次生成中把业务逻辑、交互、架构、异常处理揉在一起。

#### 2.2 接口先于实现

- 先定义模块契约（接收什么、返回什么、何时失败、失败暴露什么），再生成实现。
- 新代码必须在既有架构中有明确位置，遵循既有边界与接口习惯。
- 禁止在 controller/路由层写业务规则。

#### 2.3 机制与策略分离

- 机制层（系统如何做事）保持中立、可复用。
- 策略层（在什么条件下做事）放到配置或策略模块中。
- 权限分级、审批条件、频率限制、优先级等不得写死在机制实现里。

### 三、复杂性预算（AI 自查四项底线）

生成代码时自行检查，不通过则重写后再输出：

1. 可读性：维护者能否在短时间内说清意图、输入输出和关键路径？不能则重写。
2. 职责边界：是否存在跨层堆叠、单点承载多类变化来源？有则拆分。
3. 重复控制：同一规则是否分散在多处？重复即预算泄漏，必须收敛为单一事实来源。
4. 架构服从：新代码在现有结构中是否有明确位置？局部写得顺不能成为偏离主线的理由。

### 四、禁止项（AI 生成代码时不得触犯）

- 跨层级职责混写
- 重复逻辑扩散（同一规则出现多个不完全一致的版本）
- 隐藏副作用
- 关键路径不附带测试
- 未说明必要性的新依赖引入
- 破坏现有接口契约且无迁移路径
- 使用魔法数字或未声明的隐式约定

### 五、AI 输出行为规范

- 所有输出视为候选稿，非定稿。主动标注不确定之处。
- 需求含糊时，先提出澄清问题，不直接生成代码。
- 按固定顺序产出（先模块划分 → 再核心代码 → 再测试边界），不一次性倾倒全部实现。
- 维护项目术语、命名、边界在多轮迭代中的一致性。
- 概念完整性高于局部聪明。

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

Use `Gitmoji + Conventional Commits + 中文描述`, and write the emoji in code form, for example `:sparkles: feat: 新增首页布局` or `:bug: fix: 修复表格空状态显示异常`.

Branch workflow for every new task:

- Always create a new working branch before implementation.
- Prefer branching from `develop`.
- If `develop` does not exist, branch from `main`.
- If neither `develop` nor `main` exists, branch from `master`.
- The agent should auto-detect which base branch is available in that order and create the task branch from the first match.

Commit workflow:

- Do not leave completed work uncommitted.
- After implementation and verification are complete, automatically create commit(s) without waiting for an extra user prompt.
- Commit messages should keep the Gitmoji portion in `:emoji:` text form instead of a literal emoji character.
- Commit granularity should be judged automatically based on logical change boundaries:
  - use a single commit for a small, cohesive task;
  - split into multiple commits when there are clearly separate concerns such as refactor + feature, feature + tests, or independent fixes.
- Avoid mixing unrelated changes into one commit.
- If pull requests are introduced later, include a short summary, linked issue if available, test notes, and screenshots for UI changes.

## Configuration Notes

Do not commit secrets. Keep local-only values in `.env.local` and commit a sanitized `.env.example` when environment variables are introduced.
