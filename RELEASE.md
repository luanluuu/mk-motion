# Release Checklist

本仓库使用 GitHub Actions 自动发布。合并到 `main` 分支后，CI 会执行测试、构建、自动 patch 版本提升、npm 发布与文档部署。

## 发布前检查

1. 所有改动已写入 `CHANGELOG.md` 的 `[Unreleased]` 小节。
2. 运行完整验证：
   ```bash
   npm run typecheck
   npm run test
   npm run lint
   npm run build
   npm run build:docs
   npm run changelog:check
   ```
3. 将 `[Unreleased]` 重命名为目标版本号并补充日期，例如：
   ```markdown
   ## [2.0.13] - 2026-06-16
   ```
4. 提交 `CHANGELOG.md` 与相关改动，推送到 `main`。

## CI 自动流程

推送后 GitHub Actions 会依次执行：

1. `npm run check`（测试 + 覆盖率 + 构建 + 文档构建）
2. `npm run pack:check`（包内容 dry-run）
3. `npm version patch --no-git-tag-version`（自动提升 patch 版本）
4. `npm run changelog:check`（校验 CHANGELOG 包含新版本条目）
5. `npm publish --provenance --access public`
6. 将版本提升提交推送回 `main`
7. 将 `dist-docs/` 部署到 `gh-pages`

## 发布后验证

- [ ] npm 页面显示新版本：<https://www.npmjs.com/package/@luanlu/mk-motion>
- [ ] GitHub Releases / Tags 中能看到对应 tag
- [ ] 文档站点正常部署

## 手动回滚

若发布后发现严重问题：

1. 在 `main` 上修复并走正常 PR/推送流程。
2. 不要尝试覆盖已发布的 npm 版本（npm 禁止）。
3. 让 CI 自动发布新的 patch 版本。
