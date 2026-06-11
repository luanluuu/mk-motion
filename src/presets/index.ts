import type { AnimationOptions } from '../core/utils.ts'
import { Animator } from '../core/animator.ts'

function $(el: HTMLElement | string) {
  return new Animator(el)
}

/* ---------- Fade ---------- */
export function fadeIn(el: HTMLElement | string, opts?: AnimationOptions) {
  return $(el).animate('fadeIn', opts)
}
export function fadeOut(el: HTMLElement | string, opts?: AnimationOptions) {
  return $(el).animate('fadeOut', opts)
}

/* ---------- Slide ---------- */
export function slideInUp(el: HTMLElement | string, opts?: AnimationOptions) {
  return $(el).animate('slideInUp', opts)
}
export function slideInDown(el: HTMLElement | string, opts?: AnimationOptions) {
  return $(el).animate('slideInDown', opts)
}
export function slideInLeft(el: HTMLElement | string, opts?: AnimationOptions) {
  return $(el).animate('slideInLeft', opts)
}
export function slideInRight(el: HTMLElement | string, opts?: AnimationOptions) {
  return $(el).animate('slideInRight', opts)
}
export function slideOutUp(el: HTMLElement | string, opts?: AnimationOptions) {
  return $(el).animate('slideOutUp', opts)
}
export function slideOutDown(el: HTMLElement | string, opts?: AnimationOptions) {
  return $(el).animate('slideOutDown', opts)
}

/* ---------- Zoom ---------- */
export function zoomIn(el: HTMLElement | string, opts?: AnimationOptions) {
  return $(el).animate('zoomIn', opts)
}
export function zoomOut(el: HTMLElement | string, opts?: AnimationOptions) {
  return $(el).animate('zoomOut', opts)
}

/* ---------- Bounce ---------- */
export function bounceIn(el: HTMLElement | string, opts?: AnimationOptions) {
  return $(el).animate('bounceIn', opts)
}
export function bounceOut(el: HTMLElement | string, opts?: AnimationOptions) {
  return $(el).animate('bounceOut', opts)
}

/* ---------- Flip ---------- */
export function flipInX(el: HTMLElement | string, opts?: AnimationOptions) {
  return $(el).animate('flipInX', opts)
}
export function flipInY(el: HTMLElement | string, opts?: AnimationOptions) {
  return $(el).animate('flipInY', opts)
}

/* ---------- Misc ---------- */
export function shake(el: HTMLElement | string, opts?: AnimationOptions) {
  return $(el).animate('shake', opts)
}
export function pulse(el: HTMLElement | string, opts?: AnimationOptions) {
  return $(el).animate('pulse', opts)
}
export function rotateIn(el: HTMLElement | string, opts?: AnimationOptions) {
  return $(el).animate('rotateIn', opts)
}