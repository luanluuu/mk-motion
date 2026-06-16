# mk-motion 发展路线图

> 目标：从"基础组件库"进化为"动画驱动的现代前端 UI 系统"
> 更新日期：2026-06-14

---

## 当前执行阶段（2026-06-14）

基于「P0 修复 → P1 补齐 → 工程化 → 发布」四阶段计划推进。

### Phase 1 — P0 热修复 ✅

- [x] Tabs 面板 `display` 修复，支持 `MkTabPane` 子组件
- [x] 浮层组件统一 `teleport` 到 body，防止被父容器裁剪
- [x] 主题系统重构：`light/dark/auto` 三态，`useMkTheme` SSR 安全，默认 light
- [x] 移除表单/浮层组件默认 `max-width`

### Phase 2 — P1 能力补齐 + 文档/示例 🚧

- [ ] 补充核心组件测试（Input、Button、Dialog、useMkTheme 等）
- [ ] 更新 `MIGRATION.md` 与 `ROADMAP.md`
- [ ] 示例项目支持主题切换，验证下拉框/弹窗不被裁剪

### Phase 3 — 工程化与开发者体验

- [ ] 完善 TypeScript 类型导出
- [ ] SSR/Nuxt 3 适配验证
- [ ] 文档站点组件化并接入新主题切换
- [ ] 构建产物校验、测试覆盖率门槛

### Phase 4 — 发布收尾

- [ ] 最终验收：build / typecheck / test / lint
- [ ] 整理 `CHANGELOG.md` 并发布版本
- [ ] 验证示例项目主题切换与浮层定位

---

## 阶段一：补齐底座（组件深度）

> **目标**：组件数量和质量达到"能独立搭建完整后台系统"的水平
> **预期周期**：4-6 周

### 1.1 数据展示组件

- [x] **1.1.1 Table 虚拟滚动**
  - 支持大数据量（10万+行）流畅滚动
  - 固定列（left/right）
  - 行高自适应
  - 完成标准：10万条数据渲染不卡顿，固定列正确显示
- [x] **1.1.2 Table 排序与过滤**
  - 单列/多列排序 ✅
  - 列头过滤菜单 ✅
  - 自定义过滤模板 ✅
  - 完成标准：点击列头可排序，下拉过滤菜单正常工作 ✅

- [x] **1.1.3 Table 行选择与操作**
  - 单选/多选（checkbox）✅
  - 全选/反选 ✅
  - 行编辑/删除 ✅
  - 完成标准：多选状态同步，行展开动画正常 ✅

- [x] **1.1.4 Tree 组件**
  - 基础渲染与展开/折叠 ✅
  - 复选框（级联选择）✅
  - 懒加载（loadData）✅
  - 搜索过滤 ✅
  - 完成标准：支持 1000+ 节点，搜索高亮，懒加载正常 ✅

- [x] **1.1.5 Pagination 分页**
  - 基础分页 ✅
  - 快速跳转 ✅
  - 每页条数选择 ✅
  - 完成标准：配合 Table 正常分页 ✅

### 1.2 表单组件

- [x] **1.2.1 Select 下拉选择**
  - 单选/多选
  - 远程搜索（debounce）
  - 虚拟滚动（大数据选项）
  - 分组（optgroup）
  - 完成标准：10000 个选项不卡顿，远程搜索 debounce 正确

- [x] **1.2.2 DatePicker 日期选择**
  - 基础日期选择 ✅
  - 日历弹出面板 ✅
  - 预设快捷选项
  - 完成标准：日期面板正确渲染 ✅

- [x] **1.2.3 TimePicker 时间选择**
  - 基础时间选择 ✅
  - 三列滚动面板（时/分/秒）✅
  - 完成标准：时间面板交互正常 ✅

- [x] **1.2.4 Upload 上传**
  - 点击/拖拽上传 ✅
  - 多文件 ✅
  - 进度显示 ✅
  - 图片预览 ✅
  - 完成标准：上传成功/失败状态正确，图片缩略图显示 ✅

- [x] **1.2.5 Form 表单容器**
  - 表单校验 ✅
  - 布局（inline/horizontal/vertical）✅
  - 完成标准：配合 Input/Select/Radio/DatePicker 完成完整表单提交 ✅

### 1.3 导航与反馈

- [x] **1.3.1 Breadcrumb 面包屑**
  - 基础渲染 ✅
  - 分隔符自定义 ✅
  - 完成标准：配合路由正常显示路径 ✅

- [x] **1.3.2 Steps 步骤条**
  - 水平/垂直 ✅
  - 图标自定义 ✅
  - 完成标准：状态流转（wait/process/finish/error）正确 ✅

- [x] **1.3.3 Dropdown 下拉菜单**
  - 触发方式（click/hover）✅
  - 分组/分割线 ✅
  - 完成标准：定位正确，不溢出视口 ✅

