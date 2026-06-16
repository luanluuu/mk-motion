# @luanlu/mk-motion v2.0.13 改造计划

> 目标：把 mk-motion 从「基础可用」提升到「生产级可用」。外部 Vue 3 项目引入后，不需要写 CSS 补丁，不需要猜测 API 语义。
> 基准版本：`2.0.12`（已发布）
> 计划日期：2026-06-14

---

## 1. 现状审计

| 维度 | 现状 | 风险/缺口 |
|------|------|----------|
| 版本与发版 | npm 最新为 `2.0.12`，但 `CHANGELOG.md` 没有 `[2.0.12]` 条目；顶部 `[Unreleased]` 实际包含已发布内容 | 发版历史不可追溯，CI 可能发布未记录变更 |
| Collapse | `MkCollapse.vue` 只支持 `items` prop，没有 `<MkCollapseItem>` 子组件，`name` 非必填概念 | API 不直观，难以做受控/手风琴模式 |
| Input | 仅支持原生 `<input>`，无 `type="textarea"`、`rows`、`autosize` | 表单基础能力缺失 |
| 键盘与 ARIA | Select/Tabs 键盘导航不完整；Dialog 缺少焦点陷阱；Collapse 缺少 `aria-controls` 等关联属性 | 可访问性不达标 |
| 文档 | 文档站 `component-docs.ts` 仍以 legacy imperative API 示例为主；`MkCollapse` 未在侧边栏列出 | 用户难以找到 Vue 组件用法 |
| TypeScript | 部分组件 Props 类型未统一导出；dev 模式缺少 prop 错误提示 | 类型不精确、错误用法无反馈 |

---

## 2. 版本号处理规则

- `v2.0.12`：已发布，CHANGELOG 遗漏，需要 **retroactive 补录**。
- `v2.0.13`：本期新改动的目标版本。
- 工作过程中所有新改动先写入 `[Unreleased]`。
- 循环 8 收尾时再把 `[Unreleased]` 正式命名为 `[2.0.13]` 并补充日期。
- **不手动修改 `package.json` 版本号**：CI 会在 `main` push 后自动 `npm version patch`。最终发布时，CHANGELOG 中必须存在 `[2.0.13]` 条目，新增的 `changelog:check` 脚本会阻止未写 CHANGELOG 的发布。

---

## 3. Must 项实施方案

### 循环 2：CHANGELOG 补漏与发版流程

**目标**

- 补录 `v2.0.12` 的 CHANGELOG 条目（retroactive）。
- 将本期新改动写入 `[Unreleased]`。
- 增加发布前校验脚本：检查 `package.json` 的版本号在 CHANGELOG 中有对应条目。
- 建立发布 checklist（`RELEASE.md`）。

**改动文件**

| 文件 | 说明 |
|------|------|
| `CHANGELOG.md` | 新增 `[2.0.12]` 条目；保留 `[Unreleased]` 用于记录后续循环改动 |
| `package.json` | 新增 `changelog:check` npm script |
| `scripts/check-changelog.cjs` | 读取 `package.json` 版本，正则匹配 `CHANGELOG.md` 中对应 `[x.y.z]` 标题 |
| `RELEASE.md` | 发布 checklist：version bump → CHANGELOG → git tag → npm publish |

**测试/验证方案**

- `npm run changelog:check` 在补录后通过。
- 临时移除 `[2.0.12]` 条目，脚本应返回非零退出码。
- `npm run typecheck`、`npm run test`、`npm run build` 全部通过。

**预期风险**

- 风险：本地版本号已是 `2.0.12`，但 CI 仍会再次 patch bump。  
  缓解：循环 8 之前不手动改版本；最终 `[2.0.13]` 条目由脚本在发布时匹配 CI bump 后的版本。

---

### 循环 3：重构 MkCollapse API

**目标**

- `v-model` 类型明确为 `(string | number)[]`。
- 新增 `accordion` prop（已存在，需保留并确保行为正确）。
- 新增 `<MkCollapseItem>` 子组件，`name` prop 必填；未传时在 dev 模式 warning。
- 未绑定 `v-model` 时默认全部收起。
- 保留 `items` prop 旧用法，触发 deprecation warning。
- 文档站新增：基础用法、accordion 模式、受控模式三个示例。

**改动文件**

