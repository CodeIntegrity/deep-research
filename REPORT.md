# Deep Research 仓库结构概览与代码健康报告

生成时间：2025-10-21（UTC）
目标分支：deep-research-audit-structure-issues

本报告基于对仓库进行只读扫描得出，未对源码进行修改。若需复查，请参照文末给出的命令在本地执行。

---

## 1. 项目结构概览（深度≤3）

顶层结构与用途简述：

- .github/ — GitHub 配置与工作流（Docker 镜像发布、GHCR 发布、issue 翻译、fork 同步）
- docs/ — 部署/接口等文档
- public/ — 静态资源（logo、截图、第三方脚本 eruda 与 pdf.worker）
- src/ — 应用源码（Next.js App Router、API 路由、UI 组件、hooks、store、utils、MCP server 实现等）
- static/ — 静态目录（当前仅含一个名为“1”的占位文件，可能是遗留物）
- 配置与根文件 — next/tailwind/eslint/tsconfig/vercel/wrangler/docker 等配置，包管理文件（package.json、pnpm-lock.yaml）、README、LICENSE

目录树（节选，≤3 层）：

```
.
├─ .github/
│  ├─ ISSUE_TEMPLATE/
│  └─ workflows/                # Docker/GHCR 发布、issue 翻译、fork 同步
├─ docs/
│  ├─ How-to-deploy-to-Cloudflare-Pages.md
│  └─ deep-research-api-doc.md
├─ public/
│  ├─ logo.png | logo.svg
│  ├─ screenshots/
│  └─ scripts/                  # eruda.min.js, pdf.worker.min.mjs（供前端使用）
├─ src/
│  ├─ app/                      # Next.js App Router 目录
│  │  ├─ api/                   # 后端路由（LLM provider、search、crawler、SSE、MCP）
│  │  ├─ layout.tsx | page.tsx | globals.css | sw.ts | manifest.json | not-found.tsx
│  │  └─ ...
│  ├─ components/               # UI 组件（Setting、History、Research、MagicDown 等）
│  ├─ constants/                # 常量（urls、prompts、locales）
│  ├─ hooks/                    # 自定义 hooks（useDeepResearch / useKnowledge 等）
│  ├─ libs/mcp-server/          # MCP server 实现（streamable-http / sse 等）
│  ├─ locales/                  # i18n 文本（en-US.json / zh-CN.json / es-ES.json）
│  ├─ middleware.ts             # API 路由访问控制、中间件
│  ├─ store/                    # Zustand 状态管理模块（global/setting/task/...）
│  └─ utils/                    # 工具（deep-research 编排、parser、text/url 等）
├─ static/
│  └─ 1                         # 可疑占位文件（疑似遗留）
├─ Dockerfile | docker-compose.yml | vercel.json | wrangler.toml
├─ tailwind.config.ts | eslint.config.mjs | tsconfig.json | next.config.ts
├─ package.json | pnpm-lock.yaml | env.tpl
├─ README.md | LICENSE
└─ .gitignore | .dockerignore | .node-version
```

模块说明要点：
- src/app/api：按 provider 分组的代理/转发路由，统一由 src/middleware.ts 做鉴权/密钥注入与开关控制。
- src/components：前端 UI，包含较重的 Setting.tsx 与 MagicDown Markdown 渲染/编辑套件。
- src/libs/mcp-server：项目内置 MCP Server 协议栈，支持 streamable-http 与 SSE。
- src/utils/parser：文档解析工具（PDF/Office）。

---

## 2. 关键统计与发现概览

基础统计（排除 .git）：
- 文件总数：162
- 按扩展名计数（Top）：ts 73，tsx 51，json 9，yml 7，mjs 3，md 3，css 3，png 2，yaml 1，svg 1，其它若干
- 行数（按常见文本类型）：
  - ts 14210，tsx 8665，js 8，mjs 48，json 1224，css 313，md 805，yml 371，yaml 8636，toml 10
  - 主要语言占比（粗略按行统计，代码+配置合计约 34K 行）：
    - TypeScript/TSX ≈ 66–67%
    - YAML（含 pnpm-lock.yaml）≈ 25%
    - 其余（JSON/CSS/MD/JS/MJS）≈ 8–9%

