import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  SpringValue,
  SpringAnimation,
  parseColor,
  formatColor,
  parseTransformValue,
  springTo,
  springFromTo,
  springSequence,
  springParallel,
  springStagger,
} from '../../core/spring-engine'

// ============================================================================
// SpringValue — 纯物理模拟（不依赖 DOM）
// ============================================================================

describe('SpringValue', () => {
  it('initializes with from value, target, and velocity=0', () => {
    const s = new SpringValue(0, 100)
    const st = s.getState()
    expect(st.current).toBe(0)
    expect(st.target).toBe(100)
    expect(st.velocity).toBe(0)
    expect(st.done).toBe(false)
  })

  it('tick moves current toward target (positive direction)', () => {
    const s = new SpringValue(0, 100)
    const st = s.tick(0.016) // ~60fps
    expect(st.current).toBeGreaterThan(0)
    expect(st.current).toBeLessThan(100)
    expect(st.done).toBe(false)
  })

  it('tick moves current toward target (negative direction)', () => {
    const s = new SpringValue(100, 0)
    const st = s.tick(0.016)
    expect(st.current).toBeLessThan(100)
    expect(st.current).toBeGreaterThanOrEqual(0)
  })

  it('eventually settles at target with done=true', () => {
    const s = new SpringValue(0, 100, { precision: 0.5 })
    for (let i = 0; i < 1000; i++) {
      const st = s.tick(0.016)
      if (st.done) break
    }
    const final = s.getState()
    expect(final.done).toBe(true)
    expect(final.current).toBe(100)
    expect(final.velocity).toBe(0)
  })

  it('respects precision option', () => {
    const s1 = new SpringValue(0, 100, { precision: 0.01 })
    // With high precision, it takes many more ticks
    let ticks1 = 0
    for (let i = 0; i < 2000; i++) {
      const st = s1.tick(0.016)
      ticks1++
      if (st.done) break
    }
    expect(s1.getState().done).toBe(true)

    const s2 = new SpringValue(0, 100, { precision: 5 })
    let ticks2 = 0
    for (let i = 0; i < 2000; i++) {
      const st = s2.tick(0.016)
      ticks2++
      if (st.done) break
    }
    expect(s2.getState().done).toBe(true)
    expect(ticks2).toBeLessThanOrEqual(ticks1)
  })

  it('setTarget changes target and resets done', () => {
    const s = new SpringValue(0, 100)
    // Settle first
    for (let i = 0; i < 1000; i++) {
      if (s.tick(0.016).done) break
    }
    expect(s.getState().done).toBe(true)

    s.setTarget(200)
    expect(s.getState().target).toBe(200)
    expect(s.getState().done).toBe(false)
  })

  it('setValue sets current and resets velocity', () => {
    const s = new SpringValue(0, 100)
    s.tick(0.016)
    expect(s.getState().velocity).not.toBe(0)

    s.setValue(50)
    const st = s.getState()
    expect(st.current).toBe(50)
    expect(st.velocity).toBe(0)
  })

  it('getState returns a copy, not reference', () => {
    const s = new SpringValue(0, 100)
    const st1 = s.getState()
    const st2 = s.getState()
    st1.current = 999 // mutate the copy
    expect(st2.current).not.toBe(999)
  })

  it('tick with dt=0 does not change state', () => {
    const s = new SpringValue(0, 100)
    const before = s.getState()
    s.tick(0)
    const after = s.getState()
    expect(after.current).toBe(before.current)
    expect(after.velocity).toBe(before.velocity)
  })

  it('does not move if already at target with zero velocity', () => {
    const s = new SpringValue(100, 100)
    // Constructor always sets done=false; tick will immediately set done=true
    // since displacement=0 and velocity=0 are both < precision
    s.tick(0.016)
    expect(s.getState().done).toBe(true)
    expect(s.getState().current).toBe(100)
  })

  it('overshoots with low damping', () => {
    const s = new SpringValue(0, 100, { damping: 1, stiffness: 200 })
    let maxVal = 0
    for (let i = 0; i < 500; i++) {
      const st = s.tick(0.016)
      if (st.done) break
      if (st.current > maxVal) maxVal = st.current
    }
    // Low damping should cause overshoot past target
    expect(maxVal).toBeGreaterThan(100)
  })

  it('settles quickly with high damping (critically damped)', () => {
    const s = new SpringValue(0, 100, { damping: 50, stiffness: 200 })
    let settled = false
    for (let i = 0; i < 200; i++) {
      if (s.tick(0.016).done) {
        settled = true
        break
      }
    }
    expect(settled).toBe(true)
  })

  it('heavier mass slows down acceleration', () => {
    const sLight = new SpringValue(0, 100, { mass: 0.5 })
    const sHeavy = new SpringValue(0, 100, { mass: 5 })

    // After one tick, heavier mass should have moved less
    const lightState = sLight.tick(0.016)
    const heavyState = sHeavy.tick(0.016)
    // Heavier mass → lower acceleration → smaller displacement
    expect(Math.abs(heavyState.current)).toBeLessThanOrEqual(
      Math.abs(lightState.current) + 0.001
    )
  })
})

