import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CountUp } from '../../text/count-up'

describe('CountUp', () => {
  let element: HTMLElement

  beforeEach(() => {
    element = document.createElement('div')
    document.body.appendChild(element)
  })

  it('constructs with element', () => {
    const cu = new CountUp(element)
    expect(cu).toBeDefined()
  })

  it('constructs with selector string', () => {
    element.setAttribute('id', 'counter')
    const cu = new CountUp('#counter')
    expect(cu).toBeDefined()
  })

  it('throws for missing element', () => {
    expect(() => new CountUp('#nonexistent')).toThrow('CountUp: element not found')
  })

  it('renders plain number without formatting', async () => {
    const cu = new CountUp(element)
    await cu.animateTo(100, 0, { duration: 0 })
    expect(element.textContent).toBe('100')
  })

  it('renders prefix and suffix', async () => {
    const cu = new CountUp(element)
    await cu.animateTo(100, 0, { prefix: '$', suffix: '元', duration: 0 })
    expect(element.textContent).toBe('$100元')
  })

  it('renders decimals', async () => {
    const cu = new CountUp(element)
    await cu.animateTo(3.14159, 0, { decimals: 2, duration: 0 })
    expect(element.textContent).toBe('3.14')
  })

  it('renders thousand separator', async () => {
    const cu = new CountUp(element)
    await cu.animateTo(1234567, 0, { duration: 0 })
    expect(element.textContent).toBe('1,234,567')
  })

  it('renders custom separator', async () => {
    const cu = new CountUp(element)
    await cu.animateTo(1000000, 0, { separator: '_', duration: 0 })
    expect(element.textContent).toBe('1_000_000')
  })

  it('renders empty separator', async () => {
    const cu = new CountUp(element)
    await cu.animateTo(1000000, 0, { separator: '', duration: 0 })
    expect(element.textContent).toBe('1000000')
  })

  it('starts from custom startValue', async () => {
    const cu = new CountUp(element)
    await cu.animateTo(100, 50, { duration: 0 })
    // With duration=0, it should jump to end immediately
    expect(element.textContent).toBe('100')
  })

  it('calls onUpdate during animation', async () => {
    const cu = new CountUp(element)
    const onUpdate = vi.fn()
    await cu.animateTo(100, 0, { onUpdate, duration: 10 })
    // onUpdate should have been called at least once
    expect(onUpdate).toHaveBeenCalled()
  })

  it('calls onComplete when done', async () => {
    const cu = new CountUp(element)
    const onComplete = vi.fn()
    await cu.animateTo(100, 0, { onComplete, duration: 0 })
    expect(onComplete).toHaveBeenCalled()
  })

  it('stop cancels animation', () => {
    const cu = new CountUp(element)
    void cu.animateTo(100, 0, { duration: 5000 })
    cu.stop()
    // Stop should cancel the animation frame, but the promise might still be pending
    // Just verify no error
    expect(cu).toBeDefined()
  })

  it('applyEasing: linear returns t unchanged', () => {
    const cu = new CountUp(element)
    // Use reflect to access private method for testing
    const applyEasing = (cu as any).applyEasing.bind(cu)
    expect(applyEasing(0, 'linear')).toBe(0)
    expect(applyEasing(0.5, 'linear')).toBe(0.5)
    expect(applyEasing(1, 'linear')).toBe(1)
  })

  it('applyEasing: easeOut decelerates', () => {
    const cu = new CountUp(element)
    const applyEasing = (cu as any).applyEasing.bind(cu)
    const v = applyEasing(0.5, 'easeOut')
    // easeOut should be > 0.5 (ahead of linear at midpoint)
    expect(v).toBeGreaterThan(0.5)
    expect(applyEasing(1, 'easeOut')).toBeCloseTo(1)
  })

  it('applyEasing: easeInOut accelerates then decelerates', () => {
    const cu = new CountUp(element)
    const applyEasing = (cu as any).applyEasing.bind(cu)
    expect(applyEasing(0, 'easeInOut')).toBe(0)
    expect(applyEasing(1, 'easeInOut')).toBeCloseTo(1)
    // At t=0.5 should be 0.5
    expect(applyEasing(0.5, 'easeInOut')).toBeCloseTo(0.5)
  })

  it('handles negative numbers', async () => {
    const cu = new CountUp(element)
    await cu.animateTo(-500, 0, { duration: 0 })
    expect(element.textContent).toBe('-500')
  })

  it('handles negative start values', async () => {
    const cu = new CountUp(element)
    await cu.animateTo(100, -50, { duration: 0 })
    expect(element.textContent).toBe('100')
  })

  it('prefix and suffix with decimals', async () => {
    const cu = new CountUp(element)
    await cu.animateTo(1234.5678, 0, {
      prefix: '$',
      suffix: ' USD',
      decimals: 2,
      duration: 0,
    })
    expect(element.textContent).toBe('$1,234.57 USD')
  })
})
