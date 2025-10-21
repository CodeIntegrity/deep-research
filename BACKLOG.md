# Deep Research 修复任务清单（Backlog）

本清单基于最新 REPORT.md 的问题与建议，按优先级与依赖关系拆解为可执行任务。建议在新分支逐步提交，并尽快引入基础质量门禁（Lint/TypeCheck/Build）。

最新基线：main@ad2f643（2025-10-21）

---

## P0（Critical / High）

1) 建立基础质量门禁（CI）
- 依赖：安装依赖
- 步骤（示例）：
  - Lint：`pnpm run lint`
  - TypeCheck：`pnpm exec tsc --noEmit -p tsconfig.json`
  - Build：`pnpm build`
  - 触发：push/PR；建议在 PR 上阻断合并

2) 依赖安全补丁升级（Next.js / Mermaid 等）
- 依赖：无（常规升级）
- 背景：`pnpm audit --prod` 显示 moderate 6，其中包括：
  - Next.js（CVE-2025-57752、CVE-2025-57822）
  - Mermaid（CVE-2025-54880）
- 步骤：
  - 将 `next` 升级到 `>= 15.4.7`（建议最新 15.5.x）
  - 将 `mermaid` 升级到 `>= 11.10.0`（建议 11.12.x）
  - 验证构建与运行，关注中间件/图片优化相关配置
- 产出：升级 PR + 变更日志

3) 拆分超大组件 Setting.tsx
- 依赖：无
- 步骤：
  - 以“配置分组/表单区域/异步逻辑”维度划分子组件
  - 抽离通用表单/校验到 hooks 与 schema（可选 zod）
  - 添加基本单元测试（见 P1）
- 预估：M（2–3 人日）

---

## P1（Medium）

4) 引入 Prettier 与格式化工作流
- 依赖：无
- 步骤：
  - `devDependencies` 增加 `prettier`、`eslint-config-prettier`
  - 新增 `.prettierrc`（printWidth, singleQuote, semi 等团队约定）
  - npm script：`format`（`prettier --write .`），在 CI 中 `prettier -c`
- 预估：S（0.5 人日）

5) 为 parser 与关键逻辑补齐单元测试
- 依赖：测试框架
- 步骤：
  - 引入 Vitest + @testing-library/react
  - 覆盖 `src/utils/parser/{pdfParser,officeParser}.ts`、`src/utils/deep-research/*`、`src/utils/text.ts`
  - 新增脚本：`test`、`test:coverage`；CI 产出覆盖率（c8）
- 预估：M（3–4 人日，含样本构造）

6) 通过 ai 间接引入的 jsondiffpatch XSS 风险治理
- 依赖：依赖分析
- 背景：审计路径 `.>ai>jsondiffpatch` 版本 0.6.0（<0.7.2 存在 XSS）
- 方案（其一）：将 `jsondiffpatch` 锁定到 `>=0.7.2`
- 方案（其二）：升级 `ai` 至 5.x（或最新）并验证功能
- 预估：S–M（1–2 人日）

7) 第三方前端制品版本管理与说明
- 依赖：无
- 步骤：
  - 在 `public/scripts/` 增加 README 或在源码处标注来源、版本与升级方式
  - 可评估使用 CDN（带 `integrity`）替代仓库内置文件
- 预估：S（0.5 人日）

8) 生产日志分级与清理
- 依赖：无
- 步骤：
  - 审视 `console.*` 的使用：仅保留 error/warn，debug/info 受 `NODE_ENV` 或配置开关控制
  - 可引入轻量日志封装（如 `debug`、自定义 logger）
- 预估：S（0.5–1 人日）

---

## P2（Low）

9) 清理孤立/遗留文件
- 依赖：确认用途
- 步骤：
  - 确认 `static/1` 用途；若无用则删除或替换为说明性 README
- 预估：XS（<0.5 人日）

10) 项目元信息与贡献文档
- 依赖：无
- 步骤：
  - 新增 `CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`
  - 在 README 链接贡献指南与发布流程
- 预估：S（0.5–1 人日）

11) 循环依赖与 bundle 健康检查（建议）
- 依赖：安装工具
- 步骤：
  - `pnpm dlx madge --circular --extensions ts,tsx src`，修复潜在环依赖
  - 引入 `@next/bundle-analyzer` 或类似工具评估页面体积（尤其 Setting 等页面）
- 预估：S（0.5–1 人日）

---

## 里程碑与批处理建议

- 里程碑 A（质量门禁）：P0.1 + P1.4 → 落地 Lint/TypeCheck/Build/Format 校验
- 里程碑 B（安全与供应链）：P0.2 + P1.6 + 依赖审计 → 升级 next/mermaid/ai 及传递依赖
- 里程碑 C（可维护性）：P0.3 + P2.11 → 组件拆分 + 依赖结构体检
- 里程碑 D（文档与规范）：P2.9 + P2.10 → 清理遗留 + 贡献与安全文档

批处理修复建议：
- 安全升级集中提交一组“依赖升级”PR（next/mermaid/ai 等），验证构建、跑通关键页面与 API。
- 统一提交一组“格式化规范”改动（引入 Prettier + 一次性格式化），减少后续 PR 的 diff 噪音。
- 组件拆分与测试可以分 PR 推进，优先针对 Setting 与 parser 目录，确保功能不变的前提下提高可维护性。

---

## 已关闭/降级的条目（相较上次报告）

- 统一行尾为 LF，建立跨平台规范 — 未复现 CRLF，降级为建议项（仍建议添加 .editorconfig/.gitattributes 以防回归）。

---

## 参考命令清单（在本地执行）

- 统计/结构（示例）：
  - Largest files: `find . -type f -not -path './.git/*' -not -path './node_modules/*' -printf '%s\t%p\n' | sort -nr | head -n 10`
  - Lines by ext: `for e in ts tsx js mjs json css md yml yaml toml; do find . -type f -not -path './.git/*' -not -path './node_modules/*' -name "*.$e" -print0 | xargs -0 -r wc -l | tail -n1; done`
- 质量：
  - Lint：`pnpm run lint`
  - TypeCheck：`pnpm exec tsc --noEmit -p tsconfig.json`
  - Format（引入 Prettier 后）：`pnpm exec prettier -c "**/*"`
- 安全：
  - 审计：`pnpm audit --prod` / `npm audit`
  - OSV-Scanner：`osv-scanner --recursive .`
- 循环依赖：
  - `pnpm dlx madge --circular --extensions ts,tsx src`