// ============================================================================
// parseColor
// ============================================================================

describe('parseColor', () => {
  it('parses 6-digit hex', () => {
    expect(parseColor('#ff0000')).toEqual([255, 0, 0, 1])
    expect(parseColor('#00ff00')).toEqual([0, 255, 0, 1])
    expect(parseColor('#0000ff')).toEqual([0, 0, 255, 1])
  })

  it('parses 3-digit hex shorthand', () => {
    expect(parseColor('#f00')).toEqual([255, 0, 0, 1])
    expect(parseColor('#0f0')).toEqual([0, 255, 0, 1])
    expect(parseColor('#fff')).toEqual([255, 255, 255, 1])
    expect(parseColor('#000')).toEqual([0, 0, 0, 1])
  })

  it('parses rgb()', () => {
    expect(parseColor('rgb(255, 0, 0)')).toEqual([255, 0, 0, 1])
    expect(parseColor('rgb(10, 20, 30)')).toEqual([10, 20, 30, 1])
    expect(parseColor('rgb( 100 , 150 , 200 )')).toEqual([100, 150, 200, 1])
  })

  it('parses rgba()', () => {
    expect(parseColor('rgba(255, 0, 0, 0.5)')).toEqual([255, 0, 0, 0.5])
    expect(parseColor('rgba(0, 0, 0, 0)')).toEqual([0, 0, 0, 0])
    expect(parseColor('rgba(255,255,255,1)')).toEqual([255, 255, 255, 1])
  })

  it('passes through array input', () => {
    expect(parseColor([100, 200, 50])).toEqual([100, 200, 50, 1])
    expect(parseColor([10, 20, 30, 0.8])).toEqual([10, 20, 30, 0.8])
  })

  it('falls back to black for unknown strings', () => {
    expect(parseColor('not-a-color')).toEqual([0, 0, 0, 1])
  })

  it('parses CSS var() by creating a temp element', () => {
    // jsdom supports getComputedStyle, but CSS vars may not resolve
    // This test verifies the fallback path works
    const result = parseColor('var(--test-color, rgb(255, 0, 0))')
    expect(result).toBeDefined()
    expect(result).toHaveLength(4)
  })
})

// ============================================================================
// formatColor
// ============================================================================

describe('formatColor', () => {
  it('formats as rgb() when alpha >= 0.999', () => {
    expect(formatColor(255, 0, 0, 1)).toBe('rgb(255, 0, 0)')
    expect(formatColor(100, 150, 200, 0.999)).toBe('rgb(100, 150, 200)')
  })

  it('formats as rgba() when alpha < 0.999', () => {
    const result = formatColor(255, 0, 0, 0.5)
    expect(result).toContain('rgba(255, 0, 0, ')
    expect(result).toContain('0.500')
  })

  it('rounds channel values', () => {
    expect(formatColor(100.4, 150.6, 200.2, 1)).toBe('rgb(100, 151, 200)')
  })
})

// ============================================================================
// parseTransformValue
// ============================================================================

