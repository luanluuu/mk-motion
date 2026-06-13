<script setup lang="ts">
import { ref, computed, h, watch } from 'vue'
import type { VNode } from 'vue'

export interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
  disabled?: boolean
  isLeaf?: boolean
  expanded?: boolean
  checked?: boolean
}

interface InternalTreeNode extends TreeNode {
  parent?: InternalTreeNode
  indeterminate?: boolean
  loading?: boolean
  loaded?: boolean
  children?: InternalTreeNode[]
}

interface Props {
  data: TreeNode[]
  showCheckbox?: boolean
  checkStrictly?: boolean
  lazy?: boolean
  loadData?: (node: TreeNode) => Promise<TreeNode[]>
  filter?: string
}

const props = withDefaults(defineProps<Props>(), {
  showCheckbox: false,
  checkStrictly: false,
  lazy: false,
})

const emit = defineEmits<{
  select: [node: TreeNode]
  check: [nodes: TreeNode[]]
  expand: [node: TreeNode]
  load: [node: TreeNode]
}>()

const nodeMap = new Map<string, InternalTreeNode>()

function processNodes(
  data: TreeNode[],
  parent?: InternalTreeNode
): InternalTreeNode[] {
  return data.map((n) => {
    const node: InternalTreeNode = {
      ...n,
      parent,
      indeterminate: false,
      loading: false,
      loaded: !props.lazy || !!n.children || n.isLeaf,
    }
    nodeMap.set(node.id, node)
    if (node.children) {
      node.children = processNodes(node.children, node)
    }
    return node
  })
}

const nodes = ref<InternalTreeNode[]>(processNodes(props.data))

watch(
  () => props.data,
  (next) => {
    nodeMap.clear()
    nodes.value = processNodes(next)
  },
  { deep: true }
)

const filterText = computed(() => props.filter?.trim().toLowerCase() ?? '')

function getCheckedNodes(list: InternalTreeNode[] = nodes.value): TreeNode[] {
  const result: TreeNode[] = []
  const collect = (items: InternalTreeNode[]) => {
    items.forEach((n) => {
      if (n.checked) result.push(n)
      if (n.children) collect(n.children)
    })
  }
  collect(list)
  return result
}

function setNodeChecked(node: InternalTreeNode, checked: boolean) {
  node.checked = checked
  node.indeterminate = false
}

function updateChildrenCheck(node: InternalTreeNode, checked: boolean) {
  if (!node.children) return
  node.children.forEach((child) => {
    if (!child.disabled) {
      setNodeChecked(child, checked)
      updateChildrenCheck(child, checked)
    }
  })
}

function updateParentsCheck(parent?: InternalTreeNode) {
  if (!parent) return
  const children = parent.children
  const allChecked = children?.every((c) => c.checked) ?? false
  const someChecked =
    children?.some((c) => c.checked || c.indeterminate) ?? false
  if (allChecked) {
    parent.checked = true
    parent.indeterminate = false
  } else if (someChecked) {
    parent.checked = false
    parent.indeterminate = true
  } else {
    parent.checked = false
    parent.indeterminate = false
  }
  updateParentsCheck(parent.parent)
}

async function toggleExpand(node: InternalTreeNode) {
  if (node.loading) return
  if (props.lazy && !node.loaded && !node.isLeaf && props.loadData) {
    node.loading = true
    try {
      const children = await props.loadData(node)
      node.children = processNodes(children, node)
      node.loaded = true
      emit('load', node)
    } finally {
      node.loading = false
    }
  }
  node.expanded = !node.expanded
  if (node.expanded) emit('expand', node)
}

function toggleCheck(node: InternalTreeNode) {
  if (node.disabled) return
  const newChecked = !node.checked
  setNodeChecked(node, newChecked)
  if (!props.checkStrictly) {
    updateChildrenCheck(node, newChecked)
    updateParentsCheck(node.parent)
  }
  emit('check', getCheckedNodes())
}

function handleSelect(node: InternalTreeNode) {
  emit('select', node)
}

function matchesFilter(node: InternalTreeNode): boolean {
  if (!filterText.value) return true
  return node.label.toLowerCase().includes(filterText.value)
}

function visibleNode(node: InternalTreeNode): boolean {
  if (!filterText.value) return true
  if (matchesFilter(node)) return true
  if (node.children && node.children.some((c) => visibleNode(c))) return true
  return false
}

