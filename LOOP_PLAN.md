# mk-motion v2.0.13 Loop 工作计划

> 每个循环只做一个目标，完成后验证再进入下一循环。

---

## 循环 1：项目审计与计划

**目标**：了解代码结构，输出 PLAN.md 与 LOOP_PLAN.md。

**本循环任务**

- [x] 阅读 `package.json`、`CHANGELOG.md`、`.github/workflows/ci.yml`
- [x] 阅读 `src/components/collapse/`、`src/components/input/`、`src/components-vue/` 中相关组件
- [x] 阅读 `docs/` 和 `demo-vue/` 结构
- [x] 运行基线验证：`npm run typecheck`、`npm run test`、`npm run build`
- [x] 输出 `PLAN.md`
- [x] 输出 `LOOP_PLAN.md`

**退出标准**

- `PLAN.md` 与 `LOOP_PLAN.md` 已写入项目根目录。
- 基线 `typecheck / test / build` 全部通过。
- **阻塞点**：等待人类确认计划后再进入循环 2。

---

## 循环 2：CHANGELOG 补漏与发版流程

**目标**：补齐已发布 `v2.0.12` 条目，建立发布前 CHANGELOG 校验。

**本循环任务**

1. 在 `CHANGELOG.md` 中新增 `[2.0.12]` 条目（retroactive），总结自 `[2.0.2]` 以来已发布到 npm 的改动。
2. 保留并整理 `[Unreleased]`，用于记录本期新工作。
3. 创建 `scripts/check-changelog.cjs`：读取 `package.json` 的 `version`，检查 `CHANGELOG.md` 是否存在对应 `[x.y.z]` 标题。
4. 在 `package.json` 增加 `changelog:check` script。
5. 创建 `RELEASE.md`：发布 checklist（version bump → CHANGELOG → git tag → npm publish）。

**退出标准**

- `npm run changelog:check` 通过。
- 临时删除 `[2.0.12]` 条目后，`npm run changelog:check` 失败（验证脚本有效）。
- `npm run typecheck`、`npm run test`、`npm run build` 通过。

---

## 循环 3：重构 MkCollapse API

**目标**：让 Collapse `v-model` 语义清晰，支持 `<MkCollapseItem>` 子组件。

**本循环任务**

1. 创建 `src/components-vue/collapse-context.ts`（注入上下文）。
2. 创建 `src/components-vue/MkCollapseItem.vue`：
   - `name` prop 必填（`string | number`）
   - `title`、`disabled` props
   - 注入父级 Collapse 注册自身
   - dev 模式无 `name` 时 `console.warn`
3. 重构 `src/components-vue/MkCollapse.vue`：
   - 同时支持 `items` prop 与 `<MkCollapseItem>` 子组件
   - `items` 旧用法保留，但打印 deprecation warning
   - `accordion` 行为正确
   - 默认 `v-model` 为空数组（全部收起）
   - 保持 `#title` / `#content` scoped slots 兼容
4. 在 `src/components-vue/index.ts`、`src/vite/resolver.ts`、`src/nuxt/module.ts` 注册 `MkCollapseItem`。
5. 在 `src/components-vue/types.ts` 导出 `CollapseProps`、`CollapseEmits`、`CollapseItemProps`。
6. 新增 `src/__tests__/components/MkCollapse.test.ts`。
7. 更新 `docs/src/data/component-docs.ts` 的 `collapse` 文档（基础/accordion/受控）。
8. 在 `docs/src/data/nav.ts` 添加 `component-collapse` 入口。
9. 在 `demo-vue/src/App.vue` 添加 Collapse 演示。

**退出标准**

- `MkCollapse.test.ts` 全部通过。
- `accordion` 模式同时只能展开一个。
- `MkCollapseItem` 缺失 `name` 时测试捕获 warning。
- `npm run typecheck`、`npm run test`、`npm run build` 通过。

---

## 循环 4：MkInput 支持 textarea

**目标**：补齐 Input 多行文本能力。

**本循环任务**

1. 修改 `src/components-vue/MkInput.vue`：
   - `type="textarea"` 时渲染 `<textarea>`
   - 支持 `rows` prop
   - 支持 `autosize`（`{ minRows?: number, maxRows?: number }`）
   - `showPassword` 对 textarea 无效
2. 在 `src/components-vue/types.ts` 完善 `InputProps`。
3. 新增/更新 `src/__tests__/components/MkInput.test.ts`：textarea 渲染、rows、autosize。
4. 更新 `docs/src/data/component-docs.ts` 的 `input` 文档，增加 textarea 示例。
5. 在 `demo-vue/src/App.vue` 增加 textarea 演示。