| 文件 | 说明 |
|------|------|
| `src/components-vue/MkCollapseItem.vue` | 新增；接收 `name`（必填）、`title`、`disabled`；通过注入注册到父级 |
| `src/components-vue/collapse-context.ts` | 新增 InjectionKey / CollapseItemInfo / CollapseContext，参考 `tabs-context.ts` |
| `src/components-vue/MkCollapse.vue` | 重构：支持 `items` prop（渲染内部 MkCollapseItem）和默认 slot（外部 MkCollapseItem）；`accordion` 逻辑复用；默认 model 为空数组；旧 `items` 用法打印 deprecation warning |
| `src/components-vue/types.ts` | 导出 `CollapseProps`、`CollapseItemProps`、`CollapseEmits` |
| `src/components-vue/index.ts` | 导出 `MkCollapseItem` 与类型 |
| `src/vite/resolver.ts` | `ALL_COMPONENTS` 增加 `MkCollapseItem` |
| `src/nuxt/module.ts` | `ALL_COMPONENTS` 增加 `CollapseItem` |
| `src/__tests__/components/MkCollapse.test.ts` | 新增：items 渲染、accordion、MkCollapseItem 子组件、缺失 name warning、受控 v-model |
| `docs/src/data/component-docs.ts` | 重写 `collapse` 文档为 Vue 组件示例（基础/accordion/受控） |
| `docs/src/data/nav.ts` | 新增 `component-collapse` 侧边栏入口（如缺失） |
| `demo-vue/src/App.vue` | 新增 Collapse 演示卡片 |

**测试/验证方案**

- `MkCollapse.test.ts` 覆盖：
  - `items` prop 渲染与点击展开
  - `accordion` 模式下同时只能展开一个
  - `<MkCollapseItem>` 子组件模式渲染与 v-model
  - 未传 `name` 时 dev 模式 warning
  - 未绑定 v-model 时全部收起
- `npm run test`、`npm run typecheck`、`npm run build` 通过。

**预期风险**

- 内部渲染从 `items` map 改为 context 注册，可能影响 SSR（需在 `onMounted` 注册或确保 `renderToString` 能输出）。  
  缓解：注册逻辑放在 setup 同步阶段（如 `computed` + `provide`），SSR 测试兜底。
- `items` prop 的 scoped slots `#title` / `#content` 需要继续支持。  
  缓解：内部渲染 MkCollapseItem 时，把 scoped slot props 透传。

---

### 循环 4：MkInput 支持 textarea

**目标**

- 支持 `type="textarea"`。
- 支持 `rows` prop。
- 支持 `autosize` prop（`{ minRows?: number, maxRows?: number }`）。
- 样式与现有 input 保持一致。
- 文档站新增 textarea 示例。

**改动文件**

| 文件 | 说明 |
|------|------|
| `src/components-vue/MkInput.vue` | `inputType` 改为 `isTextarea`；渲染 `<textarea>` 时应用 `rows` 和 autosize 高度；`showPassword` 对 textarea 不生效 |
| `src/components-vue/types.ts` | 新增/完善 `InputProps` 类型 |
| `src/__tests__/components/MkInput.test.ts` | 新增：textarea 渲染、rows、autosize 高度变化、emit |
| `docs/src/data/component-docs.ts` | 新增 `input` 的 textarea 示例 |
| `demo-vue/src/App.vue` | 新增 textarea 演示 |

**测试/验证方案**

- textarea 渲染为 `<textarea class="mk-input mk-input--textarea">`。
- `rows="4"` 设置原生 `rows` 属性。
- `autosize` 在输入时根据 `scrollHeight` 调整，且受 min/max 约束。
- `npm run test`、`typecheck`、`build` 通过。

**预期风险**

- `autosize` 需要浏览器 `scrollHeight`，SSR 时不能访问。  
  缓解：仅在 `onMounted` / `onUpdated` 中计算，SSR 测试仅验证静态 `rows`。
- 现有 `.mk-input` 样式针对 `<input>` 的 `height`；textarea 需要 `min-height` 与 `resize: vertical`。  
  缓解：增加 `.mk-input--textarea` 修饰类，覆盖不合适样式。

---

### 循环 5：核心组件键盘导航与 ARIA

**目标**

- `MkSelect`：↑↓ 选择、Enter 确认、Esc 关闭；补全 `aria-activedescendant`、`aria-selected`。
- `MkTabs`：←→ 切换 focus、Enter/Space 激活；补全 `aria-controls`、`aria-labelledby`。
- `MkCollapse`：Enter/Space 展开收起（已支持），补全 `aria-controls`。
- `MkDialog`：Tab 聚焦捕获、Esc 关闭（Esc 已支持）。
- 补全 `role`、`aria-expanded`、`aria-selected`、`aria-controls` 等属性。

**改动文件**

