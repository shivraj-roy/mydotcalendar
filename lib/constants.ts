/**
 * Configuration constants for MyDotCalendar
 */

import { DeviceResolution, ThemeColors } from "./types";

/**
 * Supported device resolutions (Phase 1 - MacBook Focus)
 */
export const DEVICE_RESOLUTIONS: Record<string, DeviceResolution> = {
   'MacBook Air 13" (M2/M3)': { width: 2560, height: 1664 },
   'MacBook Air 15" (M2/M3)': { width: 2880, height: 1864 },
   'MacBook Pro 14" (M1-M4)': { width: 3024, height: 1964 },
   'MacBook Pro 16" (M1-M4)': { width: 3456, height: 2234 },
   'MacBook Pro 13" (2020)': { width: 2560, height: 1600 },
   Custom: { width: 0, height: 0 },
} as const;

/**
 * Theme color configurations
 */
export const DEFAULT_COLORS: Record<"dark" | "light", ThemeColors> = {
   dark: {
      background: "#1a1a1a",
      passedDot: "#ffffff",
      currentDot: "#ff6347",
      futureDot: "#3a3a3a",
      text: "#ff6347",
   },
   light: {
      background: "#fafaff",
      passedDot: "#1a1a1a",
      currentDot: "#ff6347",
      futureDot: "#e5e5e5",
      text: "#ff6347",
   },
} as const;

/**
 * Default values
 */
export const DEFAULT_ACCENT = "ff6347"; // Tomato/coral orange
export const DEFAULT_THEME = "dark";
export const DEFAULT_MARGIN = 60;
export const DEFAULT_TEXT_SIZE = 28;
export const DEFAULT_DOT_SPACING_FACTOR = 0.7;

/**
 * Validation limits
 */
export const MIN_DIMENSION = 100;
export const MAX_DIMENSION = 10000;
