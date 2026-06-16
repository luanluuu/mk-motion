// Global test setup for jsdom environment

// jsdom doesn't support matchMedia by default
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: query.includes('prefers-color-scheme: dark') ? false : false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// jsdom doesn't support Web Animations API by default
if (!Element.prototype.animate) {
  Element.prototype.animate = function () {
    return {
      currentTime: 0,
      playbackRate: 1,
      playState: 'running',
      cancel: () => {},
      finish: () => {},
      play: () => {},
      pause: () => {},
      reverse: () => {},
      persist: () => {},
      oncancel: null,
      onfinish: null,
      onremove: null,
      finished: Promise.resolve(),
      ready: Promise.resolve(),
      commitStyles: () => {},
      updatePlaybackRate: () => {},
      effect: null,
      timeline: null,
      id: '',
      pending: false,
      startTime: 0,
    } as unknown as Animation
  }
}

// jsdom exposes canvas APIs but reports them as not implemented. Some visual
// effects probe getContext during import, so provide a minimal harmless mock.
HTMLCanvasElement.prototype.getContext = (() =>
  null) as typeof HTMLCanvasElement.prototype.getContext

// jsdom doesn't expose Touch constructor by default
if (typeof Touch === 'undefined') {
  class TouchMock {
    identifier: number
    target: EventTarget
    clientX: number
    clientY: number
    pageX: number
    pageY: number
    screenX: number
    screenY: number

    constructor(init: TouchInit) {
      this.identifier = init.identifier ?? 0
      this.target = init.target ?? null
      this.clientX = init.clientX ?? 0
      this.clientY = init.clientY ?? 0
      this.pageX = init.pageX ?? this.clientX
      this.pageY = init.pageY ?? this.clientY
      this.screenX = init.screenX ?? this.clientX
      this.screenY = init.screenY ?? this.clientY
    }
  }

  declare global {
    var Touch: typeof TouchMock
  }
  globalThis.Touch = TouchMock as unknown as typeof Touch
}

// jsdom doesn't support AnimationEvent by default
if (typeof AnimationEvent === 'undefined') {
  class AnimationEventMock extends Event {
    animationName: string
    elapsedTime: number
    pseudoElement: string

    constructor(type: string, init?: AnimationEventInit) {
      super(type, init)
      this.animationName = init?.animationName ?? ''
      this.elapsedTime = init?.elapsedTime ?? 0
      this.pseudoElement = init?.pseudoElement ?? ''
    }
  }

  declare global {
    var AnimationEvent: typeof AnimationEventMock
  }
  globalThis.AnimationEvent = AnimationEventMock
}
