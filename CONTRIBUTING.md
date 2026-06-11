# Contributing to mk-motion

感谢你的贡献意愿！本文档说明如何参与 mk-motion 的开发。

## 项目结构

```
mk-motion/
├── src/                    # 库源码
│   ├── index.ts            # 主入口，聚合所有模块导出
│   ├── core/               # 动画核心：Animator, Timeline, SpringEngine
│   ├── presets/            # CSS 预设动画
│   ├── motion/             # FLIP / 组件动画系统
│   ├── gesture/            # 手势识别
│   ├── interactive/        # 交互组件 (DraggableList, CoverFlow 等)
│   ├── effects/            # 视觉特效 (Particle, Glitch, WaveText)
│   ├── transitions/        # 过渡动画 (Parallax, Shimmer, Toast 等)
│   ├── text/               # 文字特效 (Typewriter, CountUp)
│   ├── micro/              # 微交互 (Ripple, HoverLift)
│   ├── scroll/             # 滚动驱动动画
│   ├── a11y/               # 无障碍
│   ├── components/         # 命令式 DOM 组件
│   ├── components-vue/     # Vue 3 SFC 组件（手写）
│   ├── theme/              # 主题系统
│   ├── devtools/           # DevTools 集成
│   └── styles/             # 样式入口
├── docs/                   # 文档站 (Vite SPA)
│   ├── src/pages/          # 页面渲染器 (animations.ts, design-tokens.ts, ...)
│   ├── src/data/           # 组件文档数据、导航结构
│   ├── src/styles/         # 文档站样式
│   └── vite.config.ts      # 文档站 Vite 配置
├── scripts/                # 构建辅助脚本
│   └── gen-vue-adapters.js # 为命令式组件生成 Vue SFC 适配器
├── vite.config.ts          # 主库 Vite 配置
├── vite.entries.config.ts  # 子入口 Vite 配置
└── tsconfig.json
```

## 开发环境

- Node.js >= 18
- npm >= 9

```bash
git clone https://github.com/luanluuu/mk-motion.git
cd mk-motion
npm install
```

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动库开发入口（热更新） |
| `npm run docs:dev` | 启动文档站开发服务器 → `http://localhost:5173` |
| `npm run build` | 编译 + 打包（`tsc && vite build && vite build --config vite.entries.config.ts`） |
| `npm run build:docs` | 构建文档站 |

## 开发流程

### 1. 创建分支

```bash
git checkout -b feature/your-feature
# 或
git checkout -b fix/your-fix
```

### 2. 写代码

- **新增动画 API** → 放在 `src/` 对应分类目录，在 `src/index.ts` 中导出
- **修改 Vue 组件** → 修改 `src/components-vue/` 中的 SFC 文件
- **修改命令式组件** → 修改 `src/components/` 中的 TS 文件
- **修改文档** → 修改 `docs/src/pages/` 中的页面渲染器

### 3. 确保构建通过

```bash
npm run build
```

### 4. 验证文档

```bash
npm run docs:dev
```

在浏览器中检查你的改动是否正常渲染。

### 5. 提交

```bash
git add .
git commit -m "feat: add your feature description"
```

提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)。

## 代码规范

### TypeScript

- 使用严格模式 (`strict: true`)
- 所有公开 API 必须有 JSDoc 注释
- 类型定义放在模块文件或同级 `types.ts` 中

### Vue 组件

- 使用 `<script setup lang="ts">` 声明式语法
- Props 使用 `defineProps<T>()` 泛型形式
- 组件名称使用 `Mk` 前缀

### 动画 API

- 工厂函数使用 `create` 前缀（如 `createDraggableList`）
- 快捷调用使用动词短语（如 `fadeIn`、`springTo`）
- 返回 Promise 的动画标注 `@returns Promise<void>`

### 样式

- 所有样式通过 CSS 变量定义，支持主题覆盖
- 暗黑模式通过 `[data-mk-theme="dark"]` 选择器
- 减少动画通过 `@media (prefers-reduced-motion: reduce)` 适配

## 文档站

文档站是 Vue 3 SPA（`docs/` 目录），每个页面对应 `docs/src/pages/` 中的一个 TS 文件。

**添加新页面：**

1. 在 `docs/src/pages/` 创建 `your-page.ts`
2. 在 `docs/src/router.ts` 注册路由
3. 在 `docs/src/data/nav.ts` 添加导航项

## Pull Request

1. Fork 仓库
2. 创建功能分支
3. 确保 `npm run build` 通过
4. 提交 PR，描述问题和解决方案
5. 关联相关 Issue（如有）

## License

贡献的代码将按 MIT 协议发布。
