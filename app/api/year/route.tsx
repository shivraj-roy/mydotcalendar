import { NextRequest } from "next/server";
import sharp from "sharp";
import path from "path";
import {
   getDayOfYear,
   getDaysInYear,
   getDaysInMonth,
   getFirstDayOfMonth,
   getMonthName,
   getDayOfYearForDate,
   isValidDateFormat,
   isValidHexColor,
   getCurrentYearStart,
} from "@/lib/calendar";
import {
   DEFAULT_COLORS,
   DEFAULT_ACCENT,
   DEFAULT_THEME,
   MIN_DIMENSION,
   MAX_DIMENSION,
} from "@/lib/constants";
import { Theme } from "@/lib/types";

// Configure fontconfig for sharp SVG rendering
const fontsPath = path.join(process.cwd(), "fonts");
process.env.FONTCONFIG_PATH = fontsPath;
process.env.FONTCONFIG_FILE = path.join(fontsPath, "fonts.conf");

export async function GET(request: NextRequest) {
   try {
      // 1. Parse URL parameters
      const { searchParams } = new URL(request.url);
      const widthParam = searchParams.get("width");
      const heightParam = searchParams.get("height");
      const startDateParam = searchParams.get("start_date");
      const accentParam = searchParams.get("accent");
      const themeParam = searchParams.get("theme");
      const shapeParam = searchParams.get("shape");
      const formatParam = searchParams.get("format");
      const layoutParam = searchParams.get("layout");

      // 2. Validate required parameters
      if (!widthParam || !heightParam) {
         return new Response(
            JSON.stringify({
               error: "Missing required parameters: width, height",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
         );
      }

      const width = parseInt(widthParam, 10);
      const height = parseInt(heightParam, 10);

      if (isNaN(width) || isNaN(height)) {
         return new Response(
            JSON.stringify({ error: "Width and height must be valid numbers" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
         );
      }

      if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
         return new Response(
            JSON.stringify({
               error: `Width and height must be at least ${MIN_DIMENSION}px`,
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
         );
      }

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
         return new Response(
            JSON.stringify({
               error: `Width and height must be at most ${MAX_DIMENSION}px`,
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
         );
      }

      // 3. Validate optional parameters
      const startDate = startDateParam || getCurrentYearStart();
      if (startDateParam && !isValidDateFormat(startDateParam)) {
         return new Response(
            JSON.stringify({
               error: "Invalid start_date format. Use YYYY-MM-DD",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
         );
      }

      const accent = accentParam || DEFAULT_ACCENT;
      if (accentParam && !isValidHexColor(accentParam)) {
         return new Response(
            JSON.stringify({
               error: "Invalid accent color. Use 6-digit hex without #",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
         );
      }

      const theme: Theme =
         themeParam === "light" || themeParam === "dark"
            ? themeParam
            : (DEFAULT_THEME as Theme);

      // Shape: circle (default), square, or rounded
      type Shape = "circle" | "square" | "rounded";
      const shape: Shape =
         shapeParam === "square" || shapeParam === "rounded"
            ? shapeParam
            : "circle";

      // Format: png (default) or svg
      const format = formatParam === "svg" ? "svg" : "png";

      // Layout: year (default continuous) or month (grouped by month)
      type Layout = "year" | "month";
      const layout: Layout = layoutParam === "month" ? "month" : "year";

      // 4. Calculate calendar data
      const today = new Date();
      const dayOfYear = getDayOfYear(today);
      const startYear = new Date(startDate).getFullYear();
      const daysInYear = getDaysInYear(startYear);
      const daysLeft = daysInYear - dayOfYear;
      const percentComplete = Math.round((dayOfYear / daysInYear) * 100);

      // 5. Get theme colors
      const colors = DEFAULT_COLORS[theme];
      const accentColor = `#${accent}`;

      let svg: string;

      if (layout === "month") {
         // ============ MONTH LAYOUT ============
         // 4 columns x 3 rows of months
         const monthCols = 4;
         const monthRows = 3;

         // Calculate sizing
         const marginX = width * 0.12; // Increased side margin
         const marginTop = height * 0.08;
         const marginBottom = height * 0.15;

         const availableWidth = width - marginX * 2;
         const availableHeight = height - marginTop - marginBottom;

         // Each month block size - gaps between months
         const monthGapX = width * 0.02; // Horizontal gap between months
         const monthGapY = height * -0.2; // Minimal vertical gap between rows
         const monthBlockWidth =
            (availableWidth - monthGapX * (monthCols - 1)) / monthCols;
         const monthBlockHeight =
            (availableHeight - monthGapY * (monthRows - 1)) / monthRows;

         // Days grid within each month: 7 columns (days of week), up to 6 rows
         const dayCols = 7;
         const dayRows = 6;

         // Calculate dot size for month layout
         const monthPaddingX = monthBlockWidth * 0.1;
         const monthPaddingTop = monthBlockHeight * 0.08; // Reduced space for label
         const monthPaddingBottom = monthBlockHeight * 0.05;

         const dayAreaWidth = monthBlockWidth - monthPaddingX * 2;
         const dayAreaHeight =
            monthBlockHeight - monthPaddingTop - monthPaddingBottom;

         const dayCellWidth = dayAreaWidth / dayCols;
         const dayCellHeight = dayAreaHeight / dayRows;
         const dayCellSize = Math.min(dayCellWidth, dayCellHeight);

         const dotDiameter = dayCellSize * 0.5; // Smaller dots
         const dotRadius = dotDiameter / 2;
         const dayGap = dayCellSize * 0.3;
         const cornerRadius = dotDiameter * 0.2;

         // Font sizes
         const labelFontSize = Math.max(
            12,
            Math.min(24, monthBlockHeight * 0.1),
         );
         const statusFontSize = Math.max(16, Math.min(32, height * 0.025));

         let shapes = "";

         // Generate each month
         for (let m = 1; m <= 12; m++) {
            const monthCol = (m - 1) % monthCols;
            const monthRow = Math.floor((m - 1) / monthCols);

            const monthX = marginX + monthCol * (monthBlockWidth + monthGapX);
            const monthY =
               marginTop + monthRow * (monthBlockHeight + monthGapY);

            // Month label - gray color, closer to dots
            const labelX = monthX + monthPaddingX;
            const labelY = monthY + labelFontSize * 1.1;
            shapes += `<text x="${labelX}" y="${labelY}" fill="${colors.futureDot}" font-family="Noto Sans, sans-serif" font-size="${labelFontSize}" font-weight="400">${getMonthName(m)}</text>`;

            // Days grid
            const daysInThisMonth = getDaysInMonth(startYear, m);
            const firstDayOfWeek = getFirstDayOfMonth(startYear, m);

            const dayGridX = monthX + monthPaddingX;
            const dayGridY = monthY + monthPaddingTop;

            for (let d = 1; d <= daysInThisMonth; d++) {
               const dayIndex = firstDayOfWeek + d - 1;
               const row = Math.floor(dayIndex / 7);
               const col = dayIndex % 7;

               const x = dayGridX + col * (dotDiameter + dayGap);
               const y = dayGridY + row * (dotDiameter + dayGap);
               const cx = x + dotRadius;
               const cy = y + dotRadius;

               // Determine color based on day of year
               const thisDayOfYear = getDayOfYearForDate(startYear, m, d);
               let color: string;
               if (thisDayOfYear < dayOfYear) {
                  color = colors.passedDot;
               } else if (thisDayOfYear === dayOfYear) {
                  color = accentColor;
               } else {
                  color = colors.futureDot;
               }

               if (shape === "circle") {
                  shapes += `<circle cx="${cx}" cy="${cy}" r="${dotRadius}" fill="${color}"/>`;
               } else if (shape === "square") {
                  shapes += `<rect x="${x}" y="${y}" width="${dotDiameter}" height="${dotDiameter}" fill="${color}"/>`;
               } else if (shape === "rounded") {
                  shapes += `<rect x="${x}" y="${y}" width="${dotDiameter}" height="${dotDiameter}" rx="${cornerRadius}" ry="${cornerRadius}" fill="${color}"/>`;
               }
            }
         }

         // Status text at bottom - lifted up
         const textY = height - marginBottom * 1;

         svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
           <rect width="100%" height="100%" fill="${colors.background}"/>
           ${shapes}
           <text
             x="${width / 2}"
             y="${textY}"
             text-anchor="middle"
             fill="${accentColor}"
             font-size="${statusFontSize}"
             font-weight="400"
           >${daysLeft}d left - ${percentComplete}%</text>
         </svg>`;
      } else {
         // ============ YEAR LAYOUT (continuous dots) ============
         // 6. Calculate grid layout - 30 columns to fill width better
         const cols = 30;
         const rows = Math.ceil(daysInYear / cols);

         // 7. Calculate sizing - compact layout matching reference
         const marginX = width * 0.05;
         const marginTop = height * 0.08;
         const marginBottom = height * 0.25;

         const availableWidth = width - marginX * 2;
         const availableHeight = height - marginTop - marginBottom;

         // Calculate dot size based on available space
         const cellWidth = availableWidth / cols;
         const cellHeight = availableHeight / rows;
         const cellSize = Math.min(cellWidth, cellHeight);

         // Dot takes 60% of cell, gap is 30%
         const dotDiameter = cellSize * 0.45;
         const dotRadius = dotDiameter / 2;
         const gap = cellSize * 0.3;

         // Calculate actual grid dimensions
         const gridWidth = cols * dotDiameter + (cols - 1) * gap;
         const gridHeight = rows * dotDiameter + (rows - 1) * gap;

         // Center the grid
         const offsetX = (width - gridWidth) / 2;
         const offsetY = marginTop + (availableHeight - gridHeight) / 2;

         // 8. Generate SVG shapes based on shape parameter
         let shapes = "";
         const cornerRadius = dotDiameter * 0.2;

         for (let i = 0; i < daysInYear; i++) {
            const dayNum = i + 1;
            const row = Math.floor(i / cols);
            const col = i % cols;

            const x = offsetX + col * (dotDiameter + gap);
            const y = offsetY + row * (dotDiameter + gap);
            const cx = x + dotRadius;
            const cy = y + dotRadius;

            let color: string;
            if (dayNum < dayOfYear) {
               color = colors.passedDot;
            } else if (dayNum === dayOfYear) {
               color = accentColor;
            } else {
               color = colors.futureDot;
            }

            if (shape === "circle") {
               shapes += `<circle cx="${cx}" cy="${cy}" r="${dotRadius}" fill="${color}"/>`;
            } else if (shape === "square") {
               shapes += `<rect x="${x}" y="${y}" width="${dotDiameter}" height="${dotDiameter}" fill="${color}"/>`;
            } else if (shape === "rounded") {
               shapes += `<rect x="${x}" y="${y}" width="${dotDiameter}" height="${dotDiameter}" rx="${cornerRadius}" ry="${cornerRadius}" fill="${color}"/>`;
            }
         }

         // 9. Calculate text size relative to image
         const fontSize = Math.max(16, Math.min(32, height * 0.025));
         const textY = offsetY + gridHeight + fontSize * 5.5;

         // 10. Generate SVG
         svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
           <rect width="100%" height="100%" fill="${colors.background}"/>
           ${shapes}
           <text
             x="${width / 2}"
             y="${textY}"
             text-anchor="middle"
             fill="${accentColor}"
             font-size="${fontSize}"
             font-weight="400"
           >${daysLeft}d left - ${percentComplete}%</text>
         </svg>`;
      }

      // 11. Return based on format
      if (format === "svg") {
         return new Response(svg, {
            headers: {
               "Content-Type": "image/svg+xml",
               "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
         });
      }

      // Convert SVG to high-quality PNG using sharp
      // Use 150 DPI for crisp Retina rendering with sharpening for defined edges
      const pngBuffer = await sharp(Buffer.from(svg), { density: 150 })
         .resize(width, height, {
            fit: "fill",
            kernel: "lanczos3",
         })
         .sharpen({
            sigma: 1,
            m1: 2.5,
            m2: 1.5,
         })
         .png({
            compressionLevel: 6,
            palette: false,
         })
         .toBuffer();

      return new Response(new Uint8Array(pngBuffer), {
         headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
            "Content-Disposition": `inline; filename="mydotcalendar-${width}x${height}.png"`,
         },
      });
   } catch (error) {
      console.error("Error generating wallpaper:", error);
      return new Response(
         JSON.stringify({
            error: "Internal server error",
            details: String(error),
         }),
         { status: 500, headers: { "Content-Type": "application/json" } },
      );
   }
}
