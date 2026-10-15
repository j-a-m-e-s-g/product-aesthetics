import type createGlobe from 'cobe';

type COBEOptions = Parameters<typeof createGlobe>[1];
type Globe = ReturnType<typeof createGlobe>;
type Colours = Pick<COBEOptions, 'dark' | 'diffuse' | 'mapBrightness' | 'baseColor' | 'markerColor' | 'arcColor' | 'glowColor'>;

export declare const brandGlobe: { light: Colours; dark: Colours };

export declare function spinGlobe(
  canvas: HTMLCanvasElement,
  options?: Partial<COBEOptions> & { theme?: 'light' | 'dark'; speed?: number },
): { globe: Globe; stop: () => void };
