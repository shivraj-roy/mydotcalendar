# MyDotCalendar - Project Brief

## 🎯 Project Overview

**MyDotCalendar** is a dynamic wallpaper generation API that creates personalized life calendar wallpapers. It visualizes your entire year as a grid of dots (circles), where each dot represents one day. The wallpaper updates daily to show your progress through the year, serving as a mindful reminder of time's passage.

**Initial Target**: MacBook users (Phase 1)  
**Future Expansion**: Windows Desktop & Mobile devices (iOS/Android)

## 💡 Core Concept

Unlike traditional calendars that show weeks or months, MyDotCalendar shows **every single day of the year** as a visual dot:

- **White/Light dots** = Days that have passed (already lived)
- **Dark gray dots** = Days remaining in the year
- **Orange/Accent dot** = Today (current day)
- **Bottom text** = "XXXd left · X%" showing days remaining and percentage complete

## 🔧 How It Works

### User Flow:

1. User visits `mydotcalendar.com`
2. User selects their device (MacBook model, or custom resolution)
3. User optionally customizes:
   - Start date (default: January 1st of current year)
   - Accent color for "today" dot
   - Theme (dark/light)
4. System generates a unique URL like:
   ```
   https://api.mydotcalendar.com/year?width=2560&height=1664&start_date=2026-01-01&accent=ff6347
   ```
5. User sets this URL as their desktop wallpaper
6. **Every day**, the wallpaper automatically updates because:
   - The API calculates "today" in real-time
   - The dot representing today moves forward
   - The "days left" counter decreases
   - The percentage increases

### Technical Flow:

```
User Request → Next.js API Route → Calculate Current Day →
Generate 365/366 Dots → Apply Colors Based on Date →
Render Image using @vercel/og → Return PNG →
Device Displays as Wallpaper
```

## 🏗️ Technical Architecture

### Stack:

