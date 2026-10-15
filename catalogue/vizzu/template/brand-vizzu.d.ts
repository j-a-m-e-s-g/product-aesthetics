import type Vizzu from 'vizzu';
import type { Styles } from 'vizzu';

export declare const brandStyle: { light: Styles.Chart; dark: Styles.Chart };

export declare function brandChart(chart: Vizzu, theme?: 'light' | 'dark'): ReturnType<Vizzu['animate']>;
