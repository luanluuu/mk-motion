// Global test setup for jsdom environment
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
