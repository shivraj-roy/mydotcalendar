/**
 * Map utilities for journey calendar
 * Handles distance calculations, zoom levels, and coordinate conversions
 */

export interface Coordinates {
   lat: number;
   lng: number;
}

/**
 * Calculate the great-circle distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
   const R = 6371; // Earth's radius in kilometers

   const lat1Rad = (coord1.lat * Math.PI) / 180;
   const lat2Rad = (coord2.lat * Math.PI) / 180;
   const deltaLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
   const deltaLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

   const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) *
      Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

   return R * c;
}

/**
 * Calculate the center point between two coordinates
 */
export function calculateCenterPoint(coord1: Coordinates, coord2: Coordinates): Coordinates {
   // Simple average for nearby points
   // For points that are far apart, this is good enough for our use case
   return {
      lat: (coord1.lat + coord2.lat) / 2,
      lng: (coord1.lng + coord2.lng) / 2,
   };
}

/**
 * Calculate appropriate zoom level based on distance between two points
 * Mapbox zoom levels: 0 (world) to 22 (building)
 *
 * Distance ranges:
 * - < 5km: zoom 14-15 (neighborhood)
 * - 5-20km: zoom 12-13 (city)
 * - 20-100km: zoom 10-11 (region)
 * - 100-500km: zoom 8-9 (state)
 * - > 500km: zoom 5-7 (country/continent)
 */
export function calculateOptimalZoom(
   coord1: Coordinates,
   coord2: Coordinates,
   width: number,
   height: number
): number {
   const distance = calculateDistance(coord1, coord2);

   // Handle same location or very close
   if (distance < 1) {
      return 14;
   }

   // Calculate zoom based on distance
   // These values are tuned to ensure both markers are visible with padding
   if (distance < 5) {
      return 13;
   } else if (distance < 20) {
      return 11;
   } else if (distance < 50) {
      return 9;
   } else if (distance < 100) {
      return 8;
   } else if (distance < 200) {
      return 7;
   } else if (distance < 500) {
      return 6;
   } else if (distance < 1000) {
      return 5;
   } else if (distance < 3000) {
      return 4;
   } else if (distance < 8000) {
      return 3;
   } else {
      return 2;
   }
}

/**
 * Convert geographic coordinates to pixel position on the rendered map
 * Uses Web Mercator projection specifically calibrated for Mapbox Static Images API
 *
 * This calculates where on the image a given lat/lng coordinate appears,
 * relative to the map center and zoom level.
 */
export function coordinatesToPixels(
   coord: Coordinates,
   mapCenter: Coordinates,
   zoom: number,
   width: number,
   height: number
): { x: number; y: number } {
   // Mapbox uses 256px tiles, and at zoom level z, the world is 256 * 2^z pixels
   const scale = 256 * Math.pow(2, zoom);

   // Helper function to convert latitude to Mercator Y coordinate
   function latToMercatorY(lat: number): number {
      const latRad = (lat * Math.PI) / 180;
      return Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
   }

   // Convert longitudes to world pixel coordinates
   const pointWorldX = (coord.lng + 180) * (scale / 360);
   const centerWorldX = (mapCenter.lng + 180) * (scale / 360);

   // Convert latitudes to Mercator Y coordinates, then to world pixel coordinates
   const pointMercY = latToMercatorY(coord.lat);
   const centerMercY = latToMercatorY(mapCenter.lat);

   const pointWorldY = (scale / 2) - (pointMercY * scale / (2 * Math.PI));
   const centerWorldY = (scale / 2) - (centerMercY * scale / (2 * Math.PI));

   // Calculate pixel offset from center
   const offsetX = pointWorldX - centerWorldX;
   const offsetY = pointWorldY - centerWorldY;

   // Add offset to center of image
   const pixelX = (width / 2) + offsetX;
   const pixelY = (height / 2) + offsetY;

   return { x: pixelX, y: pixelY };
}

/**
 * Calculate bounding box that includes both coordinates with padding
 * Returns min/max lat/lng
 */
export function calculateBounds(coord1: Coordinates, coord2: Coordinates, paddingPercent: number = 0.1) {
   const minLat = Math.min(coord1.lat, coord2.lat);
   const maxLat = Math.max(coord1.lat, coord2.lat);
   const minLng = Math.min(coord1.lng, coord2.lng);
   const maxLng = Math.max(coord1.lng, coord2.lng);

   // Add padding
   const latPadding = (maxLat - minLat) * paddingPercent;
   const lngPadding = (maxLng - minLng) * paddingPercent;

   return {
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
      minLng: minLng - lngPadding,
      maxLng: maxLng + lngPadding,
   };
}