describe('parseTransformValue', () => {
  it('extracts translateX from transform string', () => {
    expect(parseTransformValue('translateX(100px)', 'translateX')).toBe(100)
    expect(parseTransformValue('translateX(50.5px)', 'translateX')).toBe(50.5)
    expect(parseTransformValue('translateX(-20px)', 'translateX')).toBe(-20)
  })

  it('extracts translateX without px unit', () => {
    expect(parseTransformValue('translateX(100)', 'translateX')).toBe(100)
  })

  it('extracts translateY', () => {
    expect(parseTransformValue('translateY(200px)', 'translateY')).toBe(200)
  })

  it('extracts scale', () => {
    expect(parseTransformValue('scale(1.5)', 'scale')).toBe(1.5)
    expect(parseTransformValue('scale(0.8)', 'scale')).toBe(0.8)
  })

  it('extracts rotate', () => {
    expect(parseTransformValue('rotate(45deg)', 'rotate')).toBe(45)
    expect(parseTransformValue('rotate(90)', 'rotate')).toBe(90)
  })

  it('extracts from shorthand translate(x, y)', () => {
    const t = 'translate(100px, 200px)'
    expect(parseTransformValue(t, 'x')).toBe(100)
    expect(parseTransformValue(t, 'translateX')).toBe(100)
    expect(parseTransformValue(t, 'y')).toBe(200)
    expect(parseTransformValue(t, 'translateY')).toBe(200)
  })

  it('extracts from translate3d(x, y, z)', () => {
    const t = 'translate3d(10px, 20px, 30px)'
    expect(parseTransformValue(t, 'x')).toBe(10)
    expect(parseTransformValue(t, 'y')).toBe(20)
    expect(parseTransformValue(t, 'z')).toBe(30)
    expect(parseTransformValue(t, 'translateZ')).toBe(30)
  })

  it('returns default 0 for missing transform string', () => {
    expect(parseTransformValue('', 'x')).toBe(0)
    expect(parseTransformValue('', 'scale')).toBe(1)
    expect(parseTransformValue('', 'rotate')).toBe(0)
  })

  it('returns default for unknown key', () => {
    expect(parseTransformValue('translateX(100px)', 'scale')).toBe(1)
    expect(parseTransformValue('scale(2)', 'x')).toBe(0)
  })

  it('handles alias keys x/translateX and y/translateY', () => {
    const t = 'translateX(50px) translateY(100px)'
    expect(parseTransformValue(t, 'x')).toBe(50)
    expect(parseTransformValue(t, 'translateX')).toBe(50)
    expect(parseTransformValue(t, 'y')).toBe(100)
    expect(parseTransformValue(t, 'translateY')).toBe(100)
  })

  it('extracts scaleX and scaleY', () => {
    expect(parseTransformValue('scaleX(1.2) scaleY(0.8)', 'scaleX')).toBe(1.2)
    expect(parseTransformValue('scaleX(1.2) scaleY(0.8)', 'scaleY')).toBe(0.8)
  })

  it('extracts rotateX and rotateY', () => {
    expect(parseTransformValue('rotateX(30deg)', 'rotateX')).toBe(30)
    expect(parseTransformValue('rotateY(45deg)', 'rotateY')).toBe(45)
  })
})

// ============================================================================
// SpringAnimation
// ============================================================================

