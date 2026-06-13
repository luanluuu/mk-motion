import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { spring, elasticScale, elasticMove } from '../../gesture/spring'
import { Draggable } from '../../gesture/draggable'
import { TapRecognizer } from '../../gesture/tap'

describe('gesture/spring', () => {
  let rafCallbacks: FrameRequestCallback[] = []
  let rafId = 0

  beforeEach(() => {
    rafCallbacks = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb)
      return ++rafId
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function flushFrames(count = 100) {
    for (let i = 0; i < count; i++) {
      const callbacks = [...rafCallbacks]
      rafCallbacks = []
      callbacks.forEach((cb) => cb(performance.now()))
    }
  }

  it('springs from start to end value', () => {
    const onUpdate = vi.fn()
    const onComplete = vi.fn()

    spring(
      { from: 0, to: 100, onUpdate, onComplete },
      { stiffness: 170, damping: 26, precision: 0.5 }
    )
    flushFrames(200)

    expect(onUpdate).toHaveBeenCalled()
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0]
    expect(lastCall).toBeCloseTo(100, 0)
    expect(onComplete).toHaveBeenCalled()
  })

  it('stop callback halts the spring', () => {
    const onUpdate = vi.fn()
    const stop = spring(
      { from: 0, to: 100, onUpdate },
      { stiffness: 170, damping: 26 }
    )

    stop()
    const callsBefore = onUpdate.mock.calls.length
    flushFrames(10)
    expect(onUpdate.mock.calls.length).toBe(callsBefore)
  })

  it('elasticScale updates transform scale', () => {
    const el = document.createElement('div')
    const stop = elasticScale(el, 1.5, {
      stiffness: 170,
      damping: 26,
      precision: 0.5,
    })
    flushFrames(200)
    expect(el.style.transform).toContain('scale')
    stop()
  })

  it('elasticMove updates transform translate', () => {
    const el = document.createElement('div')
    const stop = elasticMove(el, 100, 50, {
      stiffness: 170,
      damping: 26,
      precision: 0.5,
    })
    flushFrames(200)
    expect(el.style.transform).toContain('translate3d')
    stop()
  })
})

describe('gesture/Draggable', () => {
  beforeEach(() => {
    Element.prototype.setPointerCapture = vi.fn()
    Element.prototype.releasePointerCapture = vi.fn()
  })

  it('constructs from an HTMLElement', () => {
    const el = document.createElement('div')
    const draggable = new Draggable(el)
    expect(draggable).toBeInstanceOf(Draggable)
    expect(el.style.touchAction).toBe('none')
    draggable.destroy()
  })

  it('throws when element is not found', () => {
    expect(() => new Draggable('#non-existent')).toThrow(
      'Draggable: element not found'
    )
  })

  it('calls onStart, onDrag and onEnd during pointer gesture', () => {
    const el = document.createElement('div')
    const onStart = vi.fn()
    const onDrag = vi.fn()
    const onEnd = vi.fn()

    const draggable = new Draggable(el, { onStart, onDrag, onEnd })

    el.dispatchEvent(
      new PointerEvent('pointerdown', {
        clientX: 0,
        clientY: 0,
        pointerId: 1,
        bubbles: true,
      })
    )
    expect(onStart).toHaveBeenCalled()

    el.dispatchEvent(
      new PointerEvent('pointermove', {
        clientX: 50,
        clientY: 30,
        pointerId: 1,
        bubbles: true,
      })
    )
    expect(onDrag).toHaveBeenCalledWith(50, 30)
    expect(el.style.transform).toBe('translate3d(50px, 30px, 0)')

    el.dispatchEvent(
      new PointerEvent('pointerup', {
        clientX: 50,
        clientY: 30,
        pointerId: 1,
        bubbles: true,
      })
    )
    expect(onEnd).toHaveBeenCalledWith(50, 30)

    draggable.destroy()
  })

  it('respects axis option', () => {
    const el = document.createElement('div')
    const onDrag = vi.fn()

    const draggable = new Draggable(el, { axis: 'x', onDrag })

    el.dispatchEvent(
      new PointerEvent('pointerdown', {
        clientX: 0,
        clientY: 0,
        pointerId: 1,
        bubbles: true,
      })
    )
    el.dispatchEvent(
      new PointerEvent('pointermove', {
        clientX: 40,
        clientY: 20,
        pointerId: 1,
        bubbles: true,
      })
    )

    expect(onDrag).toHaveBeenCalledWith(40, 0)
    expect(el.style.transform).toBe('translate3d(40px, 0px, 0)')

    draggable.destroy()
  })
})

describe('gesture/TapRecognizer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Element.prototype.setPointerCapture = vi.fn()
    Element.prototype.releasePointerCapture = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls onTap for a quick tap', () => {
    const el = document.createElement('div')
    const onTap = vi.fn()
    const recognizer = new TapRecognizer(el, { onTap })

    el.dispatchEvent(
      new PointerEvent('pointerdown', {
        clientX: 0,
        clientY: 0,
        pointerId: 1,
        bubbles: true,
      })
    )
    el.dispatchEvent(
      new PointerEvent('pointerup', {
        clientX: 0,
        clientY: 0,
        pointerId: 1,
        bubbles: true,
      })
    )

    expect(onTap).toHaveBeenCalled()
    recognizer.destroy()
  })

  it('calls onLongPress after delay', () => {
    const el = document.createElement('div')
    const onLongPress = vi.fn()
    const recognizer = new TapRecognizer(el, {
      onLongPress,
      longPressDelay: 200,
    })

    el.dispatchEvent(
      new PointerEvent('pointerdown', {
        clientX: 0,
        clientY: 0,
        pointerId: 1,
        bubbles: true,
      })
    )
    expect(onLongPress).not.toHaveBeenCalled()

    vi.advanceTimersByTime(250)
    expect(onLongPress).toHaveBeenCalled()

    recognizer.destroy()
  })

  it('cancels long press on pointer move', () => {
    const el = document.createElement('div')
    const onLongPress = vi.fn()
    const recognizer = new TapRecognizer(el, {
      onLongPress,
      longPressDelay: 200,
    })

    el.dispatchEvent(
      new PointerEvent('pointerdown', {
        clientX: 0,
        clientY: 0,
        pointerId: 1,
        bubbles: true,
      })
    )
    el.dispatchEvent(
      new PointerEvent('pointermove', {
        clientX: 20,
        clientY: 20,
        pointerId: 1,
        bubbles: true,
      })
    )

    vi.advanceTimersByTime(250)
    expect(onLongPress).not.toHaveBeenCalled()

    recognizer.destroy()
  })
})
