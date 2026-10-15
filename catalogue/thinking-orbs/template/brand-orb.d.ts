import type { CSSProperties, CanvasHTMLAttributes } from 'react';
import type { ModeOpts, OrbFrame, OrbSize, OrbState, OrbTheme } from 'thinking-orbs';

/** The colours this file was generated with. */
export declare const BRAND: {
  name: string;
  light: { ink: string; body: string };
  dark: { body: string };
  theme: OrbTheme;
};

/** <ThinkingOrb>'s props minus `color`, `frame` and `gravity`. */
export interface BrandOrbProps extends Omit<CanvasHTMLAttributes<HTMLCanvasElement>, 'style' | 'color'> {
  /** Which animation to show. @default 'working' */
  state?: OrbState;
  /** 64 (avatar), 32 (compact) or 20 (inline). @default 64 */
  size?: OrbSize;
  /**
   * `light`: text colour nearest, primary body, for light pages.
   * `dark`: dark-scheme primary, for dark pages.
   * `auto`: follows an ancestor's data-theme / `dark` class, then the OS.
   * @default BRAND.theme ('auto' if your brand has a dark scheme, else 'light')
   */
  theme?: OrbTheme;
  /** Animation speed multiplier. @default 1 */
  speed?: number;
  /** Freeze on the current frame. @default false */
  paused?: boolean;
  /** Density multiplier. @default 1 */
  dots?: number;
  /** Dot radius multiplier. @default 1 */
  dotSize?: number;
  /** Raw engine options merged over the preset (see the stock `opts` prop). */
  opts?: ModeOpts;
  style?: CSSProperties;
}

export declare function BrandOrb(props: BrandOrbProps): import('react/jsx-runtime').JSX.Element;

/** The brand colour for one dot or line, given its ink value and alpha. */
export declare function brandInk(white: number, alpha: number, dark: boolean): string;

/** Paint a finished frame in brand colours. */
export declare function paintBrand(ctx: CanvasRenderingContext2D, frame: OrbFrame, dark: boolean): void;