| 文件 | 说明 |
|------|------|
| `src/components-vue/MkSelect.vue` | 增加 `activeIndex` 状态；ArrowUp/ArrowDown 移动高亮；Enter 选中高亮项；Esc 关闭；为 trigger 和 option 添加 `id` / `aria-activedescendant` |
| `src/components-vue/MkTabs.vue` | header 监听键盘事件（←→ Home End、Enter/Space）；维护 `tabIds` / `panelIds`；为 tab 和 panel 添加 `aria-controls` / `aria-labelledby` |
| `src/components-vue/MkTabPane.vue` | 接收 panel id，设置 `aria-labelledby` |
| `src/components-vue/MkCollapse.vue` / `MkCollapseItem.vue` | 为 header 和 content 生成唯一 id，设置 `aria-controls` |
| `src/components-vue/MkDialog.vue` | 增加焦点陷阱：打开时聚焦第一个可聚焦元素，Tab 循环，Shift+Tab 反向 |
| `src/a11y/focus-trap.ts` | 新增可复用焦点陷阱 helper（query focusable、Tab 循环） |
| `src/__tests__/components/MkSelect.test.ts` | 新增键盘导航测试 |
| `src/__tests__/components/MkTabs.test.ts` | 新增键盘导航测试 |
| `src/__tests__/components/MkCollapse.test.ts` | 新增键盘/ARIA 测试 |
| `src/__tests__/components/MkDialog.test.ts` | 新增焦点陷阱与 Esc 测试 |

**测试/验证方案**

- Select：ArrowDown 打开并高亮第一项；ArrowUp 上移；Enter 更新 modelValue 并关闭；Esc 关闭。
- Tabs：ArrowRight 移动 focus 到下一个 tab 并激活；Enter/Space 激活。
- Collapse：header 聚焦后 Enter/Space 切换；`aria-expanded` 同步。
- Dialog：Tab 在内部可聚焦元素间循环；Esc 关闭。
- `npm run test`、`typecheck`、`build` 通过。

**预期风险**

- jsdom 的 focus/tab 顺序与真实浏览器有差异，部分测试需手动 dispatch `focus`/`keydown`。  
  缓解：测试不依赖浏览器默认 tab 顺序，直接调用组件暴露逻辑或触发 keydown。
- 新增 focus trap 可能影响 Dialog 现有测试（如 overlay 渲染）。  
  缓解：用 `nextTick` 等待打开后 DOM 更新再断言。

---

### 循环 6：补齐核心文档

**目标**

每个核心组件有完整文档页：

- `MkSelect`
- `MkTabs`
- `MkCollapse`
- `MkInput`

每页包含：基础用法、Props/Events/Slots 表格、状态示例、主题切换预览（文档站已有主题切换，组件自动继承）。

**改动文件**

| 文件 | 说明 |
|------|------|
| `docs/src/views/ComponentDoc.vue` | 跟踪每个 demo 挂载的 Vue `App`，在路由切换/组件更新前 `unmount`，防止内存泄漏 |
| `docs/src/data/component-docs.ts` | 重写 `select`、`tabs`、`collapse`、`input` 为 Vue 组件示例；补充 Props/Events/Slots API 表格 |
| `docs/src/data/nav.ts` | 确保 `component-collapse` 在侧边栏存在 |
| `docs/package.json` 或 `vite.config.ts` | 如需要，确保 `@luanlu/mk-motion` file 链接可解析 |

**测试/验证方案**

- `npm run build`（主库）后，`npm run build:docs` 通过。
- 手动预览各文档页渲染正常，无控制台报错。

**预期风险**

- `ComponentDoc.vue` 中 `demo.init(el)` 用 `createApp` 渲染 Vue 组件，需要显式 `unmount`。  
  缓解：在 `renderDemos` 前清理旧实例。
- 文档站使用生产构建的 `dist`，若主库未构建会先失败。  
  缓解：循环 6 验证时先 `npm run build`。

---

### 循环 7：TypeScript 类型与 Dev Warning

**目标**

- 核心组件导出 `Props` / `Emits` / `Slots` 类型。
- `v-model` 类型根据组件语义精确化。
- dev 模式下错误 prop 类型/必填项缺失给出 warning。
- `MkCollapseItem` 缺少 `name` 时 warning。
- `MkSelect` 同时传 `options` 和 `<MkOption>` 混用时 warning。

**改动文件**

