declare module '*.css' {
  const content: string
  export default content
}

declare module '@luanlu/mk-motion/css' {}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}

declare module '@nuxt/kit' {
  export interface Nuxt {
    options: {
      css: string[]
    }
  }

  export interface NuxtModule<TOptions = Record<string, unknown>> {
    (options?: TOptions): void
  }

  export function defineNuxtModule<
    TOptions = Record<string, unknown>,
  >(definition: {
    meta?: Record<string, unknown>
    defaults?: TOptions
    setup?: (options: TOptions, nuxt: Nuxt) => void
  }): NuxtModule<TOptions>

  export function addComponent(component: {
    name: string
    export?: string
    filePath: string
  }): void

  export function addImportsDir(path: string): void

  export function createResolver(baseURL: string): {
    resolve: (...paths: string[]) => string
  }
}