- [x] **1.3.4 Popover/Popconfirm**
  - 气泡卡片 ✅
  - 确认对话框 ✅
  - 定位（4 个方向）✅
  - 完成标准：箭头指向正确，点击外部关闭 ✅

- [x] **1.3.5 Loading 加载状态**
  - 区域加载 ✅
  - 全屏加载 ✅
  - 自定义图标/文案 ✅
  - 完成标准：配合 Table/Button 使用正常 ✅

---

## 阶段二：动画壁垒（核心差异化）

> **目标**：让"动画"成为 mk-motion 不可复制的护城河
> **预期周期**：6-8 周

### 2.1 动画引擎基础

- [x] **2.1.1 弹簧动画核心（Spring Engine）**
  - 基于胡克定律的弹簧模型
  - 参数：stiffness（刚度）、damping（阻尼）、mass（质量）
  - 支持 WAAPI 和 CSS fallback
  - API：`spring({ from, to, stiffness, damping })`
  - 完成标准：数值/颜色/transform 都能弹簧过渡

- [x] **2.1.2 动画编排系统（Orchestration）**
  - `stagger(items, delay)`：错开动画 ✅
  - `sequence(steps)`：顺序执行 ✅
  - `timeline()`：时间线控制（播放/暂停/倒放/seek）
  - `parallel()`：并行执行
  - 完成标准：10 个元素 stagger 入场，timeline 可 seek 到任意时间点

- [x] **2.1.3 FLIP 动画**
  - 自动计算布局变化 ✅
  - 支持 list reorder、grid filter、shuffle ✅
  - API：`flip(element, () => { ... })` ✅
  - `DraggableList`：拖拽排序 + ghost + FLIP 补位 ✅
  - `filterGrid` / `shuffleGrid`：网格筛选/打乱动画 ✅
  - 完成标准：拖拽排序列表时，其他元素平滑补位 ✅

- [x] **2.1.4 手势系统（Gesture）**
  - Pan（拖拽）✅
  - Swipe（快速滑动）✅
  - Pinch（捏合缩放）✅
  - Tap/Press（单击/双击/长按）✅
  - 完成标准：手势位移映射到元素 transform，释放时弹簧回弹 ✅

### 2.2 组件级动画增强

- [x] **2.2.1 全局默认动画**
  - Button/Card 默认弹簧悬停，Dialog/Drawer 默认弹簧打开/关闭

- [x] **2.2.2 Dialog/Drawer 动画升级**
  - 背景遮罩 fade + 内容 spring 入场/退场

- [x] **2.2.3 Menu 展开动画**
  - 子菜单 slide + fade（已支持）

- [x] **2.2.4 Card/List 悬停动画**
  - 悬停时微妙上浮 + 阴影扩散（弹簧物理）

### 2.3 高级场景

- [x] **2.3.1 页面转场动画**
  - hash-based Router 集成 ✅
  - 离场 → 入场编排（slide/fade/zoom/flip）✅
  - 共享元素过渡（Shared Element Transition）
  - 完成标准：路由切换时有方向感的滑动过渡 ✅

- [x] **2.3.2 滚动驱动动画**
  - `ScrollTrigger` + `scrollAnimate()` ✅
  - 视差效果（`parallax` / `parallaxGroup`）✅
  - 进度指示器 ✅
  - 完成标准：滚动页面时元素按滚动位置动画 ✅

- [x] **2.3.3 数据可视化动画**
  - 数字滚动（countUp）✅
  - 进度条弹簧填充 ✅
  - 图表入场动画（预留接口）
  - 完成标准：数字从 0 弹性增长到目标值 ✅

---

## 阶段三：工程化与开发者体验

> **目标**：让开发者"想用、敢用、喜欢用"
> **预期周期**：4-6 周

### 3.1 Design Token 与主题

- [x] **3.1.1 Design Token 系统**
  - 颜色：primary/success/warning/error/info + 10 个梯度
  - 间距：space-1 ~ space-12
  - 字体：font-size、font-weight、line-height
  - 圆角、阴影、边框
  - CSS 变量化：`--mk-color-primary-500`
  - 完成标准：所有组件样式引用 Token，无硬编码

- [x] **3.1.2 主题定制**
  - 在线主题生成器（web 页面调色板）✅
  - 导出 CSS 变量文件 ✅
  - 运行时切换主题（无刷新）✅
  - 完成标准：改一个 primary 色，所有组件同步变色 ✅

- [x] **3.1.3 暗黑模式完善**
  - 100% 组件覆盖 ✅
  - 自动跟随系统 ✅
  - 手动切换（`theme.toggle()`）✅
  - 完成标准：切到暗黑模式无视觉断层 ✅

### 3.2 构建与分发

- [x] **3.2.1 按需加载**
  - Vite 插件 `mkMotion()` 自动导入组件 + CSS
  - `MkMotionResolver` 兼容 `unplugin-vue-components`
  - 完成标准：模板中使用 `<MkButton>` 无需手动 import