体积与大文件：
- 最大目录（深度 1，apparent size）：public 1.5M、src 782K、pnpm-lock.yaml 292K
- 最大文件：
  - public/scripts/pdf.worker.min.mjs（1.03M，第三方 PDF worker）
  - public/scripts/eruda.min.js（0.45M，移动端调试工具）
  - pnpm-lock.yaml（0.29M，依赖锁）
  - src/components/Setting.tsx（0.15M，组件文件较大，建议拆分）
  - src/libs/mcp-server/*.ts（~44–46K，协议实现较重）

二进制/第三方制品与临时文件占比（估算）：
- 二进制/大制品：图片（png 2 个）、第三方压缩脚本（2 个）等，占比约 2–5%。
- 临时/可疑文件：static/1（疑似占位/遗留）。

注释与待办（TODO/FIXME/HACK/XXX）：
- src/utils/parser/officeParser.ts 存在 TODO（调试断言/健壮性注释）。
- public/scripts/pdf.worker.min.mjs（上游压缩产物，包含 XXX 标记，非本仓库维护）。
- 其余源码中未发现大量 TODO/FIXME 标记。

行尾与编码：
- 检测到部分 TypeScript 文件存在 CRLF 行尾（与其他 LF 混用），建议统一为 LF 并通过 .editorconfig/.gitattributes 约束。

安全/权限：
- 未发现带可执行权限的脚本文件（repo 内）。
- 中间件对 API 访问进行签名或密码校验（ACCESS_PASSWORD），逻辑清晰，但需确保部署时正确配置并避免泄漏日志。

孤立/可疑目录与文件：
- static/1：孤立占位文件，建议确认用途后移除。

---

## 3. 代码健康检查

自动探测到的语言与工具：
- JS/TS：
  - ESLint（eslint.config.mjs，基于 next/core-web-vitals + next/typescript）
  - TypeScript（tsconfig.json，strict: true, noEmit: true，paths 使用 @/* 别名）
  - 未检测到 Prettier 配置
- 其他语言：未检测到 Go/Rust/Python 项目结构或工具配置

尝试运行的工具与结果（本次仅记录预期命令，未实际执行）：
- 受限说明：当前环境未安装 node_modules，且工单要求不引入新依赖；因此未实际运行以下命令。
- 预期命令：
  - Lint：pnpm run lint（等价 next lint => eslint）
  - 类型检查：pnpm exec tsc --noEmit -p tsconfig.json
  - 格式化（若引入 Prettier 后）：pnpm exec prettier -c "**/*"
  - 依赖审计（若允许联网）：pnpm audit 或 npm audit
  - 循环依赖检查（推荐）：pnpm dlx madge --circular --extensions ts,tsx src

启发式检查与建议：
- 体量过大的组件：src/components/Setting.tsx ~154KB，建议按功能模块拆分（表单段/分组配置/异步逻辑拆离 hook）。
- 日志：多处 API route/middleware 有 console.* 输出（错误场景为主），建议：
  - 保留 error/warn，移除生产环境冗余 log 或使用条件编译/环境变量控制。
- 行尾不一致（CRLF/LF 混用）：统一为 LF；新增 .editorconfig/.gitattributes（见 Backlog）。
- parser 目录：office/pdf 解析逻辑较复杂，建议补充单元测试与示例用例；TODO 注释处可补充分支断言与异常路径测试。
- 循环依赖：未执行静态工具检测，建议使用 madge 检查。

---

## 4. 依赖与安全

- 包管理：pnpm（pnpm-lock.yaml 存在），Node engines: ">= 18.18.0"（.node-version 为 18.18.0）。
- 许可证：MIT（根 LICENSE）。
- 审计与升级：
  - 预期命令：
    - pnpm audit（或 npm audit）
    - pnpm outdated（查看过期依赖）
    - 如需安全数据库：OSV-Scanner（需额外安装），Snyk（SaaS）
  - 本次未联网、未安装依赖，未执行上述命令。
- 第三方前端制品：public/scripts/ 下的 eruda.min.js、pdf.worker.min.mjs 建议标注来源与版本，定期跟进升级（或采用 CDN 指定版本）。

---

## 5. 测试与 CI

- 单元/集成测试：未检测到测试框架配置（无 jest/vitest 配置，无 test 脚本），建议引入 Vitest + React Testing Library 覆盖关键逻辑与组件。
- 覆盖率：无现成配置，推荐 c8/istanbul。
- CI：.github/workflows/
  - docker.yml/ghcr.yml：仅在打 tag 时构建并推送镜像。
  - sync.yml：fork 同步计划任务。
  - issue-translator.yml：issue 翻译。
  - 建议新增：push/PR 触发的 Lint/TypeCheck/Build（不在本任务范围内修改 CI，仅提出建议）。

---

## 6. 规范与元信息

- 存在：README、LICENSE、.gitignore、Dockerfile、env.tpl、Vercel/CF 配置。
- 缺失/建议：
  - .editorconfig（行尾/缩进/编码统一）
  - .gitattributes（text eol=lf 归一化、锁定大文件 diff）
  - 代码规范/贡献文档（CONTRIBUTING.md、CODE_OF_CONDUCT.md、SECURITY.md）
  - Prettier 配置（与 ESLint 协同，格式化一致性）

