# mk-motion

动画驱动的现代前端 UI 系统 —— 动画引擎 + 手势交互 + Vue 3 组件 + 工程集成，四合一。

```bash
npm install @luanlu/mk-motion
```

## 它是什么

mk-motion 不是一个"组件库"，而是四个独立可用的能力的组合：

| 能力                      | 做什么                                      | 独立使用？                                                           |
| ------------------------- | ------------------------------------------- | -------------------------------------------------------------------- |
| **Animation Engine**      | Spring、FLIP、Timeline、WAAPI、CSS 预设     | `import { springTo, flip } from '@luanlu/mk-motion/motion'`          |
| **Gesture & Interaction** | 拖拽排序、滑动、捏合、磁吸、光标轨迹        | `import { DraggableList, magnetic } from '@luanlu/mk-motion/motion'` |
| **Vue 3 Components**      | 30+ 企业级 SFC 组件                         | `import { MkButton, MkTable } from '@luanlu/mk-motion/vue'`          |
| **DevTool Integration**   | Vite 插件、Nuxt 3 module、unplugin resolver | 零配置自动导入                                                       |

每个能力都可以独立引入，不与其它能力耦合。

---

## 快速开始

### 只用动画

```ts
import { springTo, flip, fadeIn } from '@luanlu/mk-motion/motion'
import '@luanlu/mk-motion/css'

// Spring 物理动画
springTo(element, {
  to: { x: 0, opacity: 1 },
  stiffness: 180,
  damping: 22,
})

// FLIP 布局动画
await flip(listElement, () => {
  items.reverse()
  render()
})

// CSS 预设
await fadeIn('.box', { duration: 400 })
```

### 只用拖拽排序

```ts
import { DraggableList } from '@luanlu/mk-motion/motion'
import '@luanlu/mk-motion/css'

new DraggableList(document.getElementById('list')!, {
  onReorder: (fromIndex, toIndex) => {
    console.log(`从 ${fromIndex} 移到 ${toIndex}`)
    // 持久化新顺序
  },
  onDragStart: ({ index }) => console.log('拖拽开始', index),
  onDragMove: ({ index, deltaY }) => console.log('移动中', index, deltaY),
  onDragEnd: ({ fromIndex, toIndex }) => console.log('拖拽结束'),
})
```

支持鼠标、触摸、触控板（macOS/Windows），自动感知 `prefers-reduced-motion` 跳过释放动画。通过 `data-drag-disabled` 属性可禁止特定条目拖拽。

### Vue 3 全量

```ts
// main.ts
import { createApp } from 'vue'
import MkMotion from '@luanlu/mk-motion/vue'
import '@luanlu/mk-motion/css'
import App from './App.vue'

createApp(App).use(MkMotion).mount('#app')
```

```vue
<template>
  <MkButton type="primary" @click="visible = true">打开</MkButton>
  <MkDialog v-model="visible" title="确认操作">确定继续吗？</MkDialog>

  <MkSelect v-model="city" :options="[
    { label: '北京', value: 'beijing' },
    { label: '上海', value: 'shanghai' },
  ]" />

  <!-- or use MkOption children -->
  <MkSelect v-model="city">
    <MkOption label="北京" value="beijing" />
    <MkOption label="上海" value="shanghai" />
  </MkSelect>

  <MkTabs v-model="activeTab" :items="[
    { key: 'tab1', label: 'Tab 1' },
    { key: 'tab2', label: 'Tab 2' },
  ]" />

  <!-- or use MkTabPane children -->
  <MkTabs v-model="activeTab">
    <MkTabPane name="tab1" label="Tab 1">Content 1</MkTabPane>
    <MkTabPane name="tab2" label="Tab 2">Content 2</MkTabPane>
  </MkTabs>
</template>
```

### Vite 自动导入

```ts
// vite.config.ts
import { mkMotion } from '@luanlu/mk-motion/vite'

export default defineConfig({
  plugins: [vue(), mkMotion()],
})
```

配置后无需手动 import 组件，直接在 template 中使用 `<MkButton>`、`<MkTable>` 等。

> 建议二选一：要么完全依赖自动导入，要么完全手动 import。混用会导致组件被重复注册或打包体积冗余。

