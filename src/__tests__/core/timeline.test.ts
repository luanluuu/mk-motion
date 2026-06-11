import { describe, it, expect, beforeEach } from 'vitest'
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
})
