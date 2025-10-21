# Deep Research 修复任务清单（Backlog）

本清单基于 REPORT.md 的问题与建议，按优先级与依赖关系拆解为可执行任务。建议在新分支逐步提交并引入基础质量门禁（Lint/TypeCheck/Build）。

---

## P0（Critical / High）

1) 统一行尾为 LF，建立跨平台规范
- 依赖：无
- 步骤：
  - 新增 `.editorconfig`（root=true; [*] end_of_line=lf, charset=utf-8, indent_style=space, indent_size=2 等）
  - 新增 `.gitattributes`（`* text=auto eol=lf`，对二进制/大文件禁用 diff）
  - 执行 `git add --renormalize .`，提交规范化
  - 在 CI 增加校验：`pnpm exec prettier -c`（引入 Prettier 后）或使用 `eclint` 之类工具

2) 建立基础质量门禁（CI）
- 依赖：安装依赖
- 步骤（示例）：
  - Lint：`pnpm run lint`
  - TypeCheck：`pnpm exec tsc --noEmit -p tsconfig.json`
  - Build：`pnpm build`
  - 触发：push/PR

3) 拆分超大组件 Setting.tsx
- 依赖：无
- 步骤：
  - 以“配置分组/表单区域/异步逻辑”维度划分子组件
  - 抽离通用表单/校验到 hooks 与 schema（可选 zod）
  - 添加基本单元测试（见 P1）

---

## P1（Medium）

4) 引入 Prettier 与格式化工作流
- 依赖：P0.1 完成后更佳
- 步骤：
  - `devDependencies` 增加 `prettier`、`eslint-config-prettier`
  - 新增 `.prettierrc`（printWidth, singleQuote, semi 等团队约定）
  - npm script：`format`（`prettier --write .`），在 CI 中 `prettier -c`

5) 为 parser 与关键逻辑补齐单元测试
- 依赖：测试框架
- 步骤：
  - 引入 Vitest + @testing-library/react
  - 对 `src/utils/parser/{pdfParser,officeParser}.ts`、`src/utils/deep-research/*`、`src/utils/text.ts` 编写单测
  - 新增脚本：`test`、`test:coverage`；CI 产出覆盖率（c8）

6) 第三方前端制品版本管理与说明
- 依赖：无
- 步骤：
  - 在 `public/scripts/` 增加 README 或在源码处标注来源、版本与升级方式
  - 可评估使用 CDN（带有 `integrity`）替代仓库内置文件

7) 生产日志分级与清理
- 依赖：无
- 步骤：
  - 审视 `console.*` 的使用：仅保留 error/warn，debug/info 受 `NODE_ENV` 或配置开关控制
  - 可引入轻量日志封装（如 `debug`、自定义 logger）

---

## P2（Low）

8) 清理孤立/遗留文件
- 依赖：确认用途
- 步骤：
  - 确认 `static/1` 用途；若无用则删除或替换为说明性 README

9) 项目元信息与贡献文档
- 依赖：无
- 步骤：
  - 新增 `CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`
  - 在 README 链接贡献指南与发布流程

10) 循环依赖与 bundle 健康检查（建议）
- 依赖：安装工具
- 步骤：
  - `pnpm dlx madge --circular --extensions ts,tsx src`，修复潜在环依赖
  - 引入 `@next/bundle-analyzer` 或类似工具评估页面体积（尤其 Setting 等页面）

---

## 里程碑与批处理建议

- 里程碑 A（规范化）：P0.1 + P1.4 → 落地行尾/格式化规范与校验
- 里程碑 B（质量门禁）：P0.2 + P1.5 → Lint/TypeCheck/Build/Test/覆盖率
- 里程碑 C（可维护性）：P0.3 + P2.10 → 组件拆分 + 依赖结构体检
- 里程碑 D（安全与供应链）：P1.6 + 依赖审计 → pnpm audit/OSV 扫描 + 版本升级策略

批处理修复建议：
- 统一提交一组“规范落地”改动（.editorconfig/.gitattributes/Prettier + 一次性格式化/行尾归一化），减少后续 PR 的 diff 噪音。
- 组件拆分与测试可以分 PR 推进，优先针对 Setting 与 parser 目录，确保功能不变的前提下提高可维护性。

---

## 参考命令清单（在本地执行）

- 统计/结构（示例）：
  - Largest files: `find . -type f -not -path './.git/*' -printf '%s\t%p\n' | sort -nr | head -n 10`
  - Lines by ext: `for e in ts tsx js mjs json css md yml yaml toml; do find . -type f -name "*.$e" -print0 | xargs -0 -r wc -l | tail -n1; done`
- 质量：
  - Lint：`pnpm run lint`
  - TypeCheck：`pnpm exec tsc --noEmit -p tsconfig.json`
  - Format（引入 Prettier 后）：`pnpm exec prettier -c "**/*"`
- 安全：
  - 审计：`pnpm audit` / `npm audit`
  - OSV-Scanner：`osv-scanner --recursive .`
- 循环依赖：
  - `pnpm dlx madge --circular --extensions ts,tsx src`
