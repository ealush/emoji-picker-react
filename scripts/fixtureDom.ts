import { JSDOM } from 'jsdom';

export function installGlobals(dom: JSDOM): void {
  for (const key of [
    'window',
    'document',
    'navigator',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'Element',
    'HTMLElement',
    'Node',
    'Event',
    'KeyboardEvent',
    'MouseEvent',
    'getComputedStyle',
  ] as const) {
    const value = dom.window[key];
    if (value !== undefined && !Reflect.has(globalThis, key)) {
      Object.defineProperty(globalThis, key, {
        configurable: true,
        writable: true,
        value,
      });
    }
  }
  for (const key of ['window', 'document', 'navigator'] as const) {
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value: dom.window[key],
    });
  }
}

/** Immediate visibility report used by the DOM-only automation fixtures. */
export class FixtureIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '0px';
  readonly thresholds = [0];
  constructor(private readonly callback: IntersectionObserverCallback) {}
  observe(target: Element): void {
    const rect = target.getBoundingClientRect();
    this.callback(
      [
        {
          isIntersecting: true,
          intersectionRatio: 1,
          target,
          time: Date.now(),
          boundingClientRect: rect,
          intersectionRect: rect,
          rootBounds: null,
        },
      ],
      this,
    );
  }
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
