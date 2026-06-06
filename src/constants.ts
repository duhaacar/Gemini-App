/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PresetColor } from './types';

export const PALETTE_COLORS: PresetColor[] = [
  { name: 'Pitch Black', value: '#111827', accent: 'border-gray-900 bg-gray-900 text-white' },
  { name: 'Graphite Blue', value: '#4b5563', accent: 'border-gray-600 bg-gray-600 text-white' },
  { name: 'Neon Coral', value: '#ff3b30', accent: 'border-[#ff3b30] bg-[#ff3b30] text-white' },
  { name: 'Warm Amber', value: '#f59e0b', accent: 'border-amber-500 bg-amber-500 text-white' },
  { name: 'Cyber Green', value: '#00ff88', accent: 'border-[#00ff88] bg-[#00ff88] text-[#1a1a2e]' },
  { name: 'Holographic Blue', value: '#3b82f6', accent: 'border-blue-500 bg-blue-500 text-white' },
  { name: 'Vapor Purple', value: '#8b5cf6', accent: 'border-purple-500 bg-purple-500 text-white' },
  { name: 'Clean White', value: '#ffffff', accent: 'border-gray-200 bg-white text-gray-800' },
];

export const BACKGROUNDS = [
  { id: 'white', label: 'Plain White', visual: 'bg-white border-gray-200' },
  { id: 'cream', label: 'Warm Cream', visual: 'bg-[#fbf6eb] border-amber-100' },
  { id: 'dark', label: 'Obscure Dark', visual: 'bg-[#12131a] border-gray-700' },
  { id: 'grid', label: 'Tech Grid', visual: 'bg-white bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:24px_24px]' },
  { id: 'dots', label: 'Bullet Dot', visual: 'bg-white bg-[radial-gradient(#d1d5db_1px,transparent_1px)] bg-[size:20px_20px]' },
];