- **Framework**: Next.js 14+ (App Router)
- **Image Generation**: `@vercel/og` (Vercel's Edge Image Generation)
- **Deployment**: Vercel (Edge Functions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (for landing page)

### Why @vercel/og?

- Built specifically for Vercel Edge Functions
- Uses Satori (JSX to SVG) - declarative, easy to style with Flexbox/CSS
- Perfect for dynamic image generation
- Fast, runs on edge
- You write JSX/CSS instead of manual canvas drawing
- Lighter and faster than node-canvas

### Project Structure:

```
mydotcalendar/
├─ app/
│  ├─ api/
│  │  └─ year/
│  │     └─ route.tsx          # Main API endpoint - generates the image
│  ├─ page.tsx                  # Landing page with wallpaper generator
│  ├─ layout.tsx                # Root layout
│  └─ globals.css
├─ lib/
│  ├─ calendar.ts               # Date calculations & logic
│  ├─ constants.ts              # Device resolutions, default colors
│  └─ types.ts                  # TypeScript interfaces
├─ components/
│  ├─ WallpaperGenerator.tsx    # Interactive form component
│  └─ DeviceSelector.tsx        # Device selection dropdown
├─ public/
│  └─ favicon.ico
├─ package.json
├─ tsconfig.json
├─ tailwind.config.ts
└─ README.md
```

## 📐 Calendar Logic (Year Layout - 365/366 Dots Only)

### Grid Layout Calculation:

```
Total dots: 365 (or 366 for leap years)
Grid arrangement: Auto-calculate rows/columns to fit screen aspect ratio

Example for 365 days:
- Option 1: 25 rows × 15 columns = 375 cells (use 365)
- Option 2: 21 rows × 18 columns = 378 cells (use 365)
- Choose layout that best fits screen aspect ratio

Algorithm:
1. Calculate aspect ratio from width/height
2. Find optimal rows/cols that:
   - Accommodate all dots (365/366)
   - Best match the aspect ratio
   - Provide good visual balance
```

### Dot States:

1. **Passed days** (white/light): Days before today
2. **Current day** (orange/accent): Today
3. **Future days** (dark gray): Days after today

### Date Calculations:

```typescript
// Core logic
const startDate = new Date(start_date); // e.g., "2026-01-01"
const today = new Date();
const dayOfYear = calculateDayOfYear(today); // 1-365/366
const daysInYear = isLeapYear(today.getFullYear()) ? 366 : 365;
const daysLeft = daysInYear - dayOfYear;
const percentComplete = Math.round((dayOfYear / daysInYear) * 100);
```

## 🎨 Design Specifications

### Visual Reference:

The design should match the uploaded screenshot exactly:

- Dark background
- Clean grid of circles
- Passed days in white
- Current day in orange
- Future days in darker gray
- Bottom text showing "XXXd left · X%" in orange

### Colors (Dark Theme - Default):

```css
Background: #1a1a1a (dark gray/black)
Passed dots: #ffffff (white)
Current dot: #ff6347 (tomato/coral orange) - customizable via URL param
Future dots: #3a3a3a (medium gray)
Text: #ff6347 (matches current dot color)
```

### Light Theme (Future):

```css
Background: #ffffff (white)
Passed dots: #1a1a1a (dark)
Current dot: #ff6347 (orange) - customizable
Future dots: #e5e5e5 (light gray)
Text: #ff6347
```

### Sizing & Spacing:

- **Dot diameter**: Auto-calculated based on screen size (responsive)
   - Formula: `min((width - marginX) / cols, (height - marginY - textHeight) / rows) * 0.7`
   - The 0.7 factor leaves space between dots
- **Dot spacing**: 8-12px between dots (adjust for screen density)
- **Text size**: 24-32px (readable from distance)
- **Text position**: Bottom center, 40-60px from bottom edge
- **Margins**: 40-60px from screen edges

### Device Resolutions (Phase 1 - MacBook Focus):

```typescript
const DEVICE_RESOLUTIONS = {
   // MacBook (Primary Focus - Phase 1)
   'MacBook Air 13" (M2/M3)': { width: 2560, height: 1664 },
   'MacBook Air 15" (M2/M3)': { width: 2880, height: 1864 },
   'MacBook Pro 14" (M1-M4)': { width: 3024, height: 1964 },
   'MacBook Pro 16" (M1-M4)': { width: 3456, height: 2234 },
   'MacBook Pro 13" (2020)': { width: 2560, height: 1600 },

   // Future: Windows Desktop (Phase 2)
   // '1080p Display': { width: 1920, height: 1080 },
   // '1440p Display': { width: 2560, height: 1440 },
   // '4K Display': { width: 3840, height: 2160 },

   // Future: Mobile (Phase 3)
   // 'iPhone 15 Pro': { width: 1179, height: 2556 },
   // 'iPhone 15 Pro Max': { width: 1290, height: 2796 },
   // 'Pixel 8 Pro': { width: 1344, height: 2992 },

   Custom: { width: 0, height: 0 }, // User input
};
```

## 🔗 API Endpoint Specification

### Endpoint: `/api/year`

**Method**: GET

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `width` | number | ✅ Yes | - | Screen width in pixels |
| `height` | number | ✅ Yes | - | Screen height in pixels |
| `start_date` | string | ❌ No | Jan 1, current year | Format: YYYY-MM-DD |
| `accent` | string | ❌ No | `ff6347` | Hex color without # (e.g., "3b82f6") |
| `theme` | string | ❌ No | `dark` | Either "dark" or "light" |

**Response**:

- Content-Type: `image/png`
- Binary PNG image data
- Cache headers for performance

**Example URLs**:

```
# Basic (minimal params)
https://api.mydotcalendar.com/year?width=2560&height=1664

# With custom start date
https://api.mydotcalendar.com/year?width=3024&height=1964&start_date=2026-01-01

# Full customization
https://api.mydotcalendar.com/year?width=3456&height=2234&start_date=2026-01-01&accent=3b82f6&theme=dark

# Light theme
https://api.mydotcalendar.com/year?width=2560&height=1664&theme=light
```

**Error Responses**:

```typescript
// Missing required params
{
   error: "Missing required parameters: width, height";
}
Status: 400;

// Invalid date format
{
   error: "Invalid start_date format. Use YYYY-MM-DD";
}
Status: 400;

// Invalid dimensions
{
   error: "Width and height must be positive numbers";
}
Status: 400;
```

## 🧮 Implementation Details

### 1. `/app/api/year/route.tsx`

This is the core API endpoint that generates the wallpaper image.

**Key responsibilities**:

- Parse and validate URL parameters
- Calculate current day of year
- Determine which dots should be which color
- Calculate optimal grid layout (rows × columns)
- Render dots using @vercel/og's ImageResponse
- Return PNG with proper caching headers

**Pseudocode**:

```typescript
export async function GET(request: Request) {
  // 1. Parse URL parameters
  const { searchParams } = new URL(request.url);
  const width = parseInt(searchParams.get('width') || '0');
  const height = parseInt(searchParams.get('height') || '0');
  const start_date = searchParams.get('start_date') || getCurrentYearStart();
  const accent = searchParams.get('accent') || 'ff6347';
  const theme = searchParams.get('theme') || 'dark';

  // 2. Validate parameters
  if (!width || !height) {
    return new Response(JSON.stringify({ error: 'Missing width or height' }), {
      status: 400,
    });
  }

  // 3. Calculate calendar data
  const today = new Date();
  const dayOfYear = getDayOfYear(today);
  const daysInYear = isLeapYear(today.getFullYear()) ? 366 : 365;
  const daysLeft = daysInYear - dayOfYear;
  const percentComplete = Math.round((dayOfYear / daysInYear) * 100);

  // 4. Calculate grid dimensions
  const { rows, cols } = calculateGridDimensions(daysInYear, width / height);

  // 5. Calculate dot size and spacing
  const dotSize = calculateDotSize(width, height, rows, cols);

  // 6. Generate dots array with colors
  const dots = Array.from({ length: daysInYear }, (_, i) => {
    const dotNumber = i + 1;
    let color;
    if (dotNumber < dayOfYear) {
      color = theme === 'dark' ? '#ffffff' : '#1a1a1a'; // Passed
    } else if (dotNumber === dayOfYear) {
      color = `#${accent}`; // Today
    } else {
      color = theme === 'dark' ? '#3a3a3a' : '#e5e5e5'; // Future
    }
    return { number: dotNumber, color };
  });

  // 7. Render using ImageResponse
  return new ImageResponse(
    (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
      }}>
        {/* Grid of dots */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          maxWidth: '90%',
        }}>
          {dots.map((dot) => (
            <div
              key={dot.number}
              style={{
                width: dotSize,
                height: dotSize,
                borderRadius: '50%',
                backgroundColor: dot.color,
              }}
            />
          ))}
        </div>

        {/* Bottom text */}
        <div style={{
          position: 'absolute',
          bottom: '60px',
          fontSize: '28px',
          color: `#${accent}`,
          fontWeight: 'normal',
        }}>
          {daysLeft}d left · {percentComplete}%
        </div>
      </div>
    ),
    {
      width,
      height,
    }
  );
}
```

**Important notes for @vercel/og**:

- Use inline styles (no external CSS)
- Supports Flexbox layout
- Limited CSS properties (check Satori docs)
- Must return ImageResponse object
- All styles must be in camelCase (backgroundColor not background-color)

### 2. `/lib/calendar.ts`

Pure functions for all date mathematics and calculations.

**Required functions**:

```typescript
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
): { rows: number; cols: number } {
   // Find factors of totalDots or close to it
   // Optimize for aspect ratio match

   // Start with square root as baseline
   const sqrt = Math.sqrt(totalDots);
   let bestRows = Math.round(sqrt);
   let bestCols = Math.ceil(totalDots / bestRows);

   // Try different combinations to match aspect ratio
   for (let rows = Math.floor(sqrt) - 5; rows <= Math.ceil(sqrt) + 5; rows++) {
      const cols = Math.ceil(totalDots / rows);
      const currentAspectRatio = cols / rows;
      const bestAspectRatio = bestCols / bestRows;

      // Check if this combination is closer to target aspect ratio
      if (
         Math.abs(currentAspectRatio - aspectRatio) <
         Math.abs(bestAspectRatio - aspectRatio)
      ) {
         bestRows = rows;
         bestCols = cols;
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
```

### 3. `/lib/constants.ts`

All configuration constants in one place.

```typescript
export const DEVICE_RESOLUTIONS = {
   // MacBook Models (Phase 1)
   'MacBook Air 13" (M2/M3)': { width: 2560, height: 1664 },
   'MacBook Air 15" (M2/M3)': { width: 2880, height: 1864 },
   'MacBook Pro 14" (M1-M4)': { width: 3024, height: 1964 },
   'MacBook Pro 16" (M1-M4)': { width: 3456, height: 2234 },
   'MacBook Pro 13" (2020)': { width: 2560, height: 1600 },
   Custom: { width: 0, height: 0 },
} as const;

export const DEFAULT_COLORS = {
   dark: {
      background: "#1a1a1a",
      passedDot: "#ffffff",
      currentDot: "#ff6347",
      futureDot: "#3a3a3a",
      text: "#ff6347",
   },
   light: {
      background: "#ffffff",
      passedDot: "#1a1a1a",
      currentDot: "#ff6347",
      futureDot: "#e5e5e5",
      text: "#ff6347",
   },
} as const;

export const DEFAULT_ACCENT = "ff6347"; // Tomato/coral orange
export const DEFAULT_THEME = "dark";
export const DEFAULT_MARGIN = 60;
export const DEFAULT_TEXT_SIZE = 28;
export const DEFAULT_DOT_SPACING_FACTOR = 0.7;
```

### 4. `/lib/types.ts`

TypeScript interfaces and types.

```typescript
export interface WallpaperParams {
   width: number;
   height: number;
   start_date?: string;
   accent?: string;
   theme?: "dark" | "light";
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
export type DeviceType = keyof typeof DEVICE_RESOLUTIONS;
```

### 5. Landing Page (`/app/page.tsx`)

Interactive UI for generating wallpaper URLs.

**Features needed**:

- Device selector dropdown (MacBook models)
- Custom resolution inputs (for custom option)
- Date picker for start_date (optional)
- Color picker for accent color
- Theme toggle (dark/light)
- Generated URL display with copy button
- Download image button
- Instructions for setting wallpaper

**Component structure**:

```tsx
export default function HomePage() {
   return (
      <main>
         <Hero />
         <WallpaperGenerator />
         <Instructions />
         <FAQ />
         <Footer />
      </main>
   );
}
```

### 6. `/components/WallpaperGenerator.tsx`

Main interactive form component.

**State management**:

```typescript
const [device, setDevice] = useState('MacBook Pro 14" (M1-M4)');
const [customWidth, setCustomWidth] = useState(3024);
const [customHeight, setCustomHeight] = useState(1964);
const [startDate, setStartDate] = useState(getCurrentYearStart());
const [accentColor, setAccentColor] = useState("ff6347");
const [theme, setTheme] = useState<"dark" | "light">("dark");
const [generatedUrl, setGeneratedUrl] = useState("");
```

**URL generation logic**:

```typescript
function generateUrl() {
   const params = new URLSearchParams();
   params.append("width", customWidth.toString());
   params.append("height", customHeight.toString());
   if (startDate !== getCurrentYearStart()) {
      params.append("start_date", startDate);
   }
   if (accentColor !== "ff6347") {
      params.append("accent", accentColor);
   }
   if (theme !== "dark") {
      params.append("theme", theme);
   }

   const url = `${process.env.NEXT_PUBLIC_API_URL}/api/year?${params.toString()}`;
   setGeneratedUrl(url);
}
```

## 🧪 Testing Strategy

### Local Development Testing:

```bash
# Start dev server
npm run dev

# Test basic endpoint
http://localhost:3000/api/year?width=2560&height=1664

# Test with all parameters
http://localhost:3000/api/year?width=3024&height=1964&start_date=2026-01-01&accent=3b82f6&theme=dark

# Test different dates
http://localhost:3000/api/year?width=2560&height=1664&start_date=2026-01-01
http://localhost:3000/api/year?width=2560&height=1664&start_date=2025-12-25

# Test leap year (2024)
http://localhost:3000/api/year?width=2560&height=1664&start_date=2024-01-01

# Test light theme
http://localhost:3000/api/year?width=2560&height=1664&theme=light

# Test custom accent colors
http://localhost:3000/api/year?width=2560&height=1664&accent=3b82f6
http://localhost:3000/api/year?width=2560&height=1664&accent=10b981
```

### Edge Cases to Test:

**Date edge cases**:

- [ ] Leap year (Feb 29, 366 days total)
- [ ] Year transitions (Dec 31 → Jan 1)
- [ ] First day of year (Jan 1)
- [ ] Last day of year (Dec 31)
- [ ] Invalid date formats
- [ ] Future start dates
- [ ] Past start dates

**Parameter validation**:

- [ ] Missing width parameter
- [ ] Missing height parameter
- [ ] Zero or negative dimensions
- [ ] Very small dimensions (< 100px)
- [ ] Very large dimensions (> 10000px)
- [ ] Invalid color format (not hex)
- [ ] Invalid theme value (not dark/light)

**Visual quality**:

- [ ] All MacBook resolutions render correctly
- [ ] Dots are perfectly circular
- [ ] Spacing is consistent
- [ ] Text is centered and readable
- [ ] Colors match specification exactly
- [ ] Grid layout is balanced

**Performance**:

- [ ] Image generation time < 500ms
- [ ] Handles concurrent requests
- [ ] Proper caching headers
- [ ] Edge function cold start time

### Testing Tools:

```bash
# Use Thunder Client (VS Code extension)
# Or Postman
# Or curl:
curl "http://localhost:3000/api/year?width=2560&height=1664" --output test.png

# Open in browser to view
open test.png
```

## 🚀 Development Phases

### Phase 1: MVP - Core API (Week 1)

**Days 1-2: Project Setup**

- [ ] Initialize Next.js 14+ with TypeScript
- [ ] Install dependencies (`@vercel/og`, Tailwind CSS)
- [ ] Set up project structure (folders, files)
- [ ] Create constants and types files
- [ ] Set up Git repository

**Days 3-4: Core Logic**

- [ ] Implement all calendar calculation functions
- [ ] Write unit tests for date math
- [ ] Implement grid dimension calculator
- [ ] Test with 365 and 366 day scenarios

**Days 5-6: API Route**

- [ ] Build `/api/year/route.tsx`
- [ ] Implement parameter parsing and validation
- [ ] Integrate calendar calculations
- [ ] Implement ImageResponse rendering
- [ ] Test with different parameters
- [ ] Add error handling

**Day 7: Testing & Refinement**

- [ ] Test all MacBook resolutions
- [ ] Verify dot sizing and spacing
- [ ] Match design exactly to reference image
- [ ] Test edge cases
- [ ] Optimize performance

### Phase 2: Landing Page (Week 2)

**Days 1-3: UI Components**

- [ ] Build Hero section
- [ ] Build WallpaperGenerator component
- [ ] Build DeviceSelector component
- [ ] Implement form state management
- [ ] Add color picker
- [ ] Add theme toggle

**Days 4-5: Features & Polish**

- [ ] URL generation logic
- [ ] Copy to clipboard functionality
- [ ] Download image button
- [ ] Live preview (optional)
- [ ] Responsive design (mobile-friendly)

**Days 6-7: Content & Documentation**

- [ ] Write instructions section
- [ ] Create FAQ section
- [ ] Add footer with links
- [ ] Write README.md
- [ ] Add meta tags for SEO

### Phase 3: Production Deployment (Week 3)

**Days 1-2: Preparation**

- [ ] Environment variables setup
- [ ] Performance optimization
- [ ] Add caching strategies
- [ ] Security review
- [ ] Accessibility audit

**Days 3-4: Deployment**

- [ ] Deploy to Vercel
- [ ] Configure custom domain (mydotcalendar.com)
- [ ] Set up SSL/HTTPS
- [ ] Test production environment
- [ ] Monitor edge function performance

**Days 5-7: Launch & Monitoring**

- [ ] Soft launch to friends/beta testers
- [ ] Collect feedback
- [ ] Fix any issues
- [ ] Set up analytics (optional)
- [ ] Public launch

### Phase 4: Future Enhancements (Post-Launch)

**Future layouts (not in Phase 1)**:

- [ ] Weekly view (52 weeks)
- [ ] Monthly view (12 months)
- [ ] Life calendar (entire life in weeks/years)
- [ ] Goal progress overlay
- [ ] Habit tracking integration

**Platform expansion**:

- [ ] Windows desktop support (Phase 2)
- [ ] Mobile wallpaper support - iOS (Phase 3)
- [ ] Mobile wallpaper support - Android (Phase 3)
- [ ] Tablet support

**Additional features**:

- [ ] Save/share configurations
- [ ] User accounts (optional)
- [ ] Multiple calendars per user
- [ ] Custom fonts
- [ ] Gradient backgrounds
- [ ] Image overlays
- [ ] Export as static image (for printing)

## 📊 Success Criteria

**Performance**:

- [ ] Image generation < 500ms
- [ ] 99.9% uptime on Vercel Edge
- [ ] Lighthouse score > 90
- [ ] Fast First Contentful Paint (< 1s)

**Quality**:

- [ ] Pixel-perfect dot rendering
- [ ] Accurate date calculations (zero errors)
- [ ] Perfect color matching to spec
- [ ] Responsive across all MacBook screens
- [ ] Clean, maintainable code

**User Experience**:

- [ ] Intuitive landing page
- [ ] One-click URL copy
- [ ] Clear instructions
- [ ] Fast URL generation
- [ ] Mobile-friendly website

## 🎨 Branding & Content

**Project Name**: MyDotCalendar  
**Domain**: mydotcalendar.com  
**Tagline**: "Your year, one dot at a time"

**Alternative taglines**:

- "365 dots. One year. Make it count."
- "Visualize your time, one day at a time"
- "Every dot is a day. Make them matter."
- "See your year. Live your days."

**Logo ideas** (for future):

- Simple grid of dots with one highlighted
- Minimalist calendar icon with dots
- Single glowing dot

## 📝 Key Implementation Notes

### For @vercel/og ImageResponse:

1. **All styles must be inline**:

   ```tsx
   // ✅ Correct
   <div style={{ backgroundColor: '#1a1a1a', display: 'flex' }}>

   // ❌ Wrong
   <div className="bg-gray-900 flex">
   ```

2. **Use camelCase for CSS properties**:

   ```tsx
   // ✅ Correct
   (backgroundColor, flexDirection, fontSize);

   // ❌ Wrong
   (background - color, flex - direction, font - size);
   ```

3. **Limited CSS support** - mainly Flexbox:
   - `display: flex` ✅
   - `flexDirection` ✅
   - `alignItems`, `justifyContent` ✅
   - `gap`, `padding`, `margin` ✅
   - Grid layout ❌
   - Complex transforms ❌
   - Check Satori docs for full list

4. **Absolute positioning works**:

   ```tsx
   <div style={{ position: 'absolute', bottom: '60px' }}>
   ```

5. **Must specify width and height in ImageResponse options**:
   ```tsx
   return new ImageResponse(jsx, { width, height });
   ```

### Date Calculation Notes:

1. **Always use UTC or handle timezones carefully**:

   ```typescript
   // Be consistent with timezone handling
   const today = new Date();
   // Or use UTC: new Date(Date.UTC(...))
   ```

2. **Leap year edge cases**:
   - February 29 only exists in leap years
   - Day 366 should only appear in leap years
   - Test thoroughly with 2024 (leap) and 2025 (non-leap)

3. **Year boundaries**:
   - Day 1 = January 1
   - Day 365/366 = December 31
   - Handle Dec 31 → Jan 1 transition

## 🔐 Environment Variables

### Development (`.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Production (Vercel):

```env
NEXT_PUBLIC_API_URL=https://mydotcalendar.com
```

## 📦 Dependencies

```json
{
   "dependencies": {
      "next": "^14.2.0",
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "@vercel/og": "^0.6.2"
   },
   "devDependencies": {
      "@types/node": "^20.0.0",
      "@types/react": "^18.2.0",
      "@types/react-dom": "^18.2.0",
      "typescript": "^5.3.0",
      "tailwindcss": "^3.4.0",
      "autoprefixer": "^10.4.0",
      "postcss": "^8.4.0"
   }
}
```

## 🎯 Priority Focus

**What to build FIRST (Phase 1 MVP)**:

1. ✅ Calendar calculation functions (`/lib/calendar.ts`)
2. ✅ API route with ImageResponse (`/app/api/year/route.tsx`)
3. ✅ Test with all MacBook resolutions
4. ✅ Match design exactly to reference screenshot
5. ✅ Basic landing page with URL generator

**What to build LATER**:

- ❌ Other layouts (weeks, months, life) - NOT in Phase 1
- ❌ Windows/Mobile support - Phase 2+
- ❌ User accounts, saving configs - Future
- ❌ Advanced features - Future

## 📖 Reference Materials

**Inspiration**: thelifecalendar.com (similar concept for mobile)

**Key differences from thelifecalendar.com**:

- They focus on mobile (iPhone wallpapers)
- We focus on desktop (MacBook first, then Windows)
- They have multiple layouts (we start with year/daily only)
- They use different tech stack (we use Next.js + @vercel/og)

**Design reference**:
The uploaded screenshot shows the exact visual style we need to match:

- Dark background (#1a1a1a)
- White dots for passed days
- Orange dot for today
- Gray dots for future days
- "XXXd left · X%" text at bottom in orange

## ✅ Definition of Done

A task is complete when:

- [ ] Code is written and follows TypeScript best practices
- [ ] Function has JSDoc comments
- [ ] Edge cases are handled
- [ ] Error handling is implemented
- [ ] Works correctly with test data
- [ ] Matches design specification exactly
- [ ] Performance is acceptable (< 500ms for image gen)
- [ ] Code is clean and readable

---

## 🚀 Getting Started

**For Claude Code**:

1. **Initialize the project**:

   ```bash
   npx create-next-app@latest mydotcalendar --typescript --tailwind --app
   cd mydotcalendar
   npm install @vercel/og
   ```

2. **Create the folder structure** as outlined above

3. **Start with core logic**:
   - Build `/lib/calendar.ts` first (date calculations)
   - Test each function thoroughly
   - Then build `/lib/constants.ts` and `/lib/types.ts`

4. **Build the API endpoint**:
   - Implement `/app/api/year/route.tsx`
   - Use the calendar functions
   - Test with different parameters

5. **Build the landing page** (can be simple at first):
   - Basic form to input parameters
   - Generate and display URL
   - Copy button

6. **Test extensively**:
   - All MacBook resolutions
   - Edge cases (leap year, year boundaries)
   - Different dates and colors

7. **Deploy to Vercel**:
   ```bash
   vercel
   ```

**Focus**: Year/daily calendar only (365/366 dots). No other layouts yet. MacBook optimized. Clean, performant code.

---

## 💡 Tips for Implementation

1. **Start simple**: Get the basic API working first, then add features
2. **Test frequently**: Check output at every step
3. **Use TypeScript**: Leverage type safety to catch errors early
4. **Read @vercel/og docs**: Understand Satori limitations
5. **Match the design exactly**: Compare your output to the reference image pixel by pixel
6. **Optimize grid algorithm**: The grid layout is crucial for good visual appearance
7. **Handle errors gracefully**: Every parameter should be validated
8. **Add helpful comments**: Future you will thank you

**Good luck building MyDotCalendar! 🎯**
