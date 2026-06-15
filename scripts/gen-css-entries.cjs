const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'dist', 'css')
const componentsDir = path.join(root, 'src', 'components')

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

function collectComponentCss(dir, map = new Map()) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      collectComponentCss(fullPath, map)
    } else if (entry.isFile() && entry.name.endsWith('.css')) {
      // skip global style aggregator files
      if (fullPath.includes(path.join('src', 'components', 'styles'))) continue
      const relative = path.relative(componentsDir, fullPath)
      const name = path.basename(relative, '.css')
      map.set(name, fullPath)
    }
  }
  return map
}

function main() {
  fs.mkdirSync(outDir, { recursive: true })

  // Copy base styles
  copyFile(
    path.join(root, 'src', 'css', 'base.css'),
    path.join(outDir, 'base.css')
  )

  // Copy each component CSS into a flat dist/css/<name>.css
  const cssMap = collectComponentCss(componentsDir)
  for (const [name, filePath] of cssMap) {
    copyFile(filePath, path.join(outDir, `${name}.css`))
  }

  // Generate index.css that imports base + all component styles
  const imports = ['base', ...Array.from(cssMap.keys()).sort()]
    .map((name) => `@import './${name}.css';`)
    .join('\n')
  fs.writeFileSync(path.join(outDir, 'index.css'), imports + '\n')

  console.log(`Generated ${cssMap.size + 1} CSS entries in ${outDir}`)
}

main()
