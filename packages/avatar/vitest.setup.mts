import '@testing-library/jest-dom/vitest';

if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} } as never;
}

if (!window.matchMedia) {
  window.matchMedia = ((q: string) => ({
    matches: false,
    media: q,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as never;
}
