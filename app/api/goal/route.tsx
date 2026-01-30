import { NextRequest } from "next/server";
import sharp from "sharp";
import path from "path";
import { isValidDateFormat, isValidHexColor } from "@/lib/calendar";
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
      const goalParam = searchParams.get("goal");
      const goalDateParam = searchParams.get("goal_date");
      const startDateParam = searchParams.get("start_date");
      const accentParam = searchParams.get("accent");
      const themeParam = searchParams.get("theme");
      const shapeParam = searchParams.get("shape");
      const formatParam = searchParams.get("format");

      // 2. Validate required parameters
      if (!widthParam || !heightParam) {
         return new Response(
            JSON.stringify({
               error: "Missing required parameters: width, height",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
         );
      }

      if (!goalParam) {
         return new Response(
            JSON.stringify({
               error: "Missing required parameter: goal",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
         );
      }

      if (!goalDateParam) {
         return new Response(
            JSON.stringify({
               error: "Missing required parameter: goal_date (deadline)",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
         );
      }

      if (!startDateParam) {
         return new Response(
            JSON.stringify({
               error: "Missing required parameter: start_date",
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

      // 3. Validate date formats
      if (!isValidDateFormat(startDateParam)) {
         return new Response(
            JSON.stringify({
               error: "Invalid start_date format. Use YYYY-MM-DD",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
         );
      }

      if (!isValidDateFormat(goalDateParam)) {
         return new Response(
            JSON.stringify({
               error: "Invalid goal_date format. Use YYYY-MM-DD",
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

      type Shape = "circle" | "square" | "rounded";
      const shape: Shape =
         shapeParam === "square" || shapeParam === "rounded"
            ? shapeParam
            : "circle";

      const format = formatParam === "svg" ? "svg" : "png";

      // 4. Calculate goal data
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startDate = new Date(startDateParam);
      startDate.setHours(0, 0, 0, 0);

      const goalDate = new Date(goalDateParam);
      goalDate.setHours(0, 0, 0, 0);

      // Total days in the goal period (inclusive)
      const totalDays =
         Math.ceil(
            (goalDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
         ) + 1;

      // Days since start (0-indexed, so day 1 = index 0)
      const daysSinceStart = Math.ceil(
         (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Check if goal hasn't started yet
      const goalNotStarted = today < startDate;
      const daysUntilStart = goalNotStarted
         ? Math.ceil(
              (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
           )
         : 0;

      // Check if goal is completed
      const goalCompleted = today > goalDate;

      // Days left (from today to goal date)
      const daysLeft = goalCompleted
         ? 0
         : Math.max(
              0,
              Math.ceil(
                 (goalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
              ),
           );

      // Current day number in the goal (1-indexed for display)
      const currentDayNum = goalNotStarted
         ? 0
         : Math.min(daysSinceStart + 1, totalDays);

      // Percentage complete
      const percentComplete = goalNotStarted
         ? 0
         : Math.min(100, Math.round((currentDayNum / totalDays) * 100));

      // 5. Get theme colors
      const colors = DEFAULT_COLORS[theme];
      const accentColor = `#${accent}`;

      // 6. Calculate grid layout
      // Dynamic columns based on total days
      let cols: number;
      if (totalDays <= 30) {
         cols = 10;
      } else if (totalDays <= 100) {
         cols = 14;
      } else if (totalDays <= 200) {
         cols = 18;
      } else {
         cols = 22;
      }
      const rows = Math.ceil(totalDays / cols);

      // 7. Calculate sizing
      const marginX = width * 0.15;
      const marginTop = height * 0.22;
      const marginBottom = height * 0.22;

      const availableWidth = width - marginX * 2;
      const availableHeight = height - marginTop - marginBottom;

      const cellWidth = availableWidth / cols;
      const cellHeight = availableHeight / rows;
      const cellSize = Math.min(cellWidth, cellHeight);

      const dotDiameter = cellSize * 0.55;
      const dotRadius = dotDiameter / 2;
      const gap = cellSize * 0.35;

      const gridWidth = cols * dotDiameter + (cols - 1) * gap;
      const gridHeight = rows * dotDiameter + (rows - 1) * gap;

      const offsetX = (width - gridWidth) / 2;
      const offsetY = marginTop + (availableHeight - gridHeight) / 2;

      // 8. Generate SVG shapes
      let shapes = "";
      const cornerRadius = dotDiameter * 0.2;

      for (let i = 0; i < totalDays; i++) {
         const dayNum = i + 1;
         const row = Math.floor(i / cols);
         const col = i % cols;

         const x = offsetX + col * (dotDiameter + gap);
         const y = offsetY + row * (dotDiameter + gap);
         const cx = x + dotRadius;
         const cy = y + dotRadius;

         let color: string;

         if (goalNotStarted) {
            // Goal hasn't started - all dots are future (gray)
            color = colors.futureDot;
         } else if (goalCompleted) {
            // Goal completed - all dots are passed
            color = colors.passedDot;
         } else if (dayNum < currentDayNum) {
            // Past days
            color = colors.passedDot;
         } else if (dayNum === currentDayNum) {
            // Current day
            color = accentColor;
         } else {
            // Future days
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

      // 9. Calculate text sizes
      const titleFontSize = Math.max(18, Math.min(36, height * 0.03));
      const statusFontSize = Math.max(16, Math.min(32, height * 0.025));

      const titleY = marginTop * 0.45;
      const textY = height - marginBottom * 0.65;

      // 10. Generate status text
      let statusText: string;
      if (goalNotStarted) {
         statusText = `Goal starts in ${daysUntilStart}d`;
      } else if (goalCompleted) {
         statusText = `Goal completed!`;
      } else {
         statusText = `${daysLeft}d left - ${percentComplete}%`;
      }

      // Escape HTML entities in goal title
      const escapedGoal = goalParam
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");

      // 11. Generate SVG
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="100%" height="100%" fill="${colors.background}"/>
        <text
          x="${width / 2}"
          y="${titleY}"
          text-anchor="middle"
          fill="${colors.passedDot}"
          font-size="${titleFontSize}"
          font-weight="400"
        >${escapedGoal}</text>
        ${shapes}
        <text
          x="${width / 2}"
          y="${textY}"
          text-anchor="middle"
          fill="${accentColor}"
          font-size="${statusFontSize}"
          font-weight="400"
        >${statusText}</text>
      </svg>`;

      // 12. Return based on format
      if (format === "svg") {
         return new Response(svg, {
            headers: {
               "Content-Type": "image/svg+xml",
               "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
         });
      }

      // Convert SVG to PNG
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
            "Content-Disposition": `inline; filename="goal-calendar-${width}x${height}.png"`,
         },
      });
   } catch (error) {
      console.error("Error generating goal wallpaper:", error);
      return new Response(
         JSON.stringify({
            error: "Internal server error",
            details: String(error),
         }),
         { status: 500, headers: { "Content-Type": "application/json" } },
      );
   }
}
