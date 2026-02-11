import { NextRequest } from "next/server";
import { Resvg } from "@resvg/resvg-js";
import { PostHog } from "posthog-node";
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

// Load font file for resvg
const fontPath = path.join(process.cwd(), "fonts", "NotoSansRegular.ttf");

const LIFE_EXPECTANCY = 90;
const WEEKS_PER_YEAR = 52;
const TOTAL_WEEKS = LIFE_EXPECTANCY * WEEKS_PER_YEAR; // 4680

export async function GET(request: NextRequest) {
   try {
      // 1. Parse URL parameters
      const { searchParams } = new URL(request.url);
      const widthParam = searchParams.get("width");
      const heightParam = searchParams.get("height");
      const birthdayParam = searchParams.get("birthday");
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

      if (!birthdayParam) {
         return new Response(
            JSON.stringify({
               error: "Missing required parameter: birthday",
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

      if (!isValidDateFormat(birthdayParam)) {
         return new Response(
            JSON.stringify({
               error: "Invalid birthday format. Use YYYY-MM-DD",
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

      // 3. Track with PostHog
      const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
         host:
            process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      });

      posthog.capture({
         distinctId: request.headers.get("x-forwarded-for") || "anonymous",
         event: "wallpaper_generated_api",
         properties: {
            calendar_type: "life",
            width,
            height,
            theme,
            shape,
            accent,
            format,
            user_agent: request.headers.get("user-agent"),
         },
      });

      await posthog.shutdown();

      // 4. Calculate life data
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const birthday = new Date(birthdayParam);
      birthday.setHours(0, 0, 0, 0);

      // Weeks lived since birthday
      const msLived = today.getTime() - birthday.getTime();
      const weeksLived = Math.floor(msLived / (1000 * 60 * 60 * 24 * 7));
      const currentWeek = Math.min(weeksLived + 1, TOTAL_WEEKS);
      const percentComplete = parseFloat(
         ((weeksLived / TOTAL_WEEKS) * 100).toFixed(1),
      );

      // 5. Get theme colors
      const colors = DEFAULT_COLORS[theme];
      const accentColor = `#${accent}`;

      // 6. Calculate grid layout: 90 columns × 52 rows (landscape)
      const cols = LIFE_EXPECTANCY;
      const rows = WEEKS_PER_YEAR;

      const marginX = width * 0.1;
      const marginTop = height * 0.18;
      const marginBottom = height * 0.22;

      const availableWidth = width - marginX * 2;
      const availableHeight = height - marginTop - marginBottom;

      const cellWidth = availableWidth / cols;
      const cellHeight = availableHeight / rows;
      const cellSize = Math.min(cellWidth, cellHeight);

      const dotDiameter = cellSize * 0.6;
      const dotRadius = dotDiameter / 2;
      const gap = cellSize * 0.3;
      const cornerRadius = dotDiameter * 0.2;

      const gridWidth = cols * dotDiameter + (cols - 1) * gap;
      const gridHeight = rows * dotDiameter + (rows - 1) * gap;

      const offsetX = (width - gridWidth) / 2;
      const offsetY = marginTop + (availableHeight - gridHeight) / 2;

      // 7. Generate dots
      let shapes = "";

      for (let i = 0; i < TOTAL_WEEKS; i++) {
         const weekNum = i + 1;
         const row = Math.floor(i / cols);
         const col = i % cols;

         const x = offsetX + col * (dotDiameter + gap);
         const y = offsetY + row * (dotDiameter + gap);
         const cx = x + dotRadius;
         const cy = y + dotRadius;

         let color: string;
         if (weekNum < currentWeek) {
            color = colors.passedDot;
         } else if (weekNum === currentWeek) {
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

      // 8. Status text
      const fontSize = Math.max(16, Math.min(32, height * 0.028));
      const textY = offsetY + gridHeight + (height - (offsetY + gridHeight)) / 2;

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">
        <rect width="100%" height="100%" fill="${colors.background}"/>
        ${shapes}
        <text
          x="${width / 2}"
          y="${textY}"
          text-anchor="middle"
          fill="${accentColor}"
          font-size="${fontSize}"
          font-weight="500"
          font-family="Noto Sans"
          text-rendering="geometricPrecision"
        >${percentComplete}% to ${LIFE_EXPECTANCY}</text>
      </svg>`;

      // 9. Return based on format
      if (format === "svg") {
         return new Response(svg, {
            headers: {
               "Content-Type": "image/svg+xml",
               "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
         });
      }

      const resvg = new Resvg(svg, {
         fitTo: {
            mode: "width",
            value: width,
         },
         font: {
            fontFiles: [fontPath],
            loadSystemFonts: false,
            defaultFontFamily: "Noto Sans",
         },
         dpi: 600,
         shapeRendering: 1,
         textRendering: 2,
         imageRendering: 1,
      });

      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();

      return new Response(Buffer.from(pngBuffer), {
         headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
            "Content-Disposition": `inline; filename="life-calendar-${width}x${height}.png"`,
         },
      });
   } catch (error) {
      console.error("Error generating life calendar:", error);
      return new Response(
         JSON.stringify({
            error: "Internal server error",
            details: String(error),
         }),
         { status: 500, headers: { "Content-Type": "application/json" } },
      );
   }
}
