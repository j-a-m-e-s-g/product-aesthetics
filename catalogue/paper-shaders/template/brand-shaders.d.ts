import type {
  DitheringParams,
  GrainGradientParams,
  HalftoneDotsParams,
  ImageDitheringParams,
  MeshGradientParams,
  PaperTextureParams,
} from '@paper-design/shaders-react';

/** Colour props for each shader, in one scheme. Spread onto the matching component. */
export interface BrandShaderPresets {
  /** <MeshGradient>: your background, a tint of primary, primary, and your accent (or a deep primary). */
  meshGradient: Required<Pick<MeshGradientParams, 'colors'>>;
  /** <GrainGradient>: shapes in primary, accent and a tint, over your background. */
  grainGradient: Required<Pick<GrainGradientParams, 'colorBack' | 'colors'>>;
  /** <Dithering>: primary pixels on your background. */
  dithering: Required<Pick<DitheringParams, 'colorBack' | 'colorFront'>>;
  /** <HalftoneDots>: text-colour dots on your background. Add `image`. */
  halftoneDots: Required<Pick<HalftoneDotsParams, 'colorBack' | 'colorFront' | 'inverted'>>;
  /** <ImageDithering>: a photo in three brand tones, dark to light. Add `image`. */
  imageDithering: Required<Pick<ImageDitheringParams, 'colorBack' | 'colorFront' | 'colorHighlight' | 'inverted'>>;
  /** <PaperTexture>: a sheet in your background colour on a muted surface. `image` optional. */
  paperTexture: Required<Pick<PaperTextureParams, 'colorBack' | 'colorPaper' | 'colorShadow'>>;
}

/** Light-scheme presets at the top level; `dark` holds the dark-scheme ones. */
export declare const brandShaders: BrandShaderPresets & { dark: BrandShaderPresets };
