import './tree.css'

export interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
  disabled?: boolean
  isLeaf?: boolean
  expanded?: boolean
  checked?: boolean
}

export interface TreeOptions {
  data: TreeNode[]
  showCheckbox?: boolean
  checkStrictly?: boolean
  lazy?: boolean
  loadData?: (node: TreeNode) => Promise<TreeNode[]>
  filter?: string
  onSelect?: (node: TreeNode) => void
  onCheck?: (nodes: TreeNode[]) => void
  onExpand?: (node: TreeNode) => void
}

interface InternalTreeNode extends TreeNode {
  parent?: InternalTreeNode
  indeterminate?: boolean
  loading?: boolean
  loaded?: boolean
}

export class MkTree {
  el: HTMLDivElement
  private options: TreeOptions
  private nodes: InternalTreeNode[]
  private nodeMap = new Map<string, InternalTreeNode>()

  constructor(container: HTMLElement | string, options: TreeOptions) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.options = {
      showCheckbox: false,
      checkStrictly: false,
      lazy: false,
      ...options,
    }

    this.nodes = this.processNodes(this.options.data)

    this.el = document.createElement('div')
    this.el.className = 'mk-tree'

    this.render()
    parent.appendChild(this.el)
  }

  private processNodes(
    data: TreeNode[],
    parent?: InternalTreeNode
  ): InternalTreeNode[] {
    return data.map((n) => {
      const node: InternalTreeNode = {
        ...n,
        parent,
        indeterminate: false,
        loading: false,
        loaded:
          !this.options.lazy || !!n.children || n.isLeaf,
      }
      this.nodeMap.set(node.id, node)
      if (node.children) {
        node.children = this.processNodes(
          node.children,
          node
        )
      }
      return node
    })
  }

  private render(): void {
    this.el.innerHTML = ''
    const filter = this.options.filter?.trim().toLowerCase()
    this.nodes.forEach((node) => {
      const el = this.createNodeElement(node, 0, filter)
      if (el) this.el.appendChild(el)
    })
  }

  private createNodeElement(
    node: InternalTreeNode,
    level: number,
    filter?: string
  ): HTMLElement | null {
    const matchesFilter =
      !filter || node.label.toLowerCase().includes(filter)
    let childMatches = false
    if (filter && node.children) {
      childMatches = node.children.some((child) =>
        this.childMatchesFilter(child, filter)
      )
    }
    if (filter && !matchesFilter && !childMatches) {
      return null
    }

    const nodeEl = document.createElement('div')
    nodeEl.className = 'mk-tree-node'
    if (node.disabled) nodeEl.classList.add('is-disabled')
    if (!node.children || node.children.length === 0)
      nodeEl.classList.add('is-leaf')
    if (matchesFilter && filter)
      nodeEl.classList.add('is-filtered')

    const content = document.createElement('div')
    content.className = 'mk-tree-node__content'
    content.style.paddingLeft = `${level * 18}px`

    const arrow = document.createElement('span')
    arrow.className = 'mk-tree-node__arrow'
    if (node.expanded) arrow.classList.add('is-expanded')
    if (!node.isLeaf && (node.children?.length || this.options.lazy)) {
      arrow.textContent = '▶'
      arrow.addEventListener('click', (e) => {
        e.stopPropagation()
        this.toggleExpand(node)
      })
    }
    content.appendChild(arrow)

    if (this.options.showCheckbox) {
      const checkbox = document.createElement('span')
      checkbox.className = 'mk-tree-node__checkbox'
      if (node.checked) checkbox.classList.add('is-checked')
      if (node.indeterminate)
        checkbox.classList.add('is-indeterminate')
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation()
        this.toggleCheck(node)
      })
      content.appendChild(checkbox)
    }

    const label = document.createElement('span')
    label.className = 'mk-tree-node__label'
    if (matchesFilter && filter) {
      const safeFilter = filter.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      )
      const regex = new RegExp(`(${safeFilter})`, 'gi')
      label.innerHTML = node.label.replace(
        regex,
        '<mark>$1</mark>'
      )
    } else {
      label.textContent = node.label
    }
    label.addEventListener('click', () => {
      this.options.onSelect?.(node)
    })
    content.appendChild(label)

    if (node.loading) {
      const spinner = document.createElement('span')
      spinner.className = 'mk-tree-node__loading'
      content.appendChild(spinner)
    }

    nodeEl.appendChild(content)

    if (
      node.children &&
      node.children.length > 0 &&
      node.expanded
    ) {
      const childrenEl = document.createElement('div')
      childrenEl.className = 'mk-tree-node__children'
      node.children.forEach((child) => {
        const childEl = this.createNodeElement(
          child as InternalTreeNode,
          level + 1,
          filter
        )
        if (childEl) childrenEl.appendChild(childEl)
      })
      nodeEl.appendChild(childrenEl)
    }

    return nodeEl
  }

  private childMatchesFilter(
    node: InternalTreeNode,
    filter: string
  ): boolean {
    if (node.label.toLowerCase().includes(filter)) return true
    if (node.children) {
      return node.children.some((child) =>
        this.childMatchesFilter(child as InternalTreeNode, filter)
      )
    }
    return false
  }

  private async toggleExpand(node: InternalTreeNode): Promise<void> {
    if (node.loading) return
    if (
      this.options.lazy &&
      !node.loaded &&
      !node.isLeaf &&
      this.options.loadData
    ) {
      node.loading = true
      this.render()
      try {
        const children = await this.options.loadData(node)
        node.children = this.processNodes(children, node)
        node.loaded = true
      } finally {
        node.loading = false
      }
    }
    node.expanded = !node.expanded
    this.render()
    if (node.expanded) {
      this.options.onExpand?.(node)
    }
  }

  private toggleCheck(node: InternalTreeNode): void {
    if (node.disabled) return
    const newChecked = !node.checked
    this.setNodeChecked(node, newChecked)
    if (!this.options.checkStrictly) {
      this.updateChildrenCheck(node, newChecked)
      this.updateParentsCheck(node.parent)
    }
    this.render()
    this.options.onCheck?.(this.getCheckedNodes())
  }

  private setNodeChecked(
    node: InternalTreeNode,
    checked: boolean
  ): void {
    node.checked = checked
    node.indeterminate = false
  }

  private updateChildrenCheck(
    node: InternalTreeNode,
    checked: boolean
  ): void {
    if (!node.children) return
    node.children.forEach((child) => {
      const c = child as InternalTreeNode
      if (!c.disabled) {
        this.setNodeChecked(c, checked)
        this.updateChildrenCheck(c, checked)
      }
    })
  }

  private updateParentsCheck(parent?: InternalTreeNode): void {
    if (!parent) return
    const children = parent.children as InternalTreeNode[] | undefined
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
    this.updateParentsCheck(parent.parent)
  }

  private getCheckedNodes(): TreeNode[] {
    const result: TreeNode[] = []
    const collect = (nodes: InternalTreeNode[]) => {
      nodes.forEach((n) => {
        if (n.checked) result.push(n)
        if (n.children)
          collect(n.children as InternalTreeNode[])
      })
    }
    collect(this.nodes)
    return result
  }

  setData(data: TreeNode[]): void {
    this.nodes = this.processNodes(data)
    this.render()
  }

  setFilter(filter: string): void {
    this.options.filter = filter
    this.render()
  }

  destroy(): void {
    this.el.remove()
  }
}

export function createTree(
  container: HTMLElement | string,
  options: TreeOptions
): MkTree {
  return new MkTree(container, options)
}
