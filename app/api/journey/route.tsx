import { NextRequest } from "next/server";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import { readFileSync } from "fs";
import path from "path";
import { isValidHexColor } from "@/lib/calendar";
import {
   DEFAULT_COLORS,
   DEFAULT_ACCENT,
   DEFAULT_THEME,
   MIN_DIMENSION,
   MAX_DIMENSION,
} from "@/lib/constants";
import { Theme } from "@/lib/types";
import { calculateDistance, type Coordinates } from "@/lib/map-utils";

// Load font file for resvg
const fontPath = path.join(process.cwd(), "fonts", "NotoSansRegular.ttf");
const fontData = readFileSync(fontPath);

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

interface GeocodingResult {
   features: Array<{
      center: [number, number]; // [lng, lat]
      place_name: string;
   }>;
}

async function geocodeLocation(
   query: string,
): Promise<{ lat: number; lng: number; name: string } | null> {
   const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;

   const response = await fetch(url);
   if (!response.ok) return null;

   const data: GeocodingResult = await response.json();
   if (!data.features || data.features.length === 0) return null;

   const [lng, lat] = data.features[0].center;
   return { lat, lng, name: data.features[0].place_name };
}

async function fetchSatelliteImage(
   lat: number,
   lng: number,
   zoom: number,
   width: number,
   height: number,
): Promise<Buffer | null> {
   // Mapbox Static Images API - satellite-v9 style (no labels)
   const url = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lng},${lat},${zoom},0/${width}x${height}?access_token=${MAPBOX_TOKEN}`;

   const response = await fetch(url);
   if (!response.ok) return null;

   return Buffer.from(await response.arrayBuffer());
}

export async function GET(request: NextRequest) {
   try {
      if (!MAPBOX_TOKEN) {
         return new Response(
            JSON.stringify({ error: "Mapbox API token not configured" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
         );
      }

      // 1. Parse URL parameters
      const { searchParams } = new URL(request.url);
      const widthParam = searchParams.get("width");
      const heightParam = searchParams.get("height");
      const originParam = searchParams.get("origin");
      const destinationParam = searchParams.get("destination");
      const targetDateParam = searchParams.get("target_date");
      const zoomParam = searchParams.get("zoom");
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

      if (!originParam || !destinationParam || !targetDateParam) {
         return new Response(
            JSON.stringify({
               error: "Missing required parameters: origin, destination, target_date",
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

      // Validate target date format
      const targetDate = new Date(targetDateParam);
      if (isNaN(targetDate.getTime())) {
         return new Response(
            JSON.stringify({
               error: "Invalid target_date. Use YYYY-MM-DD format",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
         );
      }

      // 3. Parse optional parameters
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

      // 4. Geocode both locations
      let originCoords: Coordinates, destinationCoords: Coordinates;
      let originName: string, destinationName: string;

      // Geocode origin location
      const geocodedOrigin = await geocodeLocation(originParam);
      if (!geocodedOrigin) {
         return new Response(
            JSON.stringify({
               error: "Could not find origin location. Try a different search term.",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
         );
      }
      originCoords = { lat: geocodedOrigin.lat, lng: geocodedOrigin.lng };
      originName = geocodedOrigin.name.split(",")[0].trim(); // Get just city/place name

      // Geocode destination location
      const geocodedDestination = await geocodeLocation(destinationParam);
      if (!geocodedDestination) {
         return new Response(
            JSON.stringify({
               error: "Could not find destination location. Try a different search term.",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
         );
      }
      destinationCoords = {
         lat: geocodedDestination.lat,
         lng: geocodedDestination.lng,
      };
      destinationName = geocodedDestination.name.split(",")[0].trim(); // Get just city/place name

      // 5. Determine which location to show based on date
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day
      targetDate.setHours(0, 0, 0, 0);

      const isArrived = today >= targetDate;
      const displayLocation = isArrived ? destinationCoords : originCoords;

      // Calculate distance (not displayed, but kept for potential future use)
      const distance = calculateDistance(originCoords, destinationCoords);

      // 6. Fetch satellite image centered on the display location
      const zoom = zoomParam ? parseFloat(zoomParam) : 16; // Default to Close (Streets) level
      const fetchWidth = Math.min(800, width);
      const fetchHeight = Math.min(800, height);

      const satelliteBuffer = await fetchSatelliteImage(
         displayLocation.lat,
         displayLocation.lng,
         zoom,
         fetchWidth,
         fetchHeight,
      );

      if (!satelliteBuffer) {
         return new Response(
            JSON.stringify({ error: "Failed to fetch satellite imagery" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
         );
      }

      // 7. Process image to get pixel data
      const { data: pixels, info } = await sharp(satelliteBuffer)
         .grayscale()
         .raw()
         .toBuffer({ resolveWithObject: true });

      // 8. Calculate dot grid
      const colors = DEFAULT_COLORS[theme];
      const accentColor = `#${accent}`;

      const dotSpacing = Math.max(8, Math.min(16, width / 120));
      const cols = Math.floor(width / dotSpacing);
      const rows = Math.floor(height / dotSpacing);
      const dotDiameter = dotSpacing * 0.6;
      const dotRadius = dotDiameter / 2;
      const cornerRadius = dotDiameter * 0.2;

      // Center dot is 2x larger (marks the current location)
      const centerDotDiameter = dotDiameter * 2;
      const centerDotRadius = centerDotDiameter / 2;
      const centerCornerRadius = centerDotDiameter * 0.2;

      const gridWidth = cols * dotSpacing;
      const gridHeight = rows * dotSpacing;
      const offsetX = (width - gridWidth) / 2;
      const offsetY = (height - gridHeight) / 2;

      // Center position for the location marker
      const centerCol = Math.floor(cols / 2);
      const centerRow = Math.floor(rows / 2);

      // 9. Generate dots based on satellite image brightness
      let shapes = "";

      for (let row = 0; row < rows; row++) {
         for (let col = 0; col < cols; col++) {
            const sampleX = Math.floor((col / cols) * info.width);
            const sampleY = Math.floor((row / rows) * info.height);
            const pixelIndex = sampleY * info.width + sampleX;
            const brightness = pixels[pixelIndex] || 128;

            const x = offsetX + col * dotSpacing;
            const y = offsetY + row * dotSpacing;
            const cx = x + dotRadius;
            const cy = y + dotRadius;

            // Determine if this is the center dot (location marker)
            const isCenter = col === centerCol && row === centerRow;

            let color: string;
            if (isCenter) {
               // Center dot is accent color
               color = accentColor;
            } else {
               // Map brightness to grayscale
               if (theme === "dark") {
                  const ratio = brightness / 255;
                  if (ratio < 0.4) {
                     color = colors.futureDot;
                  } else if (ratio > 0.7) {
                     color = colors.passedDot;
                  } else {
                     color = "#5a5a5a";
                  }
               } else {
                  const ratio = brightness / 255;
                  if (ratio < 0.4) {
                     color = colors.passedDot;
                  } else if (ratio > 0.7) {
                     color = colors.futureDot;
                  } else {
                     color = "#a0a0a0";
                  }
               }
            }

            // Draw the dot (center dot is 2x larger)
            if (isCenter) {
               const centerX = cx - centerDotRadius;
               const centerY = cy - centerDotRadius;
               if (shape === "circle") {
                  shapes += `<circle cx="${cx}" cy="${cy}" r="${centerDotRadius}" fill="${color}"/>`;
               } else if (shape === "square") {
                  shapes += `<rect x="${centerX}" y="${centerY}" width="${centerDotDiameter}" height="${centerDotDiameter}" fill="${color}"/>`;
               } else if (shape === "rounded") {
                  shapes += `<rect x="${centerX}" y="${centerY}" width="${centerDotDiameter}" height="${centerDotDiameter}" rx="${centerCornerRadius}" ry="${centerCornerRadius}" fill="${color}"/>`;
               }
            } else {
               // Regular dot
               if (shape === "circle") {
                  shapes += `<circle cx="${cx}" cy="${cy}" r="${dotRadius}" fill="${color}"/>`;
               } else if (shape === "square") {
                  shapes += `<rect x="${x}" y="${y}" width="${dotDiameter}" height="${dotDiameter}" fill="${color}"/>`;
               } else if (shape === "rounded") {
                  shapes += `<rect x="${x}" y="${y}" width="${dotDiameter}" height="${dotDiameter}" rx="${cornerRadius}" ry="${cornerRadius}" fill="${color}"/>`;
               }
            }
         }
      }

      // 10. Generate status text for glass pill
      const daysLeft = Math.ceil(
         (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      let statusText: string;
      // Sanitize destination name to ASCII only
      const sanitizedDest = destinationName.replace(/[^\x00-\x7F]/g, "");

      if (isArrived) {
         // On or after target date
         statusText = `Arrived at ${sanitizedDest}`;
      } else {
         // Before target date
         if (daysLeft === 1) {
            statusText = `Tomorrow - ${sanitizedDest}`;
         } else {
            statusText = `${daysLeft}d until ${sanitizedDest}`;
         }
      }

      // Calculate pill dimensions based on text length
      const statusFontSize = Math.max(18, Math.min(24, width / 60)); // Larger font size
      const pillWidth = Math.max(280, statusText.length * statusFontSize * 0.65);
      const pillHeight = 70; // Increased from 50 to 70
      const pillX = width / 2 - pillWidth / 2;
      const pillY = height - 240; // Adjusted for larger pill

      // 14. Generate glass pill background and text
      const glassPill = `
         <rect
            x="${pillX}"
            y="${pillY}"
            width="${pillWidth}"
            height="${pillHeight}"
            rx="25"
            fill="${theme === "dark" ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.7)"}"
            stroke="${theme === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.15)"}"
            stroke-width="1"
         />
         <text
            x="${width / 2}"
            y="${pillY + pillHeight / 2 + statusFontSize / 3}"
            text-anchor="middle"
            fill="${accentColor}"
            font-size="${statusFontSize}"
            font-weight="500"
            font-family="Noto Sans"
         >${statusText}</text>
      `;

      // 15. Generate SVG
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="100%" height="100%" fill="${colors.background}"/>
        ${shapes}
        ${glassPill}
      </svg>`;

      // 16. Return based on format
      if (format === "svg") {
         return new Response(svg, {
            headers: {
               "Content-Type": "image/svg+xml",
               "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
         });
      }

      // Convert SVG to PNG using resvg with embedded font
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
      });

      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();

      return new Response(Buffer.from(pngBuffer), {
         headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
            "Content-Disposition": `inline; filename="journey-${width}x${height}.png"`,
         },
      });
   } catch (error) {
      console.error("Error generating journey wallpaper:", error);
      return new Response(
         JSON.stringify({
            error: "Internal server error",
            details: String(error),
         }),
         { status: 500, headers: { "Content-Type": "application/json" } },
      );
   }
}
