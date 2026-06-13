import { describe, it, expect } from 'vitest'
import {
  fadeIn,
  fadeOut,
  slideInUp,
  slideInDown,
  slideInLeft,
  slideInRight,
  slideOutUp,
  slideOutDown,
  zoomIn,
  zoomOut,
  bounceIn,
  bounceOut,
  flipInX,
  flipInY,
  shake,
  pulse,
  rotateIn,
} from '../../presets'

describe('presets', () => {
  const presets = [
    { fn: fadeIn, name: 'fadeIn' },
    { fn: fadeOut, name: 'fadeOut' },
    { fn: slideInUp, name: 'slideInUp' },
    { fn: slideInDown, name: 'slideInDown' },
    { fn: slideInLeft, name: 'slideInLeft' },
    { fn: slideInRight, name: 'slideInRight' },
    { fn: slideOutUp, name: 'slideOutUp' },
    { fn: slideOutDown, name: 'slideOutDown' },
    { fn: zoomIn, name: 'zoomIn' },
    { fn: zoomOut, name: 'zoomOut' },
    { fn: bounceIn, name: 'bounceIn' },
    { fn: bounceOut, name: 'bounceOut' },
    { fn: flipInX, name: 'flipInX' },
    { fn: flipInY, name: 'flipInY' },
    { fn: shake, name: 'shake' },
    { fn: pulse, name: 'pulse' },
    { fn: rotateIn, name: 'rotateIn' },
  ]

  presets.forEach(({ fn, name }) => {
    it(`${name} adds the correct animation class`, () => {
      const el = document.createElement('div')
      void fn(el, { duration: 300 })
      expect(el.classList.contains('mk-animated')).toBe(true)
      expect(el.classList.contains(`mk-${name}`)).toBe(true)
      expect(el.style.getPropertyValue('--mk-duration')).toBe('300ms')
    })

    it(`${name} resolves after animationend`, async () => {
      const el = document.createElement('div')
      const promise = fn(el)
      const event = new AnimationEvent('animationend', {
        animationName: `mk-${name}`,
      })
      el.dispatchEvent(event)
      await expect(promise).resolves.toBeDefined()
    })
  })
})
