import { describe, it, expect } from 'vitest'
import { parseTime, toCssTime, setCSSVariables, removeCSSVariables } from '../../core/utils'

describe('parseTime', () => {
  it('returns number as-is', () => {
    expect(parseTime(500)).toBe(500)
    expect(parseTime(0)).toBe(0)
    expect(parseTime(1000)).toBe(1000)
  })

  it('parses ms string', () => {
    expect(parseTime('500ms')).toBe(500)
    expect(parseTime('0ms')).toBe(0)
    expect(parseTime('1500ms')).toBe(1500)
    expect(parseTime(' 300ms ')).toBe(300)
  })

  it('parses seconds string', () => {
    expect(parseTime('1s')).toBe(1000)
    expect(parseTime('0.5s')).toBe(500)
    expect(parseTime('2s')).toBe(2000)
    expect(parseTime('1.5s')).toBe(1500)
  })

  it('parses bare number string', () => {
    expect(parseTime('500')).toBe(500)
    expect(parseTime('0')).toBe(0)
  })

  it('returns NaN for invalid input', () => {
    expect(parseTime('abc')).toBeNaN()
  })
})

describe('toCssTime', () => {
  it('returns ms for values under 1000', () => {
    expect(toCssTime(0)).toBe('0ms')
    expect(toCssTime(500)).toBe('500ms')
    expect(toCssTime(999)).toBe('999ms')
  })

  it('returns seconds for values >= 1000', () => {
    expect(toCssTime(1000)).toBe('1s')
    expect(toCssTime(1500)).toBe('1.5s')
    expect(toCssTime(2000)).toBe('2s')
  })

  it('strips trailing zeros in seconds', () => {
    expect(toCssTime(1000)).toBe('1s')
    expect(toCssTime(1250)).toBe('1.25s')
  })
})

describe('setCSSVariables', () => {
  it('sets CSS custom properties with --mk- prefix', () => {
    const el = document.createElement('div')
    setCSSVariables(el, { duration: '500ms', easing: 'ease-out' })
    expect(el.style.getPropertyValue('--mk-duration')).toBe('500ms')
    expect(el.style.getPropertyValue('--mk-easing')).toBe('ease-out')
  })

  it('converts number values to strings', () => {
    const el = document.createElement('div')
    setCSSVariables(el, { count: 42 })
    expect(el.style.getPropertyValue('--mk-count')).toBe('42')
  })
})

describe('removeCSSVariables', () => {
  it('removes CSS custom properties', () => {
    const el = document.createElement('div')
    el.style.setProperty('--mk-duration', '500ms')
    el.style.setProperty('--mk-easing', 'ease-out')

    removeCSSVariables(el, ['duration', 'easing'])
    expect(el.style.getPropertyValue('--mk-duration')).toBe('')
    expect(el.style.getPropertyValue('--mk-easing')).toBe('')
  })

  it('does not throw for non-existent properties', () => {
    const el = document.createElement('div')
    expect(() => removeCSSVariables(el, ['nonexistent'])).not.toThrow()
  })
})
