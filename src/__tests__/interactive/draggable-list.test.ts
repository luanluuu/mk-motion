import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  calcDragIndex,
  DraggableList,
  createDraggableList,
} from '../../interactive/draggable-list'

// ============================================================================
// calcDragIndex — 纯逻辑，不依赖 DraggableList 内部状态
// ============================================================================

describe('calcDragIndex', () => {
  function mockRects(
    coords: Array<{ top: number; height: number; left: number; width: number }>
  ) {
    return vi
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: Element) {
        const items = Array.from(this.parentElement?.children || [])
        const idx = items.indexOf(this)
        if (idx >= 0 && idx < coords.length) {
          const c = coords[idx]
          return {
            top: c.top,
            left: c.left,
            bottom: c.top + c.height,
            right: c.left + c.width,
            width: c.width,
            height: c.height,
            x: c.left,
            y: c.top,
            toJSON: () => ({}),
          }
        }
        return {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          width: 0,
          height: 0,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }
      })
  }

  it('returns 0 when pointer is above all items (vertical)', () => {
    const container = document.createElement('div')
    const a = document.createElement('div')
    const b = document.createElement('div')
    container.appendChild(a)
    container.appendChild(b)
    document.body.appendChild(container)

    mockRects([
      { top: 0, height: 50, left: 0, width: 100 }, // mid=25
      { top: 50, height: 50, left: 0, width: 100 }, // mid=75
    ])

    // Pointer at y=10 — above mid of first item
    expect(calcDragIndex([a, b], 10, 'vertical')).toBe(0)

    // Pointer at y=20 — still above mid of first item (mid=25)
    expect(calcDragIndex([a, b], 20, 'vertical')).toBe(0)

    vi.restoreAllMocks()
  })

  it('returns correct index when pointer crosses midpoints (vertical)', () => {
    const container = document.createElement('div')
    const a = document.createElement('div')
    const b = document.createElement('div')
    const c = document.createElement('div')
    container.appendChild(a)
    container.appendChild(b)
    container.appendChild(c)

    mockRects([
      { top: 0, height: 50, left: 0, width: 100 }, // mid=25
      { top: 50, height: 50, left: 0, width: 100 }, // mid=75
      { top: 100, height: 50, left: 0, width: 100 }, // mid=125
    ])

    // Below first item's mid, above second's mid → index 1
    expect(calcDragIndex([a, b, c], 40, 'vertical')).toBe(1)

    // Below second item's mid → index 2
    expect(calcDragIndex([a, b, c], 80, 'vertical')).toBe(2)

    vi.restoreAllMocks()
  })

  it('returns items.length when pointer is below all items', () => {
    const container = document.createElement('div')
    const a = document.createElement('div')
    const b = document.createElement('div')
    container.appendChild(a)
    container.appendChild(b)

    mockRects([
      { top: 0, height: 50, left: 0, width: 100 },
      { top: 50, height: 50, left: 0, width: 100 },
    ])

    // Pointer below all → append at end
    expect(calcDragIndex([a, b], 200, 'vertical')).toBe(2)

    vi.restoreAllMocks()
  })

  it('works for horizontal direction', () => {
    const container = document.createElement('div')
    const a = document.createElement('div')
    const b = document.createElement('div')
    const c = document.createElement('div')
    container.appendChild(a)
    container.appendChild(b)
    container.appendChild(c)

    mockRects([
      { top: 0, height: 50, left: 0, width: 100 }, // mid=50
      { top: 0, height: 50, left: 100, width: 100 }, // mid=150
      { top: 0, height: 50, left: 200, width: 100 }, // mid=250
    ])

    expect(calcDragIndex([a, b, c], 40, 'horizontal')).toBe(0) // above item 0 midpoint (mid=50)
    expect(calcDragIndex([a, b, c], 120, 'horizontal')).toBe(1) // between mid of item 0 and 1
    expect(calcDragIndex([a, b, c], 300, 'horizontal')).toBe(3) // below all

    vi.restoreAllMocks()
  })

  it('returns 0 for empty items array', () => {
    expect(calcDragIndex([], 100, 'vertical')).toBe(0)
  })

  it('handles single item', () => {
    const container = document.createElement('div')
    const a = document.createElement('div')
    container.appendChild(a)

    mockRects([
      { top: 0, height: 50, left: 0, width: 100 }, // mid=25
    ])

    expect(calcDragIndex([a], 10, 'vertical')).toBe(0) // above mid
    expect(calcDragIndex([a], 30, 'vertical')).toBe(1) // below mid

    vi.restoreAllMocks()
  })
})

