import '@testing-library/jest-dom/vitest';

// Polyfill for ResizeObserver (required by Radix UI Tooltip/Popover)
global.ResizeObserver = class ResizeObserver {
  observe(): void {
    /* noop */
  }
  unobserve(): void {
    /* noop */
  }
  disconnect(): void {
    /* noop */
  }
};

// Polyfill for Element.scrollIntoView (used by some Radix components)
Element.prototype.scrollIntoView = function (): void {
  /* noop */
};

// Polyfill for pointer capture methods (required by Radix UI Select)
Element.prototype.hasPointerCapture = function (): boolean {
  return false;
};
Element.prototype.setPointerCapture = function (): void {
  /* noop */
};
Element.prototype.releasePointerCapture = function (): void {
  /* noop */
};

// Polyfill for matchMedia (required by Sonner toast library)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: (): void => {
      /* noop */
    },
    removeListener: (): void => {
      /* noop */
    },
    addEventListener: (): void => {
      /* noop */
    },
    removeEventListener: (): void => {
      /* noop */
    },
    dispatchEvent: (): boolean => false,
  }),
});
