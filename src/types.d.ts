declare module '*.css' {
  const content: string
  export default content
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@nuxt/kit' {
  export interface NuxtModule<TOptions = Record<string, unknown>> {
    (options?: TOptions): void
  }

  export function defineNuxtModule<TOptions = Record<string, unknown>>(definition: {
    meta?: Record<string, unknown>
    defaults?: TOptions
    setup?: (options: TOptions, nuxt: any) => void
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