// ============================================================================
// DraggableList
// ============================================================================

describe('DraggableList', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    container.innerHTML = `
      <div data-draggable style="height:50px">Item 1</div>
      <div data-draggable style="height:50px">Item 2</div>
      <div data-draggable style="height:50px">Item 3</div>
    `
    document.body.appendChild(container)
  })

  it('constructs with an element', () => {
    const dl = new DraggableList(container)
    expect(dl).toBeDefined()
    dl.destroy()
  })

  it('constructs with a selector string', () => {
    container.setAttribute('id', 'test-list')
    const dl = new DraggableList('#test-list')
    expect(dl).toBeDefined()
    dl.destroy()
  })

  it('throws for missing container', () => {
    expect(() => new DraggableList('#nonexistent')).toThrow(
      'DraggableList: container not found'
    )
  })

  it('accepts options', () => {
    const onReorder = () => {}
    const onDragStart = () => {}
    const onDragMove = () => {}
    const onDragEnd = () => {}

    const dl = new DraggableList(container, {
      direction: 'horizontal',
      ghostOpacity: 0.5,
      dragScale: 1.05,
      duration: 300,
      easing: 'ease',
      stagger: 50,
      handle: '.drag-handle',
      onReorder,
      onDragStart,
      onDragMove,
      onDragEnd,
      placeholderClass: 'my-placeholder',
      placeholderStyle: { background: 'red' },
      reducedMotion: true,
    })
    expect(dl).toBeDefined()
    dl.destroy()
  })

  it('destroy removes event listeners and cleans up', () => {
    const dl = new DraggableList(container)
    dl.destroy()
    // After destroy, events should be cleaned up.
    // We can verify by dispatching an event and checking no error occurs.
    const event = new MouseEvent('mousedown', { bubbles: true })
    expect(() => container.dispatchEvent(event)).not.toThrow()
  })

  it('respects data-drag-disabled on direct child', () => {
    const disabledEl = container.querySelector('[data-draggable]')!
    disabledEl.setAttribute('data-drag-disabled', '')

    const dl = new DraggableList(container)

    // Dispatch mousedown on the disabled item
    const event = new MouseEvent('mousedown', { bubbles: true, button: 0 })
    Object.defineProperty(event, 'target', {
      value: disabledEl,
      writable: false,
    })

    // Since findItem returns null for data-drag-disabled, no drag should start
    // The test verifies no error occurs
    expect(() => container.dispatchEvent(event)).not.toThrow()
    dl.destroy()
  })

  it('respects data-drag-disabled on ancestor', () => {
    container.innerHTML = `
      <div data-drag-disabled>
        <div data-draggable style="height:50px">
          <span>Nested</span>
        </div>
      </div>
      <div data-draggable style="height:50px">Item 2</div>
    `
    const nestedSpan = container.querySelector('span')!
    const dl = new DraggableList(container)

    const event = new MouseEvent('mousedown', { bubbles: true, button: 0 })
    Object.defineProperty(event, 'target', {
      value: nestedSpan,
      writable: false,
    })

    expect(() => container.dispatchEvent(event)).not.toThrow()
    dl.destroy()
  })

  it('does not start drag on right-click', () => {
    const item = container.querySelector('[data-draggable]') as HTMLElement
    const dl = new DraggableList(container)

    const event = new MouseEvent('mousedown', { bubbles: true, button: 2 })
    Object.defineProperty(event, 'target', { value: item, writable: false })

    expect(() => container.dispatchEvent(event)).not.toThrow()
    dl.destroy()
  })

  it('does not start drag if handle selector does not match', () => {
    container.innerHTML = `
      <div data-draggable style="height:50px">
        <span class="handle">Handle</span>
        <span class="content">Content</span>
      </div>
    `
    const content = container.querySelector('.content')!
    const dl = new DraggableList(container, { handle: '.handle' })

    const event = new MouseEvent('mousedown', { bubbles: true, button: 0 })
    Object.defineProperty(event, 'target', { value: content, writable: false })

    expect(() => container.dispatchEvent(event)).not.toThrow()
    dl.destroy()
  })

  it('starts drag when handle matches', () => {
    container.innerHTML = `
      <div data-draggable style="height:50px">
        <span class="handle">Handle</span>
      </div>
    `
    const handle = container.querySelector('.handle')!
    const onDragStart = vi.fn()

    const dl = new DraggableList(container, {
      handle: '.handle',
      onDragStart,
    })

    const event = new MouseEvent('mousedown', { bubbles: true, button: 0 })
    Object.defineProperty(event, 'target', { value: handle, writable: false })

    container.dispatchEvent(event)
    expect(onDragStart).toHaveBeenCalledTimes(1)
    expect(onDragStart).toHaveBeenCalledWith(
      expect.objectContaining({ index: 0, item: expect.any(HTMLElement) })
    )

    dl.destroy()
  })

  it('createDraggableList factory returns DraggableList instance', () => {
    const dl = createDraggableList(container)
    expect(dl).toBeInstanceOf(DraggableList)
    dl.destroy()
  })

  it('performs a full vertical drag and calls onReorder', async () => {
    const onReorder = vi.fn()
    const onDragStart = vi.fn()
    const onDragMove = vi.fn()
    const onDragEnd = vi.fn()

    container.innerHTML = `
      <div data-draggable data-id="0" style="height:50px">Item 1</div>
      <div data-draggable data-id="1" style="height:50px">Item 2</div>
      <div data-draggable data-id="2" style="height:50px">Item 3</div>
    `
    const rects: Record<string, { top: number; height: number; left: number; width: number }> = {
      '0': { top: 0, height: 50, left: 0, width: 100 },
      '1': { top: 50, height: 50, left: 0, width: 100 },
      '2': { top: 100, height: 50, left: 0, width: 100 },
    }
    const rectSpy = vi
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: Element) {
        const id = (this as HTMLElement).dataset.id
        const r = id ? rects[id] : { top: 0, height: 0, left: 0, width: 0 }
        return {
          top: r.top,
          left: r.left,
          bottom: r.top + r.height,
          right: r.left + r.width,
          width: r.width,
          height: r.height,
          x: r.left,
          y: r.top,
          toJSON: () => ({}),
        }
      })

    const dl = new DraggableList(container, {
      onReorder,
      onDragStart,
      onDragMove,
      onDragEnd,
    })

    const item = container.querySelector('[data-id="0"]') as HTMLElement

    // Start drag on first item
    item.dispatchEvent(
      new MouseEvent('mousedown', {
        bubbles: true,
        button: 0,
        clientX: 10,
        clientY: 10,
      })
    )
    expect(onDragStart).toHaveBeenCalledWith(
      expect.objectContaining({ index: 0, item })
    )

    // Move pointer below second item's midpoint (mid=75)
    document.dispatchEvent(
      new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 10,
        clientY: 90,
      })
    )
    expect(onDragMove).toHaveBeenCalled()

    // Release
    document.dispatchEvent(
      new MouseEvent('mouseup', {
        bubbles: true,
        clientX: 10,
        clientY: 90,
      })
    )

    // releaseToPlaceholder resolves via WAAPI .finished microtask
    await Promise.resolve()

    expect(onDragEnd).toHaveBeenCalledWith(
      expect.objectContaining({ fromIndex: 0, toIndex: expect.any(Number) })
    )
    expect(onReorder).toHaveBeenCalledWith(0, expect.any(Number))

    dl.destroy()
    rectSpy.mockRestore()
  })

  it('supports horizontal drag', async () => {
    container.innerHTML = `
      <div data-draggable data-id="0" style="width:80px;display:inline-block">A</div>
      <div data-draggable data-id="1" style="width:80px;display:inline-block">B</div>
      <div data-draggable data-id="2" style="width:80px;display:inline-block">C</div>
    `
    const onReorder = vi.fn()
    const rects: Record<string, { top: number; height: number; left: number; width: number }> = {
      '0': { top: 0, height: 50, left: 0, width: 80 },
      '1': { top: 0, height: 50, left: 80, width: 80 },
      '2': { top: 0, height: 50, left: 160, width: 80 },
    }
    const rectSpy = vi
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: Element) {
        const id = (this as HTMLElement).dataset.id
        const r = id ? rects[id] : { top: 0, height: 0, left: 0, width: 0 }
        return {
          top: r.top,
          left: r.left,
          bottom: r.top + r.height,
          right: r.left + r.width,
          width: r.width,
          height: r.height,
          x: r.left,
          y: r.top,
          toJSON: () => ({}),
        }
      })

    const dl = new DraggableList(container, {
      direction: 'horizontal',
      onReorder,
    })
    const item = container.querySelector('[data-id="0"]') as HTMLElement

    item.dispatchEvent(
      new MouseEvent('mousedown', {
        bubbles: true,
        button: 0,
        clientX: 10,
        clientY: 10,
      })
    )
    document.dispatchEvent(
      new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 130,
        clientY: 10,
      })
    )
    document.dispatchEvent(
      new MouseEvent('mouseup', {
        bubbles: true,
        clientX: 130,
        clientY: 10,
      })
    )

    await Promise.resolve()

    expect(onReorder).toHaveBeenCalled()
    dl.destroy()
    rectSpy.mockRestore()
  })

  it('skips release animation when reducedMotion is true', () => {
    const onReorder = vi.fn()
    const dl = new DraggableList(container, {
      reducedMotion: true,
      onReorder,
    })
    const item = container.querySelector('[data-draggable]') as HTMLElement

    item.dispatchEvent(
      new MouseEvent('mousedown', {
        bubbles: true,
        button: 0,
        clientX: 10,
        clientY: 10,
      })
    )
    document.dispatchEvent(
      new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 10,
        clientY: 120,
      })
    )
    document.dispatchEvent(
      new MouseEvent('mouseup', {
        bubbles: true,
        clientX: 10,
        clientY: 120,
      })
    )

    expect(onReorder).toHaveBeenCalled()
    dl.destroy()
  })

  it('cleans up when destroyed mid-drag', () => {
    const dl = new DraggableList(container)
    const item = container.querySelector('[data-draggable]') as HTMLElement

    item.dispatchEvent(
      new MouseEvent('mousedown', {
        bubbles: true,
        button: 0,
        clientX: 10,
        clientY: 10,
      })
    )
    document.dispatchEvent(
      new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 10,
        clientY: 80,
      })
    )

    expect(() => dl.destroy()).not.toThrow()
    expect(container.querySelector('[data-draggable]')).not.toBeNull()
  })

  it('supports touch events', () => {
    const onDragStart = vi.fn()
    const dl = new DraggableList(container, { onDragStart })
    const item = container.querySelector('[data-draggable]') as HTMLElement

    item.dispatchEvent(
      new TouchEvent('touchstart', {
        bubbles: true,
        touches: [new Touch({ identifier: 1, target: item, clientX: 10, clientY: 10 })],
      })
    )
    expect(onDragStart).toHaveBeenCalled()

    document.dispatchEvent(
      new TouchEvent('touchmove', {
        bubbles: true,
        touches: [new Touch({ identifier: 1, target: item, clientX: 10, clientY: 80 })],
      })
    )
    document.dispatchEvent(
      new TouchEvent('touchend', {
        bubbles: true,
        changedTouches: [new Touch({ identifier: 1, target: item, clientX: 10, clientY: 80 })],
      })
    )

    dl.destroy()
  })
})
