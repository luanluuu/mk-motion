import type { App } from 'vue'
import type { SpringAnimation } from '../core/spring-engine.ts'

declare global {
  interface Window {
    __MK_MOTION__?: { activeSpringAnimations: Set<SpringAnimation> }
    __VUE_DEVTOOLS_GLOBAL_HOOK__?: { emit: (event: string, payload: Record<string, unknown>) => void }
    __VUE_DEVTOOLS_API__?: DevToolsApi
  }
}

interface DevToolsApi {
  addTimelineLayer: (options: {
    id: string
    label: string
    color: number
  }) => void
  addInspector: (options: {
    id: string
    label: string
    icon: string
    treeFilterPlaceholder?: string
  }) => void
  on: (event: string, handler: (payload: Record<string, unknown>) => void) => void
}

function getSprings(): SpringAnimation[] {
  const global = window.__MK_MOTION__
  if (!global?.activeSpringAnimations) return []
  return Array.from(global.activeSpringAnimations)
}

interface SpringLike {
  options?: { stiffness?: number; damping?: number; mass?: number }
  target?: { tagName?: string; toLowerCase?: () => string }
}

function getSpringMeta(spring: SpringAnimation): {
  stiffness: number
  damping: number
  mass: number
  targetTag: string
} {
  // Access private fields via index signature for devtools introspection
  const s = spring as unknown as SpringLike
  return {
    stiffness: s.options?.stiffness ?? 170,
    damping: s.options?.damping ?? 26,
    mass: s.options?.mass ?? 1,
    targetTag: s.target?.tagName?.toLowerCase?.() ?? 'unknown',
  }
}

export function setupMkMotionDevTools(_app: App): void {
  const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__
  if (!hook) {
    // Fallback: log to console when devtools not available
    if (typeof console !== 'undefined') {
      console.log(
        '[mk-motion] Vue DevTools not detected. DevTools plugin not registered.'
      )
    }
    return
  }

  // Try Vue DevTools v7 API via app
  const api = window.__VUE_DEVTOOLS_API__

  if (api) {
    api.addTimelineLayer({
      id: 'mk-motion',
      label: 'MkMotion',
      color: 0x42b883,
    })

    api.addInspector({
      id: 'mk-motion',
      label: 'MkMotion',
      icon: 'motion_photos_on',
      treeFilterPlaceholder: 'Search animations',
    })

    api.on('getInspectorTree', (payload) => {
      if ((payload as Record<string, string>).inspectorId !== 'mk-motion') return
      const springs = getSprings()
      ;(payload as Record<string, unknown>).rootNodes = [
        {
          id: 'active-animations',
          label: `Active Animations (${springs.length})`,
          children: springs.map((s, i) => {
            const meta = getSpringMeta(s)
            return {
              id: `spring-${i}`,
              label: `${meta.targetTag} — stiffness:${meta.stiffness} damping:${meta.damping} mass:${meta.mass}`,
            }
          }),
        },
      ]
    })
  }

  // Also emit custom events on the hook for DevTools v6 compat
  hook.emit('setup-devtools-plugin', {
    app: _app,
    plugin: {
      id: 'mk-motion',
      label: 'MkMotion',
      packageName: '@luanlu/mk-motion',
      homepage: 'https://github.com/luanluuu/mk-motion',
      logo: '',
      componentStateTypes: ['mk-motion'],
      setup(apiInstance: DevToolsApi) {
        apiInstance.addInspector({
          id: 'mk-motion',
          label: 'MkMotion',
          icon: 'motion_photos_on',
          treeFilterPlaceholder: 'Search animations',
        })

        apiInstance.on('getInspectorTree', (payload) => {
          if ((payload as Record<string, string>).inspectorId !== 'mk-motion') return
          const springs = getSprings()
          ;(payload as Record<string, unknown>).rootNodes = [
            {
              id: 'active-animations',
              label: `Active Animations (${springs.length})`,
              children: springs.map((s, i) => {
                const meta = getSpringMeta(s)
                return {
                  id: `spring-${i}`,
                  label: `${meta.targetTag} — stiffness:${meta.stiffness} damping:${meta.damping} mass:${meta.mass}`,
                }
              }),
            },
          ]
        })
      },
    },
  })
}
