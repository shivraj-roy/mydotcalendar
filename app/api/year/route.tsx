import { NextRequest } from "next/server";
import {
   getDayOfYear,
   getDaysInYear,
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

export async function GET(request: NextRequest) {
   try {
      // 1. Parse URL parameters
      const { searchParams } = new URL(request.url);
      const widthParam = searchParams.get("width");
      const heightParam = searchParams.get("height");
      const startDateParam = searchParams.get("start_date");
      const accentParam = searchParams.get("accent");
      const themeParam = searchParams.get("theme");

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

      // 6. Calculate grid layout - 30 columns to fill width better
      const cols = 30;
      const rows = Math.ceil(daysInYear / cols);

      // 7. Calculate sizing - compact layout matching reference
      const marginX = width * 0.05; // 5% margin on each side (reduced)
      const marginTop = height * 0.08; // 8% top margin (moved up)
      const marginBottom = height * 0.25; // 25% bottom margin (space for Mac dock)

      const availableWidth = width - marginX * 2;
      const availableHeight = height - marginTop - marginBottom;

      // Calculate dot size based on available space
      const cellWidth = availableWidth / cols;
      const cellHeight = availableHeight / rows;
      const cellSize = Math.min(cellWidth, cellHeight);

      // Dot takes 60% of cell, gap is 30%
      const dotDiameter = cellSize * 0.6;
      const dotRadius = dotDiameter / 2;
      const gap = cellSize * 0.3;

      // Calculate actual grid dimensions
      const gridWidth = cols * dotDiameter + (cols - 1) * gap;
      const gridHeight = rows * dotDiameter + (rows - 1) * gap;

      // Center the grid
      const offsetX = (width - gridWidth) / 2;
      const offsetY = marginTop + (availableHeight - gridHeight) / 2;

      // 8. Generate SVG circles
      let circles = "";
      for (let i = 0; i < daysInYear; i++) {
         const dayNum = i + 1;
         const row = Math.floor(i / cols);
         const col = i % cols;

         const cx = offsetX + col * (dotDiameter + gap) + dotRadius;
         const cy = offsetY + row * (dotDiameter + gap) + dotRadius;

         let color: string;
         if (dayNum < dayOfYear) {
            color = colors.passedDot;
         } else if (dayNum === dayOfYear) {
            color = accentColor;
         } else {
            color = colors.futureDot;
         }

         circles += `<circle cx="${cx}" cy="${cy}" r="${dotRadius}" fill="${color}"/>`;
      }

      // 9. Calculate text size relative to image
      const fontSize = Math.max(16, Math.min(32, height * 0.025));
      // Position text just below the grid (with small gap)
      const textY = offsetY + gridHeight + fontSize * 5.5;

      // 10. Generate SVG with viewBox for responsive scaling in browser
      const svg = `<svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 ${width} ${height}"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        style="max-width: 100vw; max-height: 100vh;">
        <rect width="100%" height="100%" fill="${colors.background}"/>
        ${circles}
        <text
          x="${width / 2}"
          y="${textY}"
          text-anchor="middle"
          fill="${accentColor}"
          font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          font-size="${fontSize}"
          font-weight="400"
        >${daysLeft}d left · ${percentComplete}%</text>
      </svg>`;

      // Return SVG
      return new Response(svg, {
         headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
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
