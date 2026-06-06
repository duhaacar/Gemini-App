/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DrawingTool = 'pen' | 'eraser' | 'line' | 'rectangle' | 'circle';

export type CanvasBackground = 'white' | 'dark' | 'cream' | 'grid' | 'dots';

export interface PresetColor {
  name: string;
  value: string;
  accent: string; // Style for border/neon focus
}

export interface CanvasHistoryItem {
  imageData: ImageData;
}
