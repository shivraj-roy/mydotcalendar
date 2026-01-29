import { NextRequest } from "next/server";
import sharp from "sharp";
import { isValidHexColor } from "@/lib/calendar";
import {
   DEFAULT_COLORS,
   DEFAULT_ACCENT,
   DEFAULT_THEME,
   MIN_DIMENSION,
   MAX_DIMENSION,
} from "@/lib/constants";
import { Theme } from "@/lib/types";

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

interface GeocodingResult {
   features: Array<{
      center: [number, number]; // [lng, lat]
      place_name: string;
   }>;
}

async function geocodeLocation(query: string): Promise<{ lat: number; lng: number; name: string } | null> {
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
   height: number
): Promise<Buffer | null> {
   // Mapbox Static Images API - satellite-v9 style (no labels)
   const url = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lng},${lat},${zoom},0/${width}x${height}@2x?access_token=${MAPBOX_TOKEN}`;

   const response = await fetch(url);
   if (!response.ok) return null;

   return Buffer.from(await response.arrayBuffer());
}

export async function GET(request: NextRequest) {
   try {
      if (!MAPBOX_TOKEN) {
         return new Response(
            JSON.stringify({ error: "Mapbox API token not configured" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
         );
      }

      // 1. Parse URL parameters
      const { searchParams } = new URL(request.url);
      const widthParam = searchParams.get("width");
      const heightParam = searchParams.get("height");
      const locationParam = searchParams.get("location");
      const zoomParam = searchParams.get("zoom");
      const accentParam = searchParams.get("accent");
      const themeParam = searchParams.get("theme");
      const shapeParam = searchParams.get("shape");
      const formatParam = searchParams.get("format");

      // 2. Validate required parameters
      if (!widthParam || !heightParam) {
         return new Response(
            JSON.stringify({ error: "Missing required parameters: width, height" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
         );
      }

      if (!locationParam) {
         return new Response(
            JSON.stringify({ error: "Missing required parameter: location" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
         );
      }

      const width = parseInt(widthParam, 10);
      const height = parseInt(heightParam, 10);

      if (isNaN(width) || isNaN(height)) {
         return new Response(
            JSON.stringify({ error: "Width and height must be valid numbers" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
         );
      }

      if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
         return new Response(
            JSON.stringify({ error: `Width and height must be at least ${MIN_DIMENSION}px` }),
            { status: 400, headers: { "Content-Type": "application/json" } }
         );
      }

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
         return new Response(
            JSON.stringify({ error: `Width and height must be at most ${MAX_DIMENSION}px` }),
            { status: 400, headers: { "Content-Type": "application/json" } }
         );
      }

      // 3. Parse optional parameters
      const zoom = zoomParam ? parseFloat(zoomParam) : 14;
      const accent = accentParam || DEFAULT_ACCENT;

      if (accentParam && !isValidHexColor(accentParam)) {
         return new Response(
            JSON.stringify({ error: "Invalid accent color. Use 6-digit hex without #" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
         );
      }

      const theme: Theme = themeParam === "light" || themeParam === "dark"
         ? themeParam
         : (DEFAULT_THEME as Theme);

      type Shape = "circle" | "square" | "rounded";
      const shape: Shape = shapeParam === "square" || shapeParam === "rounded"
         ? shapeParam
         : "circle";

      const format = formatParam === "svg" ? "svg" : "png";

      // 4. Geocode location
      let lat: number, lng: number, locationName: string;

      // Check if location is coordinates (lat,lng format)
      const coordMatch = locationParam.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
      if (coordMatch) {
         lat = parseFloat(coordMatch[1]);
         lng = parseFloat(coordMatch[2]);
         locationName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      } else {
         // Geocode the location name
         const geocoded = await geocodeLocation(locationParam);
         if (!geocoded) {
            return new Response(
               JSON.stringify({ error: "Could not find location. Try a different search term." }),
               { status: 400, headers: { "Content-Type": "application/json" } }
            );
         }
         lat = geocoded.lat;
         lng = geocoded.lng;
         locationName = geocoded.name;
      }

      // 5. Fetch satellite image (fetch at smaller size for processing, will scale up)
      const fetchWidth = Math.min(800, width);
      const fetchHeight = Math.min(800, height);

      const satelliteBuffer = await fetchSatelliteImage(lat, lng, zoom, fetchWidth, fetchHeight);
      if (!satelliteBuffer) {
         return new Response(
            JSON.stringify({ error: "Failed to fetch satellite imagery" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
         );
      }

      // 6. Process image to get pixel data
      const { data: pixels, info } = await sharp(satelliteBuffer)
         .grayscale()
         .raw()
         .toBuffer({ resolveWithObject: true });

      // 7. Calculate dot grid
      const colors = DEFAULT_COLORS[theme];
      const accentColor = `#${accent}`;

      // Dot grid configuration
      const dotSpacing = Math.max(8, Math.min(16, width / 120)); // Adaptive spacing
      const cols = Math.floor(width / dotSpacing);
      const rows = Math.floor(height / dotSpacing);
      const dotDiameter = dotSpacing * 0.6;
      const dotRadius = dotDiameter / 2;
      const cornerRadius = dotDiameter * 0.2;
      // Center dot is 2x larger to make user's location more visible
      const centerDotDiameter = dotDiameter * 2;
      const centerDotRadius = centerDotDiameter / 2;
      const centerCornerRadius = centerDotDiameter * 0.2;

      // Center offset for the grid
      const gridWidth = cols * dotSpacing;
      const gridHeight = rows * dotSpacing;
      const offsetX = (width - gridWidth) / 2;
      const offsetY = (height - gridHeight) / 2;

      // Center dot position (user's location)
      const centerCol = Math.floor(cols / 2);
      const centerRow = Math.floor(rows / 2);

      // 8. Generate dots based on satellite image brightness
      let shapes = "";

      for (let row = 0; row < rows; row++) {
         for (let col = 0; col < cols; col++) {
            // Sample the corresponding pixel from the satellite image
            const sampleX = Math.floor((col / cols) * info.width);
            const sampleY = Math.floor((row / rows) * info.height);
            const pixelIndex = sampleY * info.width + sampleX;
            const brightness = pixels[pixelIndex] || 128;

            // Calculate dot position
            const x = offsetX + col * dotSpacing;
            const y = offsetY + row * dotSpacing;
            const cx = x + dotRadius;
            const cy = y + dotRadius;

            // Determine color based on brightness and position
            let color: string;
            const isCenter = col === centerCol && row === centerRow;

            if (isCenter) {
               // User's location - accent color
               color = accentColor;
            } else {
               // Map brightness to grayscale
               // In dark theme: bright areas = light dots, dark areas = dark dots
               // In light theme: invert
               if (theme === "dark") {
                  // Brightness 0-255 maps to futureDot (dark) to passedDot (light)
                  const ratio = brightness / 255;
                  // Interpolate between futureDot and passedDot colors
                  if (ratio < 0.4) {
                     color = colors.futureDot; // Dark areas
                  } else if (ratio > 0.7) {
                     color = colors.passedDot; // Bright areas
                  } else {
                     // Mid-tone - create intermediate color
                     const midColor = theme === "dark" ? "#5a5a5a" : "#a0a0a0";
                     color = midColor;
                  }
               } else {
                  // Light theme - invert
                  const ratio = brightness / 255;
                  if (ratio < 0.4) {
                     color = colors.passedDot; // Dark areas become dark dots
                  } else if (ratio > 0.7) {
                     color = colors.futureDot; // Bright areas become light dots
                  } else {
                     const midColor = "#a0a0a0";
                     color = midColor;
                  }
               }
            }

            // Draw the dot (center dot is 2x larger)
            if (isCenter) {
               // Center dot - 2x size
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

      // 9. Generate SVG
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="100%" height="100%" fill="${colors.background}"/>
        ${shapes}
      </svg>`;

      // 10. Return based on format
      if (format === "svg") {
         return new Response(svg, {
            headers: {
               "Content-Type": "image/svg+xml",
               "Cache-Control": "public, max-age=86400, s-maxage=86400",
            },
         });
      }

      // Convert SVG to PNG
      const pngBuffer = await sharp(Buffer.from(svg), { density: 150 })
         .resize(width, height, {
            fit: "fill",
            kernel: "lanczos3",
         })
         .png({
            compressionLevel: 6,
            palette: false,
         })
         .toBuffer();

      return new Response(new Uint8Array(pngBuffer), {
         headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
            "Content-Disposition": `inline; filename="dotmap-${width}x${height}.png"`,
         },
      });
   } catch (error) {
      console.error("Error generating location wallpaper:", error);
      return new Response(
         JSON.stringify({
            error: "Internal server error",
            details: String(error),
         }),
         { status: 500, headers: { "Content-Type": "application/json" } }
      );
   }
}
