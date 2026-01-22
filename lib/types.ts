/**
 * TypeScript interfaces and types for MyDotCalendar
 */

export interface WallpaperParams {
   width: number;
   height: number;
   start_date?: string;
   accent?: string;
   theme?: Theme;
}

export interface CalendarData {
   dayOfYear: number;
   daysInYear: number;
   daysLeft: number;
   percentComplete: number;
}

export interface GridDimensions {
   rows: number;
   cols: number;
}

export interface DotData {
   number: number;
   color: string;
}

export interface DeviceResolution {
   width: number;
   height: number;
}

export type Theme = "dark" | "light";

export type DeviceName =
   | 'MacBook Air 13" (M2/M3)'
   | 'MacBook Air 15" (M2/M3)'
   | 'MacBook Pro 14" (M1-M4)'
   | 'MacBook Pro 16" (M1-M4)'
   | 'MacBook Pro 13" (2020)'
   | "Custom";

export interface ThemeColors {
   background: string;
   passedDot: string;
   currentDot: string;
   futureDot: string;
   text: string;
}
