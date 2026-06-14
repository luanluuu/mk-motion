import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Timeline } from '../../core/timeline'

describe('Timeline', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    container.innerHTML = `
      <div id="box1" style="width:100px;height:100px"></div>
      <div id="box2" style="width:100px;height:100px"></div>
      <div id="box3" style="width:100px;height:100px"></div>
    `
    document.body.appendChild(container)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('add() returns this for chaining', () => {
    const tl = new Timeline()
    expect(tl.add('fadeIn', '#box1')).toBe(tl)
  })

  it('add() estimates end time for items without explicit "at"', () => {
    const tl = new Timeline()
    tl.add('fadeIn', '#box1', { duration: 300 })
    tl.add('fadeOut', '#box2', { duration: 200 })
    // Second item should start after first finishes
    const el2 = document.querySelector('#box2')
    expect(el2).toBeTruthy()
  })

  it('add() accepts explicit "at" time', () => {
    const tl = new Timeline()
    tl.add('fadeIn', '#box1', { at: 1000 })
    // Should not throw
    expect(tl).toBeDefined()
  })

  it('clear() stops and empties items', () => {
    const tl = new Timeline()
    tl.add('fadeIn', '#box1')
    tl.clear()
    // After clear, adding should start from 0 again
    tl.add('fadeIn', '#box1')
  })

  it('stop() clears animation classes', () => {
    const tl = new Timeline()
    const el = document.querySelector('#box1')! as HTMLElement
    el.classList.add('mk-animated', 'mk-fadeIn')

    tl.add('fadeIn', el)
    tl.stop()

    expect(el.classList.contains('mk-animated')).toBe(false)
    expect(el.classList.contains('mk-fadeIn')).toBe(false)
  })

  it('stop() handles missing elements gracefully', () => {
    const tl = new Timeline()
    tl.add('fadeIn', '#nonexistent')
    expect(() => tl.stop()).not.toThrow()
  })

  it('handles zero items gracefully', async () => {
    const tl = new Timeline()
    await expect(tl.play()).resolves.toBeUndefined()
  })

  it('play() applies animation classes and resolves', async () => {
    const tl = new Timeline()
    const el = document.querySelector('#box1')! as HTMLElement

    tl.add('fadeIn', el, { duration: 300 })
    const promise = tl.play()

    vi.advanceTimersByTime(50)
    expect(el.classList.contains('mk-animated')).toBe(true)
    expect(el.classList.contains('mk-fadeIn')).toBe(true)
    expect(el.style.getPropertyValue('--mk-duration')).toBe('300ms')

    // Simulate animation completion
    el.dispatchEvent(
      new AnimationEvent('animationend', { animationName: 'mk-fadeIn' })
    )

    await promise
    expect(el.classList.contains('mk-animated')).toBe(false)
    expect(el.style.getPropertyValue('--mk-duration')).toBe('')
  })

  it('play() falls back to timeout when animationend is not fired', async () => {
    const tl = new Timeline()
    const el = document.querySelector('#box1')! as HTMLElement

    tl.add('fadeIn', el, { duration: 100 })
    const promise = tl.play()

    vi.advanceTimersByTime(250)
    await promise

    expect(el.classList.contains('mk-animated')).toBe(false)
  })

  it('play() schedules items at explicit times', async () => {
    const tl = new Timeline()
    const el = document.querySelector('#box1')! as HTMLElement

    tl.add('fadeIn', el, { at: 200, duration: 100 })
    const promise = tl.play()

    vi.advanceTimersByTime(150)
    expect(el.classList.contains('mk-fadeIn')).toBe(false)

    vi.advanceTimersByTime(100)
    expect(el.classList.contains('mk-fadeIn')).toBe(true)

    el.dispatchEvent(
      new AnimationEvent('animationend', { animationName: 'mk-fadeIn' })
    )
    await promise
  })

  it('play() ignores animationend events from non-mk animations', async () => {
    const tl = new Timeline()
    const el = document.querySelector('#box1')! as HTMLElement

    tl.add('fadeIn', el, { duration: 100 })
    const promise = tl.play()

    el.dispatchEvent(
      new AnimationEvent('animationend', { animationName: 'other-animation' })
    )

    vi.advanceTimersByTime(250)
    await promise
  })

  it('stop() aborts running timeline', async () => {
    const tl = new Timeline()
    const el = document.querySelector('#box1')! as HTMLElement

    tl.add('fadeIn', el, { duration: 500 })
    const promise = tl.play()

    vi.advanceTimersByTime(50)
    tl.stop()

    vi.advanceTimersByTime(600)
    await promise

    expect(el.classList.contains('mk-fadeIn')).toBe(false)
  })

  it('play() handles missing selector target gracefully', async () => {
    const tl = new Timeline()
    tl.add('fadeIn', '#nonexistent', { duration: 100 })
    await expect(tl.play()).resolves.toBeUndefined()
  })
})