---

## 7. 问题清单（按严重度）

critical：
- 行尾不一致（CRLF/LF 混用）
  - 路径：多处 src/**/*.ts*（样例：src/middleware.ts、src/store/*.ts、src/hooks/*.ts 等）
  - 影响：跨平台 diff/合并冲突、工具链（lint/format）不稳定。
  - 复现：grep -rIU --include='*.ts*' $'\r\n' src
  - 修复建议：新增 .editorconfig 与 .gitattributes，统一 LF；执行 git add --renormalize .；在 CI 中校验
  - 参考：EditorConfig, Git attributes eol

high：
- 大体积组件难以维护（Setting.tsx ~154KB）
  - 路径：src/components/Setting.tsx
  - 影响：认知负载高、变更风险高、测试困难。
  - 建议：按页面分区/表单段落拆分子组件；重逻辑下沉到 hooks；添加单元测试覆盖

- 缺少自动化质量门禁
  - 路径：CI 仅有发布流，无 push/PR lint/typecheck/build
  - 影响：回归风险、质量波动
  - 建议：新增 Lint + TypeCheck + Build 工作流；可选引入 pnpm audit --audit-level=high

medium：
- 缺少 Prettier 配置与统一格式化流程
  - 影响：格式差异与审阅成本
  - 建议：引入 Prettier（与 eslint-config-prettier 协同），CI 校验

- 解析器（pdf/office）复杂度较高且无测试
  - 路径：src/utils/parser/
  - 影响：边界错误不易发现，TODO 未闭环
  - 建议：Vitest 单元测试覆盖常见/异常路径，添加示例样本

- 第三方前端制品版本管理
  - 路径：public/scripts/
  - 影响：安全/升级不可见
  - 建议：增加来源与版本注释/README，或使用 CDN 固定版本

low：
- 孤立文件/疑似遗留
  - 路径：static/1
  - 建议：确认用途后移除或补充 README 说明

- 多处 console 日志
  - 路径：多个 API route 与 middleware
  - 建议：生产仅保留必要 error/warn，或引入轻量日志库分级

---

## 8. 自动工具的运行命令与版本（计划/记录）

- Node/包管理：
  - Node 要求：>= 18.18.0（.node-version: 18.18.0）
  - 包管理：pnpm（pnpm-lock.yaml 存在）
- Lint（未执行）：
  - pnpm run lint
- TypeCheck（未执行）：
  - pnpm exec tsc --noEmit -p tsconfig.json
- 格式化（需引入 Prettier 后）：
  - pnpm exec prettier -c "**/*"
- 依赖安全（未执行）：
  - pnpm audit / npm audit
  - OSV-Scanner（需单独安装）
- 循环依赖（未执行，建议）：
  - pnpm dlx madge --circular --extensions ts,tsx src

未执行原因：当前只读分析且未安装依赖/不引入新依赖；如需落地，请在开发环境执行上述命令。

---

## 9. 附录：统计输出（节选）

- 最大文件（Top 10）：
```
1032428  ./public/scripts/pdf.worker.min.mjs
474767   ./public/scripts/eruda.min.js
298608   ./pnpm-lock.yaml
153931   ./src/components/Setting.tsx
46935    ./src/libs/mcp-server/mcp.ts
45947    ./src/libs/mcp-server/streamableHttp.ts
44171    ./src/libs/mcp-server/types.ts
30694    ./src/utils/parser/officeParser.ts
23011    ./src/middleware.ts
20765    ./public/screenshots/main-interface.png
```

- 目录体积（深度 1）：
```
public 1.5M
src    782K
pnpm-lock.yaml 292K
```

- 行数（按扩展名）：
```
ts  14210
tsx 8665
js  8
mjs 48
json 1224
css 313
md  805
yml 371
yaml 8636
toml 10
```

- CRLF 检测样例（文本类）：
```
src/types.d.ts
src/middleware.ts
src/store/global.ts
src/store/setting.ts
src/store/task.ts
src/store/knowledge.ts
src/store/history.ts
src/hooks/useWebSearch.ts
src/hooks/useModelList.ts
src/hooks/useMobile.ts
```

- TODO/FIXME/HACK/XXX 摘要：
```
src/utils/parser/officeParser.ts  # TODO: Add debug asserts ...
public/scripts/pdf.worker.min.mjs # 上游产物，含 XXX（非本仓维护）
```

---

如需我基于本报告继续提交修复 PR，请参考 BACKLOG.md 的任务拆解与优先级建议。
