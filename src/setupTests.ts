import "@testing-library/jest-dom";

// Mock HTMLCanvasElement
global.HTMLCanvasElement = class {
  width: number = 1;
  height: number = 1;

  getContext(type: string): CanvasRenderingContext2D | null {
    if (type !== "2d") return null;

    const context = {} as CanvasRenderingContext2D;
    context.getImageData = () => {
      return {
        data: new Uint8ClampedArray([255, 255, 255, 255]),
        width: 1,
        height: 1,
        colorSpace: "srgb", // Dodajemo colorSpace svojstvo
      };
    };
    return context;
  }
} as unknown as typeof HTMLCanvasElement;