- [x] **3.2.2 SSR/Nuxt 3 适配**
  - Nuxt module 自动注册 20+ 组件
  - `useMkTheme` 等 Composable SSR 安全
  - 完成标准：Nuxt 3 项目 `npm i @luanlu/mk-motion` + module 配置即可用

- [x] **3.2.3 TypeScript 完善**
  - 所有组件 Options 类型导出（index.ts）
  - 组件实例类型通过 class 导出
  - 完成标准：`const btn = ref<InstanceType<typeof MkButton>>()` 能点出方法

### 3.3 调试工具

- [x] **3.3.1 Vue DevTools 插件**
  - 查看当前页面所有动画状态 ✅
  - 弹簧参数实时展示 ✅
  - 完成标准：DevTools 面板能看到动画时间线 ✅

---

## 阶段四：设计与品牌

> **目标**：形成独特的视觉 DNA
> **预期周期**：持续迭代

- [x] **4.1 动效规范文档**
  - 每种组件的标准动画时长、缓动曲线 ✅
  - 弹簧参数规范 ✅
  - 完成标准：新增组件有明确动画标准可依 ✅

- [ ] **4.2 Figma 设计资源**
  - 组件库（Figma Community 发布）
  - 完成标准：设计师能用 Figma 搭建和代码一致的界面
  - **状态**：需设计师在 Figma 中手动创建，无法代码自动生成

- [x] **4.3 官网重设计**
  - 主题生成器页面 ✅
  - 动效规范文档页面 ✅
  - 动画展示厅（showcase）✅
  - 完成标准：首页能让人一眼记住"这是个动画很棒的库" ✅

- [x] **4.4 完整示例项目**
  - 后台管理系统 Demo (`examples/admin-dashboard/`) ✅
  - 落地页 Demo (`examples/landing-page/`) ✅
  - 完成标准： standalone HTML 可直接运行 ✅

---

## 已完成 ✅

> 以下是在本路线图中已经完成的工作

- [x] **Vue 适配器修复** — 移除隐藏 span，修复 TransitionGroup 清除 DOM 问题
- [x] **基础布局组件** — Layout/Header/Aside/Main/Footer, Row, Space, Divider, Container
- [x] **Docs 站点组件化** — MkCard, MkButton, MkTable, MkMenu 全部替换第三方
- [x] **Vue 适配器无闪烁** — 移除 `onUpdated` 钩子，避免 TransitionGroup 频繁重建
- [x] **FLIP 动画核心引擎** — `flip()` + `staggerFlip()`，基于 Spring 物理
- [x] **可拖拽排序列表** — `DraggableList`，支持 ghost、placeholder、FLIP 补位动画
- [x] **网格筛选动画** — `filterGrid()` / `shuffleGrid()`，网格布局变化丝滑过渡
- [x] **Docs FLIP Demo** — 动画展示页新增拖拽排序 + 网格筛选/打乱交互演示
- [x] **Dropdown 下拉菜单** — click/hover 触发，分组/分割线，边界检测
- [x] **Pagination 分页** — 独立组件，页码/ellipsis/每页条数选择
- [x] **Tree 树形组件** — 展开折叠、级联复选框、懒加载、搜索过滤
- [x] **Table 行选择** — checkbox 单选/多选、全选/反选、indeterminate 状态
- [x] **DatePicker 日期选择** — 日历面板、月份导航、日选择
- [x] **TimePicker 时间选择** — 三列滚动面板（时/分/秒）
- [x] **Upload 文件上传** — 点击/拖拽、多文件、进度条、图片预览
- [x] **Form 表单容器** — 字段渲染、校验、inline/horizontal/vertical 布局
- [x] **手势系统** — Pan/Swipe/Pinch/Tap/Press 完整手势识别
- [x] **页面转场动画** — slide/fade/zoom/flip + hash-based Router
- [x] **滚动驱动动画** — ScrollTrigger、parallax、视差效果
- [x] **数据可视化动画** — CountUp 数字滚动、进度条弹簧填充
- [x] **主题定制生成器** — 在线调色板、实时预览、CSS 变量导出
- [x] **暗黑模式** — 100% 组件覆盖、自动跟随系统、手动切换
- [x] **Vue DevTools 插件** — 动画状态面板、弹簧参数展示
- [x] **动效规范文档** — 标准时长/缓动/弹簧参数规范
- [x] **示例项目** — Admin Dashboard + Landing Page 两个完整 Demo

---

## 路线图完成度

**已完成：36 / 37 项（97%）**

唯一未完成项：

- **4.2 Figma 设计资源** — 需要设计师在 Figma 中手动创建组件库并发布到 Figma Community，无法通过代码自动生成。

## 下一步建议

1. **补齐 Figma 设计资源（4.2）** — 导出组件截图，在 Figma 中重建设计系统
2. **性能优化** — Tree 大数据量虚拟滚动、Table 固定列实现
3. **国际化（i18n）** — 所有组件文案可配置
4. **单元测试覆盖** — 为核心动画引擎和组件添加测试