**退出标准**

- textarea 渲染正确，`rows` 生效。
- autosize 在输入时调整高度且受 min/max 约束。
- SSR 测试不访问 `scrollHeight`。
- `npm run typecheck`、`npm run test`、`npm run build` 通过。

---

## 循环 5：核心组件键盘导航与 ARIA

**目标**：提升可访问性。

**本循环任务**

1. `MkSelect`：
   - ArrowUp/ArrowDown 移动高亮选项
   - Enter 确认选择并关闭
   - Esc 关闭
   - 补充 `aria-activedescendant`、`aria-selected`
2. `MkTabs`：
   - header 监听键盘（←→ Home End、Enter/Space）
   - 为 tab 添加 `aria-controls`，为 panel 添加 `aria-labelledby`
   - 管理 tab 焦点（当前激活 tab `tabindex="0"`，其余 `-1`）
3. `MkCollapse` / `MkCollapseItem`：
   - 已支持 Enter/Space 切换
   - 为 header 添加 `aria-controls`，为 content 添加 `id`
4. `MkDialog`：
   - 增加焦点陷阱（Tab 循环、Shift+Tab 反向、打开时聚焦首个可聚焦元素）
   - Esc 关闭（已支持）
5. 新增 `src/a11y/focus-trap.ts` helper。
6. 新增/更新各组件键盘测试文件。

**退出标准**

- Select/Tabs/Collapse/Dialog 键盘测试通过。
- `npm run typecheck`、`npm run test`、`npm run build` 通过。

---

## 循环 6：补齐核心文档

**目标**：MkSelect / MkTabs / MkCollapse / MkInput 都有完整文档页。

**本循环任务**

1. 修改 `docs/src/views/ComponentDoc.vue`：
   - 跟踪每个 demo 挂载的 Vue `App`
   - 在 `renderDemos` 前 `unmount` 旧实例，避免内存泄漏
2. 重写 `docs/src/data/component-docs.ts` 中以下组件文档：
   - `select`
   - `tabs`
   - `collapse`
   - `input`
   - 每页包含：基础用法、状态示例、Props/Events/Slots 表格
3. 确认 `docs/src/data/nav.ts` 包含上述组件侧边栏入口。
4. 验证 `npm run build:docs`。

**退出标准**

- `npm run build`（主库）通过。
- `npm run build:docs` 通过。
- 四个文档页可在本地预览，无控制台报错。

---

## 循环 7：TypeScript 类型与 Dev Warning

**目标**：类型精确，错误用法有提示。

**本循环任务**

1. 在 `src/components-vue/types.ts` 补全并导出：
   - `InputProps`
   - `SelectProps`、`SelectEmits`、`SelectSlots`
   - `TabsProps`、`TabsEmits`、`TabsSlots`
   - `CollapseProps`、`CollapseEmits`、`CollapseItemProps`、`CollapseItemSlots`
   - `DialogProps`、`DialogEmits`、`DialogSlots`
2. 在 `src/components-vue/index.ts` 统一 `export type`。
3. `MkCollapseItem` 缺失 `name` 时 dev warning（循环 3 已实现，本循环补充断言）。
4. `MkSelect` 同时传 `options` 与 `<MkOption>` 时 dev warning。
5. 修正 `MkSelect` 现有 `options` 类型警告，避免误报。

**退出标准**

- `npm run typecheck` 通过。
- 类型导出可在测试文件中正常导入。
- dev warning 测试通过。
- `npm run test`、`npm run build` 通过。

---

## 循环 8：最终验收与收尾

**目标**：确保所有交付物完整，准备发布。

**本循环任务**

1. 运行完整验收：
   - `npm run typecheck`
   - `npm run test`
   - `npm run lint`
   - `npm run build`
   - `npm run build:docs`
   - `npm run changelog:check`
2. 将 `CHANGELOG.md` 中的 `[Unreleased]` 改为 `[2.0.13] - YYYY-MM-DD`。
3. 更新 `ROADMAP.md`：标记本期完成项，列出 Should/Could。
4. 输出最终循环报告。
5. `git commit` 并 `git push origin main`。

**退出标准**

- 所有验收命令通过。
- `CHANGELOG.md` 同时包含 `[2.0.12]` 与 `[2.0.13]`。
- `ROADMAP.md` 已更新。
- 代码已推送。

---

## 备注

- 每个循环结束后必须按模板输出循环报告。
- 遇到阻塞立即停止并请求人类确认。
- 本期不修改 `.github/workflows/ci.yml`；发布校验通过 `npm script` 实现。