| 文件 | 说明 |
|------|------|
| `src/components-vue/types.ts` | 补充 `InputProps`、`SelectProps`、`SelectEmits`、`SelectSlots`、`TabsProps`、`TabsEmits`、`TabsSlots`、`CollapseProps`、`CollapseEmits`、`CollapseItemProps`、`CollapseItemSlots`、`DialogProps`、`DialogEmits`、`DialogSlots` 等 |
| `src/components-vue/index.ts` | 统一 `export type` 上述类型 |
| `src/components-vue/MkCollapseItem.vue` | dev 模式检查 `name`，缺失时 `console.warn` |
| `src/components-vue/MkSelect.vue` | 修正现有 `options` 类型警告；新增混用 warning；使用 `import.meta.env.DEV` 判断 |
| `src/components-vue/MkInput.vue` | 可选：对 `type` prop 非法值 warning |
| `src/components-vue/MkTabs.vue` | 保留并修正 `items` 类型检查 |

**测试/验证方案**

- `npm run typecheck` 通过。
- 新增测试：
  - `MkCollapseItem` 无 `name` 时 warning
  - `MkSelect` 同时传 `options` 与 `<MkOption>` 时 warning
- 类型导出验证：在测试文件中 `import type { SelectProps, CollapseProps } from '@luanlu/mk-motion/vue'` 可用。
- `npm run build`、`npm run test` 通过。

**预期风险**

- `defineSlots` 类型升级可能影响构建；Vue 3.5 支持。  
  缓解：保持现有 defineSlots 用法，仅补类型文件。
- Dev warning 在测试中会污染控制台；使用 `vi.spyOn(console, 'warn')` 断言并清理。

---

### 循环 8：最终验收与收尾

**目标**

- 运行完整测试与构建。
- 将 `[Unreleased]` 正式命名为 `[2.0.13]` 并确定发布日期。
- 更新 `ROADMAP.md`：列出剩余 Should/Could 项。
- 输出最终报告。

**改动文件**

| 文件 | 说明 |
|------|------|
| `CHANGELOG.md` | `[Unreleased]` → `[2.0.13] - YYYY-MM-DD`；确认 `[2.0.12]` 已补录 |
| `ROADMAP.md` | 更新当前阶段，新增 Should/Could 列表 |
| `RELEASE.md` | 确认 checklist 与循环 2 一致 |

**测试/验证方案**

- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run build:docs`
- `npm run changelog:check`
- `npm run lint`

**预期风险**

- 无。若任何验收失败，回滚到对应循环修复。

---

## 4. Should / Could / Won't

### Should（强烈建议，但不阻塞 v2.0.13）

| 项 | 说明 | 建议处理循环 |
|----|------|-------------|
| 测试覆盖提升 | 为核心交互组件补齐单元测试 | 已在循环 3/4/5 覆盖 Collapse/Input/Select/Tabs/Dialog |
| 文档站搜索 | 组件和 prop 可搜索 | 不做（超出本期范围） |
| 代码可复制 | 文档示例支持一键复制 | `ComponentDoc.vue` 已有复制按钮，无需改动 |
| 迁移指南 | `MIGRATION.md`：从 Element Plus / Ant Design Vue 迁移 | 可补充一段通用迁移说明，非阻塞 |

### Could（有余力再做）

| 项 | 说明 |
|----|------|
| unstyled 构建产物 | 提供只含结构不含样式的版本 |
| 视觉回归测试 | Chromatic / Playwright 截图对比 |
| 设计 token 参考表 | `DESIGN_TOKENS.md` |

### Won't（本期不做）

- 新增大量新组件
- 重构动画引擎
- Vue 2 支持

---

## 5. 验收标准

- [ ] `npm run build` 通过且无 warning
- [ ] `npm run test` 全部通过
- [ ] `npm run typecheck` 通过
- [ ] `CHANGELOG.md` 包含补录的 `v2.0.12` 条目
- [ ] `CHANGELOG.md` 包含 `v2.0.13` 条目
- [ ] `npm run changelog:check` 能阻止未写 CHANGELOG 的发布
- [ ] `MkCollapse` 支持 `v-model="['panel1']"` 和 `accordion` 模式
- [ ] `MkCollapseItem` 缺失 `name` 时 dev 模式 warning
- [ ] `MkInput` 支持 `type="textarea"` 和 `:rows="4"`
- [ ] `MkSelect` 在 `overflow: hidden` 容器内点击后下拉选项可见（已修复，需保持）
- [ ] 核心组件可通过键盘完整操作
- [ ] 文档站能正常 build，且每个核心组件都有独立文档页

---

## 6. 阻塞处理预案

若出现以下情况，立即停止当前循环并请求人类确认：

1. 改动会破坏现有公开 API（如删除已导出的类型/组件）。
2. 测试无法通过且不知道怎么修。
3. 需要引入新的依赖。
4. 需要修改 CI/CD 流程（本期仅通过 npm script 校验，不动 `.github/workflows/ci.yml`）。
5. 对某个组件的设计方向不确定。
