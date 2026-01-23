/**
 * Date calculations and calendar logic for MyDotCalendar
 */

import { GridDimensions } from "./types";

/**
 * Check if a year is a leap year
 */
export function isLeapYear(year: number): boolean {
   return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Get total days in a specific year
 */
export function getDaysInYear(year: number): 365 | 366 {
   return isLeapYear(year) ? 366 : 365;
}

/**
 * Calculate which day of the year a date is (1-365/366)
 */
export function getDayOfYear(date: Date): number {
   const start = new Date(date.getFullYear(), 0, 0);
   const diff = date.getTime() - start.getTime();
   const oneDay = 1000 * 60 * 60 * 24;
   return Math.floor(diff / oneDay);
}

/**
 * Calculate days remaining in the year
 */
export function getDaysRemaining(date: Date): number {
   const dayOfYear = getDayOfYear(date);
   const daysInYear = getDaysInYear(date.getFullYear());
   return daysInYear - dayOfYear;
}

/**
 * Calculate percentage of year complete
 */
export function getPercentComplete(date: Date): number {
   const dayOfYear = getDayOfYear(date);
   const daysInYear = getDaysInYear(date.getFullYear());
   return Math.round((dayOfYear / daysInYear) * 100);
}

/**
 * Calculate optimal grid dimensions for dots
 * @param totalDots - Total number of dots (365 or 366)
 * @param aspectRatio - Screen width / height
 * @returns Object with rows and cols
 */
export function calculateGridDimensions(
   totalDots: number,
   aspectRatio: number,
): GridDimensions {
   // Start with square root as baseline
   const sqrt = Math.sqrt(totalDots);
   let bestRows = Math.round(sqrt);
   let bestCols = Math.ceil(totalDots / bestRows);
   let bestDiff = Math.abs(bestCols / bestRows - aspectRatio);

   // Try different combinations to match aspect ratio
   for (
      let rows = Math.floor(sqrt) - 10;
      rows <= Math.ceil(sqrt) + 10;
      rows++
   ) {
      if (rows <= 0) continue;
      const cols = Math.ceil(totalDots / rows);
      const currentAspectRatio = cols / rows;
      const diff = Math.abs(currentAspectRatio - aspectRatio);

      // Check if this combination is closer to target aspect ratio
      if (diff < bestDiff) {
         bestRows = rows;
         bestCols = cols;
         bestDiff = diff;
      }
   }

   return { rows: bestRows, cols: bestCols };
}

/**
 * Calculate dot size based on screen dimensions
 */
export function calculateDotSize(
   width: number,
   height: number,
   rows: number,
   cols: number,
   margin: number = 60,
): number {
   const availableWidth = width - margin * 2;
   const availableHeight = height - margin * 2 - 100; // Reserve space for text

   const dotWidthSize = availableWidth / cols;
   const dotHeightSize = availableHeight / rows;

   // Use smaller of the two, with 0.7 factor for spacing
   return Math.floor(Math.min(dotWidthSize, dotHeightSize) * 0.7);
}

/**
 * Calculate gap size between dots
 */
export function calculateGapSize(
   width: number,
   height: number,
   rows: number,
   cols: number,
   dotSize: number,
   margin: number = 60,
): number {
   const availableWidth = width - margin * 2;
   const availableHeight = height - margin * 2 - 100;

   const gapFromWidth = (availableWidth - dotSize * cols) / (cols - 1);
   const gapFromHeight = (availableHeight - dotSize * rows) / (rows - 1);

   return Math.floor(Math.min(gapFromWidth, gapFromHeight));
}

/**
 * Validate date string format (YYYY-MM-DD)
 */
export function isValidDateFormat(dateString: string): boolean {
   const regex = /^\d{4}-\d{2}-\d{2}$/;
   if (!regex.test(dateString)) return false;

   const date = new Date(dateString);
   return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Get start of current year (YYYY-01-01)
 */
export function getCurrentYearStart(): string {
   const year = new Date().getFullYear();
   return `${year}-01-01`;
}

/**
 * Validate hex color format (without #)
 */
export function isValidHexColor(color: string): boolean {
   const regex = /^[0-9A-Fa-f]{6}$/;
   return regex.test(color);
}

/**
 * Get days in a specific month (1-indexed: 1 = January)
 */
export function getDaysInMonth(year: number, month: number): number {
   return new Date(year, month, 0).getDate();
}

/**
 * Get the day of week the month starts on (0 = Sunday, 6 = Saturday)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
   return new Date(year, month - 1, 1).getDay();
}

/**
 * Get month name abbreviation
 */
export function getMonthName(month: number): string {
   const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
   ];
   return months[month - 1];
}

/**
 * Get day of year for a specific date in a year
 */
export function getDayOfYearForDate(
   year: number,
   month: number,
   day: number,
): number {
   const date = new Date(year, month - 1, day);
   const start = new Date(year, 0, 0);
   const diff = date.getTime() - start.getTime();
   const oneDay = 1000 * 60 * 60 * 24;
   return Math.floor(diff / oneDay);
}
