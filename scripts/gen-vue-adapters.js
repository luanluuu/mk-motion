import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const COMPONENTS_DIR = join(process.cwd(), 'src/components')
const VUE_DIR = join(process.cwd(), 'src/vue')

function findTsFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      findTsFiles(full, files)
    } else if (
      entry.endsWith('.ts') &&
      !entry.endsWith('.css.ts') &&
      !entry.includes('test')
    ) {
      files.push(full)
    }
  }
  return files
}

function parseInterface(content) {
  const match = content.match(
    /export\s+interface\s+(\w+Options)\s*\{([^}]+)\}/s
  )
  if (!match) return null
  const name = match[1]
  const body = match[2]
  const props = []
  for (const line of body.split('\n')) {
    const m = line.match(/^\s*(\w+)\?\?:\s*(.+?);?\s*$/)
    if (m) {
      let [, key, type] = m
      type = type.trim().replace(/;$/, '')
      props.push({ key, type, optional: true })
    }
  }
  return { name, props }
}

function parseCreateFn(content) {
  const match = content.match(/export\s+function\s+(create\w+)\s*\(/)
  return match ? match[1] : null
}

function parseClassMethods(content) {
  const methods = []
  const regex = /(?:^\s+|\s+)(set\w+|update\w+|destroy)\s*\(/gm
  let m
  while ((m = regex.exec(content)) !== null) {
    methods.push(m[1])
  }
  return [...new Set(methods)]
}

function tsTypeToVueProp(type) {
  if (type.includes('boolean') || type === 'boolean')
    return `{ type: Boolean, default: false }`
  if (type.includes('number') || type === 'number')
    return `{ type: Number, default: 0 }`
  if (type.includes('string') || type === 'string')
    return `{ type: String, default: '' }`
  if (type.includes('Function') || type.includes('=>'))
    return `{ type: Function, default: undefined }`
  if (type.includes('[]') || type.includes('Array'))
    return `{ type: Array, default: () => [] }`
  if (
    type.includes('Record') ||
    type.includes('object') ||
    type.includes('Object')
  )
    return `{ type: Object, default: () => ({}) }`
  return `{ type: String, default: '' }`
}

function kebabCase(str) {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
}

function generateVueAdapter(
  relativePath,
  componentName,
  createFn,
  options,
  methods
) {
  const importPath = relativePath.replace(/\.ts$/, '.js')
  const className = `Mk${componentName}`

  const propDefs = options.props
    .filter((p) => !p.key.startsWith('on') && p.key !== 'motion')
    .map((p) => {
      const vueType = tsTypeToVueProp(p.type)
      return `    ${p.key}: ${vueType},`
    })
    .join('\n')

  const motionProp = options.props.find((p) => p.key === 'motion')
  const motionPropDef = motionProp
    ? `    motion: { type: Object, default: undefined },`
    : ''

  const emitEvents = options.props
    .filter((p) => p.key.startsWith('on') && p.key.length > 2)
    .map((p) => {
      const eventName = p.key[2].toLowerCase() + p.key.slice(3)
      return eventName
    })

  const emitDef =
    emitEvents.length > 0
      ? `  emits: [${emitEvents.map((e) => `'${e}'`).join(', ')}],`
      : ''

  const setterWatches = methods
    .filter((m) => m.startsWith('set') && m !== 'destroy')
    .map((m) => {
      const propName = m[3].toLowerCase() + m.slice(4)
      return `    watch(() => props.${propName}, (v) => instance?.${m}(v))`
    })
    .join('\n')

  const callbackProps = options.props
    .filter((p) => p.key.startsWith('on') && p.key.length > 2)
    .map((p) => {
      const eventName = p.key[2].toLowerCase() + p.key.slice(3)
      return `${p.key}: (e) => emit('${eventName}', e),`
    })
    .join('\n      ')

  const otherProps = options.props
    .filter((p) => !p.key.startsWith('on') && p.key !== 'motion')
    .map((p) => `${p.key}: props.${p.key},`)
    .join('\n      ')

  const motionPropInCreate = motionProp ? 'motion: props.motion,' : ''

  return `import { defineComponent, h, ref, onMounted, onUnmounted, watch } from 'vue'
import { ${createFn} } from '${importPath}'
import type { ${options.name} } from '${importPath}'

export const ${className} = defineComponent({
  name: '${className}',
  props: {
${propDefs}
${motionPropDef}
  },
${emitDef}
  setup(props, { emit, slots }) {
    const container = ref<HTMLDivElement>()
    let instance: ReturnType<typeof ${createFn}> | null = null

    const create = () => {
      if (!container.value) return
      instance?.destroy()
      instance = ${createFn}(container.value, {
${otherProps}
${callbackProps}
${motionPropInCreate}
      })
    }

    onMounted(create)
${setterWatches ? '\n' + setterWatches : ''}
    onUnmounted(() => instance?.destroy())

    return () => h('div', { ref: container })
  },
})
`
}

const files = findTsFiles(COMPONENTS_DIR)
const exports = []

for (const file of files) {
  const content = readFileSync(file, 'utf-8')
  const createFn = parseCreateFn(content)
  const iface = parseInterface(content)
  if (!createFn || !iface) continue

  const methods = parseClassMethods(content)
  const relativePath = file.replace(process.cwd() + '/src/', '../')
  const baseName = file.split('/').pop().replace('.ts', '')
  const componentName = baseName[0].toUpperCase() + baseName.slice(1)

  const vueCode = generateVueAdapter(
    relativePath,
    componentName,
    createFn,
    iface,
    methods
  )
  const vueFile = join(VUE_DIR, `${kebabCase(componentName)}.ts`)
  writeFileSync(vueFile, vueCode)
  exports.push(
    `export { Mk${componentName} } from './${kebabCase(componentName)}.js'`
  )
  console.log(`Generated: src/vue/${kebabCase(componentName)}.ts`)
}

writeFileSync(join(VUE_DIR, 'index.ts'), exports.join('\n') + '\n')
console.log('\nAll done! Updated src/vue/index.ts')