function renderLabel(node: InternalTreeNode): VNode | string {
  if (!filterText.value || !matchesFilter(node)) return node.label
  const safe = filterText.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${safe})`, 'gi')
  const parts = node.label.split(regex)
  return h(
    'span',
    {},
    parts.map((part) =>
      part.toLowerCase() === filterText.value
        ? h(
            'mark',
            {
              style: {
                background: 'transparent',
                color: 'var(--mk-primary)',
                fontWeight: 600,
              },
            },
            part
          )
        : part
    )
  )
}

function renderTreeNode(node: InternalTreeNode, level: number): VNode | null {
  if (!visibleNode(node)) return null

  const hasChildren = !!node.children && node.children.length > 0
  const expandable = !node.isLeaf && (hasChildren || props.lazy)

  return h(
    'div',
    {
      class: [
        'mk-tree-node',
        { 'is-disabled': node.disabled, 'is-leaf': !expandable },
      ],
    },
    [
      h(
        'div',
        {
          class: 'mk-tree-node__content',
          style: { paddingLeft: `${level * 18}px` },
        },
        [
          h(
            'span',
            {
              class: ['mk-tree-node__arrow', { 'is-expanded': node.expanded }],
              onClick: (e: Event) => {
                e.stopPropagation()
                if (expandable) toggleExpand(node)
              },
            },
            expandable ? '▶' : ''
          ),
          props.showCheckbox
            ? h('span', {
                class: [
                  'mk-tree-node__checkbox',
                  {
                    'is-checked': node.checked,
                    'is-indeterminate': node.indeterminate,
                  },
                ],
                onClick: (e: Event) => {
                  e.stopPropagation()
                  toggleCheck(node)
                },
              })
            : null,
          h(
            'span',
            {
              class: 'mk-tree-node__label',
              onClick: () => handleSelect(node),
            },
            renderLabel(node)
          ),
          node.loading ? h('span', { class: 'mk-tree-node__loading' }) : null,
        ]
      ),
      node.expanded && hasChildren
        ? h(
            'div',
            { class: 'mk-tree-node__children' },
            node.children!.map((child) => renderTreeNode(child, level + 1))
          )
        : null,
    ]
  )
}

const renderRoot = computed(() =>
  h(
    'div',
    { class: 'mk-tree' },
    nodes.value.map((n) => renderTreeNode(n, 0))
  )
)
</script>

<template>
  <component :is="renderRoot" />
</template>

<style scoped>
.mk-tree {
  font-size: 13px;
  color: var(--mk-text);
}

.mk-tree-node {
  user-select: none;
}

.mk-tree-node__content {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  cursor: pointer;
  transition: var(--mk-transition);
  border-radius: var(--mk-radius);
}

.mk-tree-node__content:hover {
  background: var(--mk-surface-hover);
}

.mk-tree-node__arrow {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--mk-text-secondary);
  transition: transform 0.2s;
  cursor: pointer;
  flex-shrink: 0;
}

.mk-tree-node__arrow.is-expanded {
  transform: rotate(90deg);
}

.mk-tree-node.is-leaf .mk-tree-node__arrow {
  visibility: hidden;
}

.mk-tree-node__checkbox {
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--mk-border);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--mk-transition);
  flex-shrink: 0;
  background: var(--mk-surface);
  cursor: pointer;
}

.mk-tree-node__checkbox.is-checked {
  background: var(--mk-primary);
  border-color: var(--mk-primary);
}

.mk-tree-node__checkbox.is-checked::after {
  content: '✓';
  color: var(--mk-text-inverse);
  font-size: 11px;
}

.mk-tree-node__checkbox.is-indeterminate {
  background: var(--mk-primary);
  border-color: var(--mk-primary);
}

.mk-tree-node__checkbox.is-indeterminate::after {
  content: '';
  width: 8px;
  height: 2px;
  background: var(--mk-text-inverse);
  border-radius: 1px;
}

.mk-tree-node.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.mk-tree-node.is-disabled .mk-tree-node__content {
  cursor: not-allowed;
}

.mk-tree-node__label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mk-tree-node__loading {
  width: 12px;
  height: 12px;
  border: 2px solid var(--mk-border);
  border-top-color: var(--mk-primary);
  border-radius: 50%;
  animation: mk-tree-spin 0.8s linear infinite;
}

@keyframes mk-tree-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
