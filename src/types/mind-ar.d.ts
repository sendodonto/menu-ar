declare module 'mind-ar/dist/mindar-image.prod.js' {
  export class Controller {
    constructor(opts: {
      inputWidth: number;
      inputHeight: number;
      maxTrack?: number;
      filterMinCF?: number;
      filterBeta?: number;
      warmupTolerance?: number;
      missTolerance?: number;
      onUpdate?: (data: { type: string; targetIndex: number; worldMatrix: number[] | null }) => void;
    });
    inputWidth: number;
    inputHeight: number;
    addImageTargets(url: string): Promise<{ dimensions: [number, number][] }>;
    dummyRun(input: HTMLVideoElement): Promise<void>;
    processVideo(input: HTMLVideoElement): void;
    stopProcessVideo(): void;
    getProjectionMatrix(): number[];
  }
  export class Compiler {
    compileImageTargets(images: HTMLImageElement[], progress: (p: number) => void): Promise<unknown>;
    exportData(): Promise<ArrayBuffer>;
  }
}
