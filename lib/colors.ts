/**
 * Consistent color palette for all charts and visualizations
 */

// Primary colors for main data series
export const PRIMARY_COLORS = [
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#0ea5e9', // sky-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#a855f7', // purple-500
  '#d946ef', // fuchsia-500
  '#ec4899', // pink-500
]

// Secondary colors for highlighting or secondary data
export const SECONDARY_COLORS = [
  '#f59e0b', // amber-500
  '#f97316', // orange-500
  '#ef4444', // red-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
]

// Neutral colors for backgrounds and non-data elements
export const NEUTRAL_COLORS = {
  background: '#18181b', // zinc-900
  card: '#27272a',       // zinc-800
  border: '#3f3f46',     // zinc-700
  text: {
    primary: '#f4f4f5',  // zinc-100
    secondary: '#a1a1aa', // zinc-400
  }
}

// Status colors
export const STATUS_COLORS = {
  success: '#10b981', // emerald-500
  warning: '#f59e0b', // amber-500
  error: '#ef4444',   // red-500
  info: '#3b82f6',    // blue-500
}

// Get a color from the primary palette by index (with wrapping)
export function getPrimaryColor(index: number): string {
  return PRIMARY_COLORS[index % PRIMARY_COLORS.length]
}

// Get a color from the secondary palette by index (with wrapping)
export function getSecondaryColor(index: number): string {
  return SECONDARY_COLORS[index % SECONDARY_COLORS.length]
}

// Generate a color scale for a specific number of items
export function generateColorScale(count: number): string[] {
  if (count <= PRIMARY_COLORS.length) {
    return PRIMARY_COLORS.slice(0, count)
  }
  
  // For larger sets, combine primary and secondary colors
  return [
    ...PRIMARY_COLORS,
    ...Array(count - PRIMARY_COLORS.length).fill(0).map((_, i) => 
      getSecondaryColor(i)
    )
  ]
} 