### Nuxt 3

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@luanlu/mk-motion/nuxt'],
})
```

---

## API 导航

### 动画引擎 (`@luanlu/mk-motion/motion`)

**Spring 物理引擎**

| API                                   | 说明             |
| ------------------------------------- | ---------------- |
| `springTo(el, options)`               | 单元素弹簧动画   |
| `springFromTo(el, from, to, options)` | 指定起止状态     |
| `springStagger(els, options)`         | 批量交错弹簧动画 |
| `springSequence(steps)`               | 顺序弹簧动画链   |
| `springParallel(steps)`               | 并行弹簧动画     |

**FLIP 布局动画**

| API                                        | 说明          |
| ------------------------------------------ | ------------- |
| `flip(container, mutate)`                  | 单容器 FLIP   |
| `staggerFlip(container, mutate)`           | 交错 FLIP     |
| `flipGrid(container, mutate, options)`     | 网格 FLIP     |
| `filterGrid(container, filterFn, options)` | 过滤网格 FLIP |
| `shuffleGrid(container, orderFn, options)` | 洗牌网格 FLIP |

**Timeline & Animator**

| API        | 说明                                                       |
| ---------- | ---------------------------------------------------------- |
| `Animator` | 声明式动画控制器，支持 WAAPI / CSS 预设 / play/pause/reset |
| `Timeline` | 时间线编排，支持 seek、add、label                          |

**CSS 预设动画** — `fadeIn/Out`, `slideIn/Out`, `zoomIn/Out`, `bounceIn/Out`, `flipInX/Y`, `shake`, `pulse`, `rotateIn`

**文字特效** — `Typewriter`, `CountUp`, `TextSplit`, `WaveText`, `glitch`, `glitchLoop`

**视觉特效** — `particleBurst`, `blurReveal`, `parallax`, `shimmer`, `lazyImage`

**过渡组件** — `collapse` / `expand`, `listStagger`, `toast`, `pageTransition`

### 手势交互 (`@luanlu/mk-motion/motion`)

| API                                | 说明                   |
| ---------------------------------- | ---------------------- |
| `DraggableList(el, options)`       | 拖拽排序列表           |
| `createDraggableList(el, options)` | DraggableList 工厂函数 |
| `Draggable(el, options)`           | 通用拖拽               |
| `SwipeRecognizer(el, options)`     | 滑动手势识别           |
| `PinchRecognizer(el, options)`     | 捏合手势识别           |
| `TapRecognizer(el, options)`       | 点击/长按识别          |
| `magnetic(el, options)`            | 磁吸跟随               |
| `magneticText(el, options)`        | 文字磁吸               |
| `CoverFlow` / `createCoverFlow`    | 3D 封面流              |
| `FlipCard` / `createFlipCard`      | 卡片翻转               |
| `cursorTrail(options)`             | 光标拖尾               |

### Vue 3 组件 (`@luanlu/mk-motion/vue`)

**基础** — `MkButton`, `MkInput`, `MkSelect` (`:options` or `<MkOption>`), `MkSwitch`, `MkRadio/Group`, `MkCheckbox/Group`, `MkSlider`

**数据展示** — `MkTable` (虚拟滚动 + 排序 + 过滤), `MkPagination`, `MkTree` (懒加载 + 搜索), `MkTag`, `MkCard`, `MkAvatar`, `MkEmpty`, `MkProgress`

**表单** — `MkForm`, `MkFormItem`, `MkDatePicker`, `MkTimePicker`, `MkUpload`

**布局** — `MkContainer`, `MkLayout`, `MkHeader`, `MkAside`, `MkMain`, `MkFooter`, `MkRow`, `MkCol`, `MkSpace`, `MkDivider`

**导航** — `MkMenu`, `MkMenuItem`, `MkTabs` (`:items` or `<MkTabPane>`), `MkBreadcrumb`, `MkSteps`, `MkPagination`

**反馈** — `MkDialog`, `MkDrawer`, `MkPopover`, `MkDropdown`, `MkTooltip`, `MkMessage`, `MkLoading`, `MkAlert`, `MkCollapse`

**辅助** — `useMkTheme()` (暗黑模式切换), `FocusTrap`, `onKey` (键盘快捷键), `setupMkMotionDevTools()`

### 工程集成

| 入口                         | 用途                                                     |
| ---------------------------- | -------------------------------------------------------- |
| `@luanlu/mk-motion/motion`   | 轻量动画与交互工具入口，不包含 Vue 组件和 legacy DOM API |
| `@luanlu/mk-motion/vite`     | Vite 插件，自动导入 Vue 组件                             |
| `@luanlu/mk-motion/nuxt`     | Nuxt 3 module，自动注册组件 + composables                |
| `@luanlu/mk-motion/resolver` | unplugin-vue-components resolver                         |
| `@luanlu/mk-motion/css`      | 全部样式（组件 + 动画 + 主题）                           |

---

## 主题

基于 CSS 变量和 Design Token 的主题系统，内置暗黑模式：

```ts
import { useMkTheme } from '@luanlu/mk-motion/vue'

const { isDark, toggle, setTheme } = useMkTheme()
toggle() // 切换暗黑模式
setTheme('dark') // 强制暗黑
```

自定义主题只需覆盖 CSS 变量：

```css
:root {
  --mk-primary: #4f46e5;
  --mk-radius: 8px;
}
```

---

## 兼容层

保留命令式 DOM API，适合非 Vue 页面或旧代码迁移：

```ts
import { createButton, createDialog, messageSuccess } from '@luanlu/mk-motion/legacy'
import '@luanlu/mk-motion/css'

createButton(document.body, {
  type: 'primary',
  text: '打开',
  onClick() {
    createDialog({
      title: '提示',
      content: '命令式调用。',
      onConfirm: () => messageSuccess('已确认'),
    }).open()
  },
})
```

Vue 项目建议优先使用 `@luanlu/mk-motion/vue`。

---

## 本地开发

```bash
npm install
npm run dev          # 库开发入口
npm run docs:dev     # 文档站 → http://localhost:5173
npm run build        # 构建主包 + 子入口
npm run build:docs   # 构建文档站
```

### 构建产物

| 文件                     | 格式 | 用途           |
| ------------------------ | ---- | -------------- |
| `dist/mk-motion.js`      | ESM  | 主入口         |
| `dist/mk-motion.umd.cjs` | UMD  | CDN / require  |
| `dist/vue.js`            | ESM  | Vue 组件子入口 |
| `dist/vite.js`           | ESM  | Vite 插件      |
| `dist/nuxt.js`           | ESM  | Nuxt module    |
| `dist/resolver.js`       | ESM  | 组件 resolver  |
| `dist/style.css`         | CSS  | 全部样式       |

---

## License

MIT
