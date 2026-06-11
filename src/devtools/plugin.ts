import type { SpringAnimation } from '../core/spring-engine.ts'

interface DevToolsApi {
  addTimelineLayer: (options: { id: string; label: string; color: number }) => void
  addInspector: (options: {
    id: string
    label: string
    icon: string
    treeFilterPlaceholder?: string
  }) => void
  on: (event: string, handler: (payload: any) => void) => void
}

function getSprings(): SpringAnimation[] {
  const global = (window as any).__MK_MOTION__
  if (!global?.activeSpringAnimations) return []
  return Array.from(global.activeSpringAnimations as Set<SpringAnimation>)
}

function getSpringMeta(spring: SpringAnimation): {
  stiffness: number
  damping: number
  mass: number
  targetTag: string
} {
  // Access private fields via any for devtools introspection
  const s = spring as any
  return {
    stiffness: s.options?.stiffness ?? 170,
    damping: s.options?.damping ?? 26,
    mass: s.options?.mass ?? 1,
    targetTag: s.target?.tagName?.toLowerCase?.() ?? 'unknown',
  }
}

export function setupMkMotionDevTools(_app: any): void {
  const hook = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__
  if (!hook) {
    // Fallback: log to console when devtools not available
    if (typeof console !== 'undefined') {
      console.log('[mk-motion] Vue DevTools not detected. DevTools plugin not registered.')
    }
    return
  }

  // Try Vue DevTools v7 API via app
  const api: DevToolsApi | undefined = (window as any).__VUE_DEVTOOLS_API__

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

    api.on('getInspectorTree', (payload: any) => {
      if (payload.inspectorId !== 'mk-motion') return
      const springs = getSprings()
      payload.rootNodes = [
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

        apiInstance.on('getInspectorTree', (payload: any) => {
          if (payload.inspectorId !== 'mk-motion') return
          const springs = getSprings()
          payload.rootNodes = [
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
