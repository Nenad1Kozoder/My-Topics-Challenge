import "@testing-library/jest-dom";

// Mock HTMLCanvasElement
global.HTMLCanvasElement = class {
  width = 1;
  height = 1;

  getContext(type: string): CanvasRenderingContext2D | null {
    if (type !== "2d") return null;

    const context = {} as CanvasRenderingContext2D;
    context.getImageData = () => ({
      data: new Uint8ClampedArray([255, 255, 255, 255]),
      width: 1,
      height: 1,
      colorSpace: "srgb",
    });
    return context;
  }
} as unknown as typeof HTMLCanvasElement;

// Mock for window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock getBBox for SVG elements
(SVGElement.prototype as any).getBBox = () => ({
  x: 0,
  y: 0,
  width: 100,
  height: 20,
  top: 0,
  left: 0,
  right: 100,
  bottom: 20,
});
