import type * as Plot from '@observablehq/plot';

/** One colour scheme (light or dark), as hex strings. */
export interface BrandPlotScheme {
  background: string;
  foreground: string;
  primary: string;
  accent: string;
  muted: string;
  mutedForeground: string;
  border: string;
  /** Up to eight distinct colours for categories: primary, accent, foreground, then OKLab mixes of them. */
  categorical: string[];
  /** Stops for numbers: a light tint of primary, through primary, to a deep shade (mirrored for dark). */
  sequential: string[];
}

/** The brand this file was generated with. The light scheme sits at the top level. */
export declare const brandColors: BrandPlotScheme & {
  name: string;
  /** Your sans font stack, as a CSS font-family value. */
  font: string;
  dark: BrandPlotScheme;
};

/** A colour function for t in [0, 1] through the given stops, e.g. for a color scale's `interpolate`. */
export declare function brandRamp(stops: readonly string[]): (t: number) => string;

export interface BrandPlotSettings {
  /** `dark` uses your dark scheme for type, grid, tooltips and colour scales. @default 'light' */
  theme?: 'light' | 'dark';
}

/**
 * Plot.plot with your brand as the defaults: font, text colour, grid, tooltip
 * fill and colour scales. Anything you pass in `options` wins.
 */
export declare function brandPlot(options?: Plot.PlotOptions, settings?: BrandPlotSettings): ReturnType<typeof Plot.plot>;