describe('SpringAnimation', () => {
  let rafCallbacks: FrameRequestCallback[] = []
  let rafId = 0
  let time = 0

  beforeEach(() => {
    rafCallbacks = []
    rafId = 0
    time = performance.now()
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb)
      return ++rafId
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function flushUntilDone(maxFrames = 500, dt = 16) {
    for (let i = 0; i < maxFrames; i++) {
      const callbacks = [...rafCallbacks]
      rafCallbacks = []
      if (callbacks.length === 0) return
      time += dt
      callbacks.forEach((cb) => cb(time))
    }
  }

  it('constructs from an HTMLElement and throws for missing selector target', () => {
    const el = document.createElement('div')
    const anim = new SpringAnimation(el, { x: 0 }, { x: 100 })
    expect(anim).toBeInstanceOf(SpringAnimation)

    expect(
      () => new SpringAnimation('#nonexistent', { x: 0 }, { x: 100 })
    ).toThrow('SpringAnimation: target element not found')
  })

  it('plays and resolves when settled', async () => {
    const el = document.createElement('div')
    const onComplete = vi.fn()
    const onUpdate = vi.fn()

    const anim = new SpringAnimation(
      el,
      { x: 0 },
      { x: 100 },
      { stiffness: 170, damping: 26, precision: 0.5 }
    )
      .onComplete(onComplete)
      .onUpdate(onUpdate)

    const promise = anim.play()
    flushUntilDone()
    await promise

    expect(onComplete).toHaveBeenCalled()
    expect(onUpdate).toHaveBeenCalled()
    expect(el.style.transform).toContain('translateX(100px)')
  })

  it('returns the same promise when already running', async () => {
    const el = document.createElement('div')
    const anim = new SpringAnimation(el, { x: 0 }, { x: 100 })
    const p1 = anim.play()
    const p2 = anim.play()
    expect(p1).toBe(p2)
    flushUntilDone()
    await p1
  })

  it('stops animation and resolves promise', async () => {
    const el = document.createElement('div')
    const anim = new SpringAnimation(el, { x: 0 }, { x: 100 })
    const promise = anim.play()
    anim.stop()
    await promise
    expect(el.style.transform).not.toContain('translateX(100px)')
  })

  it('pauses and resumes', async () => {
    const el = document.createElement('div')
    const anim = new SpringAnimation(
      el,
      { x: 0 },
      { x: 100 },
      { stiffness: 170, damping: 26, precision: 0.5 }
    )
    const promise = anim.play()
    flushUntilDone(20)
    anim.pause()
    const pausedTransform = el.style.transform

    anim.resume()
    flushUntilDone()
    await promise
    expect(el.style.transform).toContain('translateX(100px)')
    expect(el.style.transform).not.toBe(pausedTransform)
  })

  it('seeks to a specific progress', () => {
    const el = document.createElement('div')
    const anim = new SpringAnimation(el, { x: 0 }, { x: 100 })
    anim.seek(0.5)
    expect(el.style.transform).toContain('translateX(50px)')
  })

  it('setTo changes target and plays', async () => {
    const el = document.createElement('div')
    const anim = new SpringAnimation(
      el,
      { x: 0 },
      { x: 50 },
      { stiffness: 170, damping: 26, precision: 0.5 }
    )
    const promise = anim.play()
    flushUntilDone(50)
    anim.setTo({ x: 100 })
    flushUntilDone()
    await promise
    expect(el.style.transform).toContain('translateX(100px)')
  })

  it('animates numeric properties like width and opacity', async () => {
    const el = document.createElement('div')
    const anim = new SpringAnimation(
      el,
      { width: 0, opacity: 0 },
      { width: 200, opacity: 1 },
      { stiffness: 170, damping: 26, precision: 0.5 }
    )
    const promise = anim.play()
    flushUntilDone()
    await promise
    expect(el.style.width).toBe('200px')
    expect(el.style.opacity).toBe('1')
  })

  it('animates background color', async () => {
    const el = document.createElement('div')
    const anim = new SpringAnimation(
      el,
      { backgroundColor: '#000000' },
      { backgroundColor: '#ff0000' },
      { stiffness: 170, damping: 26, precision: 0.5 }
    )
    const promise = anim.play()
    flushUntilDone()
    await promise
    expect(el.style.backgroundColor).toContain('rgb')
  })

  it('ignores unknown properties', async () => {
    const el = document.createElement('div')
    const anim = new SpringAnimation(
      el,
      { x: 0 },
      // @ts-expect-error unknown prop on purpose
      { x: 100, unknownProp: 50 }
    )
    const promise = anim.play()
    flushUntilDone()
    await promise
    expect(el.style.transform).toContain('translateX(100px)')
  })

  it('destroy stops and cleans up', () => {
    const el = document.createElement('div')
    const anim = new SpringAnimation(el, { x: 0 }, { x: 100 })
    anim.play()
    anim.destroy()
    expect(() => flushUntilDone(10)).not.toThrow()
  })
})

// ============================================================================
// Convenience functions
// ============================================================================

describe('springTo / springFromTo', () => {
  let rafCallbacks: FrameRequestCallback[] = []
  let rafId = 0
  let time = 0

  beforeEach(() => {
    rafCallbacks = []
    rafId = 0
    time = performance.now()
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb)
      return ++rafId
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function flushUntilDone(maxFrames = 500, dt = 16) {
    for (let i = 0; i < maxFrames; i++) {
      const callbacks = [...rafCallbacks]
      rafCallbacks = []
      if (callbacks.length === 0) return
      time += dt
      callbacks.forEach((cb) => cb(time))
    }
  }

  it('springTo animates from current value', async () => {
    const el = document.createElement('div')
    el.style.transform = 'translateX(10px)'
    const promise = springTo(
      el,
      { x: 100 },
      { stiffness: 170, damping: 26, precision: 0.5 }
    )
    flushUntilDone()
    await promise
    expect(el.style.transform).toContain('translateX(100px)')
  })

  it('springFromTo animates from explicit value', async () => {
    const el = document.createElement('div')
    const promise = springFromTo(
      el,
      { x: 0 },
      { x: 100 },
      { stiffness: 170, damping: 26, precision: 0.5 }
    )
    flushUntilDone()
    await promise
    expect(el.style.transform).toContain('translateX(100px)')
  })
})

describe('springSequence / springParallel / springStagger', () => {
  let rafCallbacks: FrameRequestCallback[] = []
  let rafId = 0
  let time = 0

  beforeEach(() => {
    rafCallbacks = []
    rafId = 0
    time = performance.now()
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb)
      return ++rafId
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function flushUntilDone(maxFrames = 800, dt = 16) {
    for (let i = 0; i < maxFrames; i++) {
      const callbacks = [...rafCallbacks]
      rafCallbacks = []
      if (callbacks.length === 0) return
      time += dt
      callbacks.forEach((cb) => cb(time))
    }
  }

  it('springSequence runs steps in order', async () => {
    const el = document.createElement('div')

    const promise = springSequence([
      {
        target: el,
        from: { x: 0 },
        to: { x: 50 },
        options: { stiffness: 170, damping: 26, precision: 0.5 },
      },
      {
        target: el,
        from: { x: 50 },
        to: { x: 100 },
        options: { stiffness: 170, damping: 26, precision: 0.5 },
      },
    ])
    flushUntilDone()
    await Promise.resolve()
    flushUntilDone()
    await promise
    expect(el.style.transform).toContain('translateX(100px)')
  })

  it('springParallel runs steps concurrently', async () => {
    const a = document.createElement('div')
    const b = document.createElement('div')

    const promise = springParallel([
      {
        target: a,
        from: { x: 0 },
        to: { x: 100 },
        options: { stiffness: 170, damping: 26, precision: 0.5 },
      },
      {
        target: b,
        from: { x: 0 },
        to: { x: 200 },
        options: { stiffness: 170, damping: 26, precision: 0.5 },
      },
    ])
    flushUntilDone()
    await promise
    expect(a.style.transform).toContain('translateX(100px)')
    expect(b.style.transform).toContain('translateX(200px)')
  })

  it('springStagger animates elements with delay and order', async () => {
    vi.useFakeTimers()
    const parent = document.createElement('div')
    const els = [document.createElement('div'), document.createElement('div')]
    els.forEach((el) => parent.appendChild(el))

    const promise = springStagger(
      els,
      { x: 100 },
      { delay: 10, stiffness: 170, damping: 26, precision: 0.5 }
    )
    flushUntilDone()
    vi.advanceTimersByTimeAsync(1000)
    await promise
    els.forEach((el) => {
      expect(el.style.transform).toContain('translateX(100px)')
    })
    vi.useRealTimers()
  })

  it('springStagger supports from=center and from=last', async () => {
    vi.useFakeTimers()
    const parent = document.createElement('div')
    const els = [
      document.createElement('div'),
      document.createElement('div'),
      document.createElement('div'),
    ]
    els.forEach((el) => parent.appendChild(el))

    const promise = springStagger(
      els,
      { x: 100 },
      { delay: 0, from: 'last', stiffness: 170, damping: 26, precision: 0.5 }
    )
    flushUntilDone()
    vi.advanceTimersByTimeAsync(1000)
    await promise
    els.forEach((el) => {
      expect(el.style.transform).toContain('translateX(100px)')
    })
    vi.useRealTimers()
  })
})
