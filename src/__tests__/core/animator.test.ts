import { describe, it, expect, vi } from 'vitest'
import { Animator } from '../../core/animator'

describe('Animator', () => {
  it('constructs from an HTMLElement', () => {
    const el = document.createElement('div')
    const animator = new Animator(el)
    expect(animator).toBeInstanceOf(Animator)
  })

  it('constructs from a selector string', () => {
    const el = document.createElement('div')
    el.id = 'animator-test'
    document.body.appendChild(el)
    const animator = new Animator('#animator-test')
    expect(animator).toBeInstanceOf(Animator)
    document.body.removeChild(el)
  })

  it('throws when element is not found', () => {
    expect(() => new Animator('#non-existent-element')).toThrow(
      'Animator: element not found'
    )
  })

  describe('animate', () => {
    it('adds animation classes and CSS variables', () => {
      const el = document.createElement('div')
      const animator = new Animator(el)

      void animator.animate('fadeIn', { duration: 600, easing: 'ease-out' })

      expect(el.classList.contains('mk-animated')).toBe(true)
      expect(el.classList.contains('mk-fadeIn')).toBe(true)
      expect(el.style.getPropertyValue('--mk-duration')).toBe('600ms')
      expect(el.style.getPropertyValue('--mk-easing')).toBe('ease-out')
    })

    it('resolves after animationend event', async () => {
      const el = document.createElement('div')
      const animator = new Animator(el)

      const promise = animator.animate('fadeIn')
      const event = new AnimationEvent('animationend', {
        animationName: 'mk-fadeIn',
      })
      el.dispatchEvent(event)

      await expect(promise).resolves.toBe(animator)
      expect(el.classList.contains('mk-animated')).toBe(false)
      expect(el.style.getPropertyValue('--mk-duration')).toBe('')
    })

    it('ignores animationend events for non-mk animations', async () => {
      const el = document.createElement('div')
      const animator = new Animator(el)

      const promise = animator.animate('fadeIn')
      const event = new AnimationEvent('animationend', {
        animationName: 'other-animation',
      })
      el.dispatchEvent(event)

      // Promise should still be pending; resolve it properly
      const resolveEvent = new AnimationEvent('animationend', {
        animationName: 'mk-fadeIn',
      })
      el.dispatchEvent(resolveEvent)

      await expect(promise).resolves.toBe(animator)
    })

    it('resolves immediately for infinite iterations', async () => {
      const el = document.createElement('div')
      const animator = new Animator(el)

      const promise = animator.animate('pulse', { iterations: Infinity })
      await expect(promise).resolves.toBe(animator)
      expect(el.classList.contains('mk-infinite')).toBe(true)
    })
  })

  describe('waa', () => {
    it('calls element.animate with merged options', () => {
      const el = document.createElement('div')
      const animateSpy = vi.spyOn(el, 'animate').mockReturnValue({
        onfinish: null,
        cancel: vi.fn(),
      } as unknown as Animation)

      const animator = new Animator(el)
      void animator.waa([{ opacity: 0 }, { opacity: 1 }], {
        duration: 300,
        easing: 'linear',
      })

      expect(animateSpy).toHaveBeenCalledWith(
        [{ opacity: 0 }, { opacity: 1 }],
        expect.objectContaining({
          duration: 300,
          easing: 'linear',
          delay: 0,
          iterations: 1,
          direction: 'normal',
          fill: 'both',
        })
      )
    })

    it('resolves immediately for infinite iterations', async () => {
      const el = document.createElement('div')
      vi.spyOn(el, 'animate').mockReturnValue({
        onfinish: null,
        cancel: vi.fn(),
      } as unknown as Animation)

      const animator = new Animator(el)
      const promise = animator.waa([{ opacity: 0 }, { opacity: 1 }], {
        iterations: Infinity,
      })

      await expect(promise).resolves.toBe(animator)
    })
  })

  describe('stop', () => {
    it('cancels the current WAA animation', () => {
      const el = document.createElement('div')
      const cancel = vi.fn()
      vi.spyOn(el, 'animate').mockReturnValue({
        onfinish: null,
        cancel,
      } as unknown as Animation)

      const animator = new Animator(el)
      void animator.waa([{ opacity: 0 }, { opacity: 1 }])
      animator.stop()

      expect(cancel).toHaveBeenCalled()
    })
  })

  describe('reset', () => {
    it('removes all mk- prefixed classes', () => {
      const el = document.createElement('div')
      el.classList.add('mk-animated', 'mk-fadeIn', 'custom-class')

      const animator = new Animator(el)
      animator.reset()

      expect(el.classList.contains('mk-animated')).toBe(false)
      expect(el.classList.contains('mk-fadeIn')).toBe(false)
      expect(el.classList.contains('custom-class')).toBe(true)
    })
  })

  describe('vars', () => {
    it('sets CSS variables and returns animator for chaining', () => {
      const el = document.createElement('div')
      const animator = new Animator(el)

      const result = animator.vars({ duration: '400ms', scale: 1.2 })
      expect(result).toBe(animator)
      expect(el.style.getPropertyValue('--mk-duration')).toBe('400ms')
      expect(el.style.getPropertyValue('--mk-scale')).toBe('1.2')
    })
  })
})
