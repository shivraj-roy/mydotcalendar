"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { usePostHog } from "posthog-js/react";
import {
   Drawer,
   DrawerContent,
   DrawerHeader,
   DrawerTitle,
} from "@/components/ui/drawer";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DEVICE_RESOLUTIONS } from "@/lib/constants";

// ============ Types ============
type WallpaperType = "year" | "goal" | "journey";
type Theme = "dark" | "light";
type Shape = "circle" | "square" | "rounded";
type Layout = "year" | "month";

interface WallpaperDialogProps {
   type: WallpaperType;
   open: boolean;
   onOpenChange: (open: boolean) => void;
}

// ============ Constants ============
const DEVICE_NAMES = Object.keys(DEVICE_RESOLUTIONS).filter(
   (name) => name !== "Custom",
);

const ACCENT_COLORS = [
   { name: "Orange", value: "ff6347" },
   { name: "Yellow", value: "fca311" },
   { name: "Green", value: "b3efb2" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR + i);

const MONTHS = [
   { value: "01", label: "January" },
   { value: "02", label: "February" },
   { value: "03", label: "March" },
   { value: "04", label: "April" },
   { value: "05", label: "May" },
   { value: "06", label: "June" },
   { value: "07", label: "July" },
   { value: "08", label: "August" },
   { value: "09", label: "September" },
   { value: "10", label: "October" },
   { value: "11", label: "November" },
   { value: "12", label: "December" },
];

const DAYS = Array.from({ length: 31 }, (_, i) => ({
   value: (i + 1).toString().padStart(2, "0"),
   label: (i + 1).toString(),
}));

const DIALOG_CONFIG = {
   year: {
      title: "Year Calendar Steps",
      description:
         "Track your progress through the year with a visual countdown wallpaper.",
   },
   goal: {
      title: "Goal Calendar Setup",
      description:
         "Track your progress towards any goal with a visual countdown wallpaper.",
   },
   journey: {
      title: "Journey Calendar Setup",
      description:
         "Track your progress from origin to destination. Set up daily automation to update your wallpaper as you approach your target date.",
   },
};

const ZOOM_LEVELS = [
   { value: "12", label: "Far (City overview)" },
   { value: "14", label: "Medium (Neighborhood)" },
   { value: "16", label: "Close (Streets)" },
   { value: "18", label: "Very Close (Buildings)" },
];

// ============ Shared Sub-Components ============
function StepHeader({ step, title }: { step: number; title: string }) {
   return (
      <div className="flex items-center gap-3">
         <span className="flex items-center justify-center w-6 h-6 bg-zinc-800 text-sm font-medium">
            {step}
         </span>
         <h3 className="font-medium">{title}</h3>
      </div>
   );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
   return <label className="text-sm text-zinc-400">{children}</label>;
}

function ToggleButton({
   selected,
   onClick,
   children,
}: {
   selected: boolean;
   onClick: () => void;
   children: React.ReactNode;
}) {
   return (
      <button
         onClick={onClick}
         className={`flex-1 px-4 py-2 border transition-all cursor-pointer ${
            selected
               ? "bg-zinc-700 border-orange-500 text-white"
               : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
         }`}
      >
         {children}
      </button>
   );
}

function IconToggleButton({
   selected,
   onClick,
   icon,
   label,
}: {
   selected: boolean;
   onClick: () => void;
   icon: React.ReactNode;
   label: string;
}) {
   return (
      <button
         onClick={onClick}
         className={`flex-1 px-2 md:px-4 py-2 border transition-all flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base cursor-pointer ${
            selected
               ? "bg-zinc-700 border-orange-500 text-white"
               : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
         }`}
      >
         {icon}
         {label}
      </button>
   );
}

function DeviceSelector({
   value,
   onChange,
}: {
   value: string;
   onChange: (value: string) => void;
}) {
   return (
      <div className="space-y-2">
         <FieldLabel>MacBook Model</FieldLabel>
         <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 rounded-none cursor-pointer">
               <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 rounded-none">
               {DEVICE_NAMES.map((name) => (
                  <SelectItem key={name} value={name}>
                     {name}
                  </SelectItem>
               ))}
            </SelectContent>
         </Select>
      </div>
   );
}

function ThemeSelector({
   value,
   onChange,
}: {
   value: Theme;
   onChange: (value: Theme) => void;
}) {
   return (
      <div className="space-y-2">
         <FieldLabel>Theme</FieldLabel>
         <div className="flex gap-2">
            <ToggleButton
               selected={value === "dark"}
               onClick={() => onChange("dark")}
            >
               Dark
            </ToggleButton>
            <ToggleButton
               selected={value === "light"}
               onClick={() => onChange("light")}
            >
               Light
            </ToggleButton>
         </div>
      </div>
   );
}

function ShapeSelector({
   value,
   onChange,
}: {
   value: Shape;
   onChange: (value: Shape) => void;
}) {
   return (
      <div className="space-y-2">
         <FieldLabel>Shape</FieldLabel>
         <div className="flex gap-2">
            <IconToggleButton
               selected={value === "circle"}
               onClick={() => onChange("circle")}
               icon={<span className="w-3 h-3 rounded-full bg-current" />}
               label="Circle"
            />
            <IconToggleButton
               selected={value === "square"}
               onClick={() => onChange("square")}
               icon={<span className="w-3 h-3 bg-current" />}
               label="Square"
            />
            <IconToggleButton
               selected={value === "rounded"}
               onClick={() => onChange("rounded")}
               icon={<span className="w-3 h-3 rounded bg-current" />}
               label="Rounded"
            />
         </div>
      </div>
   );
}

function AccentColorSelector({
   value,
   onChange,
   label = "Accent Color (Today's Dot)",
}: {
   value: string;
   onChange: (value: string) => void;
   label?: string;
}) {
   return (
      <div className="space-y-2">
         <FieldLabel>{label}</FieldLabel>
         <div className="flex gap-2">
            {ACCENT_COLORS.map((color) => (
               <IconToggleButton
                  key={color.value}
                  selected={value === color.value}
                  onClick={() => onChange(color.value)}
                  icon={
                     <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: `#${color.value}` }}
                     />
                  }
                  label={color.name}
               />
            ))}
         </div>
      </div>
   );
}

function LayoutSelector({
   value,
   onChange,
}: {
   value: Layout;
   onChange: (value: Layout) => void;
}) {
   return (
      <div className="space-y-2">
         <FieldLabel>Layout Style</FieldLabel>
         <Select value={value} onValueChange={(v: Layout) => onChange(v)}>
            <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 rounded-none cursor-pointer">
               <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 rounded-none">
               <SelectItem value="year">Days (all days of the year)</SelectItem>
               <SelectItem value="month">Months (calendar grid)</SelectItem>
            </SelectContent>
         </Select>
      </div>
   );
}

function DateSelector({
   label,
   year,
   month,
   day,
   onYearChange,
   onMonthChange,
   onDayChange,
}: {
   label: string;
   year: string;
   month: string;
   day: string;
   onYearChange: (value: string) => void;
   onMonthChange: (value: string) => void;
   onDayChange: (value: string) => void;
}) {
   return (
      <div className="space-y-2">
         <FieldLabel>{label}</FieldLabel>
         <div className="grid grid-cols-3 gap-2">
            <Select value={year} onValueChange={onYearChange}>
               <SelectTrigger className="bg-zinc-800 border-zinc-700 rounded-none cursor-pointer">
                  <SelectValue placeholder="Year" />
               </SelectTrigger>
               <SelectContent className="bg-zinc-800 border-zinc-700 rounded-none">
                  {YEARS.map((y) => (
                     <SelectItem key={y} value={y.toString()}>
                        {y}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>
            <Select value={month} onValueChange={onMonthChange}>
               <SelectTrigger className="bg-zinc-800 border-zinc-700 rounded-none cursor-pointer">
                  <SelectValue placeholder="Month" />
               </SelectTrigger>
               <SelectContent className="bg-zinc-800 border-zinc-700 rounded-none">
                  {MONTHS.map((m) => (
                     <SelectItem key={m.value} value={m.value}>
                        {m.label}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>
            <Select value={day} onValueChange={onDayChange}>
               <SelectTrigger className="bg-zinc-800 border-zinc-700 rounded-none cursor-pointer">
                  <SelectValue placeholder="Day" />
               </SelectTrigger>
               <SelectContent className="bg-zinc-800 border-zinc-700 rounded-none">
                  {DAYS.map((d) => (
                     <SelectItem key={d.value} value={d.value}>
                        {d.label}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>
         </div>
      </div>
   );
}

function Preview({ url, alt }: { url: string; alt: string }) {
   if (!url) return null;
   return (
      <div className="space-y-2">
         <FieldLabel>Preview</FieldLabel>
         <div className="relative w-full aspect-video bg-zinc-950 overflow-hidden border border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={alt} className="w-full h-full object-contain" />
         </div>
      </div>
   );
}

function AutomationSetupStep({
   url,
   urlReady,
   copied,
   onCopy,
   onShortcutDownload,
}: {
   url: string;
   urlReady: boolean;
   copied: boolean;
   onCopy: () => void;
   onShortcutDownload: () => void;
}) {
   return (
      <div className="space-y-4">
         <StepHeader step={2} title="Setup Automation" />
         <div className="ml-0 md:ml-9 space-y-4">
            {/* URL Section */}
            <div className="space-y-2">
               <FieldLabel>Your Wallpaper URL</FieldLabel>
               <div className="flex gap-2">
                  <input
                     type="text"
                     value={urlReady ? url : ""}
                     placeholder={urlReady ? "" : "Complete step 1 first..."}
                     readOnly
                     className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 font-mono truncate placeholder:text-zinc-500 placeholder:font-sans"
                  />
                  <Button
                     onClick={onCopy}
                     variant="outline"
                     size="sm"
                     disabled={!urlReady}
                     className="border-zinc-700 hover:bg-zinc-800 rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     {copied ? "Copied!" : "Copy"}
                  </Button>
               </div>
            </div>

            {/* Download Shortcut */}
            <div className="p-3 bg-zinc-800/50 border border-zinc-700">
               <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <p className="text-sm text-zinc-300">
                     Download our automated shortcut for daily updates:
                  </p>
                  <a
                     href="/assets/DotCal Wallpaper Shortcut.shortcut"
                     download="DotCal Wallpaper Shortcut.shortcut"
                     onClick={onShortcutDownload}
                     className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm transition-colors cursor-pointer shrink-0"
                  >
                     <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                     </svg>
                     Download Shortcut
                  </a>
               </div>
            </div>

            {/* Simple Instructions */}
            <div className="space-y-2">
               <p className="text-xs text-zinc-500 uppercase tracking-wide">
                  Setup Instructions:
               </p>
               <ol className="space-y-2 text-sm text-zinc-400 list-decimal list-inside">
                  <li>Download the shortcut above</li>
                  <li>Double-click to import into Shortcuts app</li>
                  <li>
                     Paste your wallpaper URL into the shortcut&apos;s{" "}
                     <span className="text-white font-medium">
                        &quot;Text&quot;
                     </span>{" "}
                     field
                  </li>
                  <li>
                     In Shortcuts settings, enable{" "}
                     <span className="text-white font-medium">
                        &quot;Allow Running Scripts&quot;
                     </span>
                  </li>
                  <li>
                     Go to{" "}
                     <span className="text-white font-medium">
                        Automation tab
                     </span>{" "}
                     → New Automation →{" "}
                     <span className="text-white font-medium">Time of Day</span>{" "}
                     → 6:00 AM → Repeat{" "}
                     <span className="text-white font-medium">Daily</span> →{" "}
                     <span className="text-white font-medium">
                        Run Immediately
                     </span>{" "}
                     → Select your imported shortcut
                  </li>
               </ol>
            </div>

            {/* Important Note */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-sm">
               <p className="text-blue-400 font-medium">Important:</p>
               <p className="text-zinc-400 mt-1">
                  In System Settings{" "}
                  <span className="text-white">&quot;Wallpaper&quot;</span>,{" "}
                  <span className="text-orange-400 font-semibold">
                     make sure to
                  </span>{" "}
                  toggle on{" "}
                  <span className="text-white">
                     &quot;Show on all Spaces&quot;
                  </span>{" "}
                  and set to{" "}
                  <span className="text-white">&quot;Fill Screen&quot;</span>.
               </p>
               <p className="text-zinc-500 mt-2 text-xs">
                  This ensures the wallpaper updates on all spaces/windows and
                  displays properly.
               </p>
            </div>
         </div>
      </div>
   );
}

// ============ Main Component ============
export default function WallpaperDialog({
   type,
   open,
   onOpenChange,
}: WallpaperDialogProps) {
   // PostHog tracking
   const posthog = usePostHog();

   // Shared state
   const [device, setDevice] = useState('MacBook Pro 14" (M1-M4)');
   const [accentColor, setAccentColor] = useState("ff6347");
   const [theme, setTheme] = useState<Theme>("dark");
   const [shape, setShape] = useState<Shape>("circle");
   const [copied, setCopied] = useState(false);

   // Year-specific state
   const [layout, setLayout] = useState<Layout>("year");

   // Goal-specific state
   const [goal, setGoal] = useState("");
   const [startYear, setStartYear] = useState("");
   const [startMonth, setStartMonth] = useState("");
   const [startDay, setStartDay] = useState("");
   const [deadlineYear, setDeadlineYear] = useState("");
   const [deadlineMonth, setDeadlineMonth] = useState("");
   const [deadlineDay, setDeadlineDay] = useState("");

   // Journey-specific state
   const [originLocation, setOriginLocation] = useState("");
   const [originLocationInput, setOriginLocationInput] = useState("");
   const [destinationLocation, setDestinationLocation] = useState("");
   const [destinationLocationInput, setDestinationLocationInput] = useState("");
   const [targetDateYear, setTargetDateYear] = useState("");
   const [targetDateMonth, setTargetDateMonth] = useState("");
   const [targetDateDay, setTargetDateDay] = useState("");
   const [journeyZoom, setJourneyZoom] = useState("16"); // Default to Close (Streets)
   const [isLocatingOrigin, setIsLocatingOrigin] = useState(false);
   const [originSuggestions, setOriginSuggestions] = useState<
      Array<{ place_name: string; center: [number, number] }>
   >([]);
   const [destinationSuggestions, setDestinationSuggestions] = useState<
      Array<{ place_name: string; center: [number, number] }>
   >([]);
   const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
   const [showDestinationSuggestions, setShowDestinationSuggestions] =
      useState(false);
   const originDebounceRef = useRef<NodeJS.Timeout | null>(null);
   const destinationDebounceRef = useRef<NodeJS.Timeout | null>(null);

   // Journey location autocomplete helpers
   async function fetchOriginSuggestions(query: string) {
      if (query.length < 2) {
         setOriginSuggestions([]);
         return;
      }

      try {
         const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=pk.eyJ1Ijoic2hpdnJhai1yb3kiLCJhIjoiY21rdXltZDluMDAzeTNmcXprNTU3ejNpYSJ9.Uc1ZtL6Q_ZgsyxEEIOAKHg&limit=5&types=place,locality,neighborhood,address`,
         );
         if (response.ok) {
            const data = await response.json();
            setOriginSuggestions(data.features || []);
         }
      } catch (error) {
         console.error("Failed to fetch origin suggestions:", error);
      }
   }

   async function fetchDestinationSuggestions(query: string) {
      if (query.length < 2) {
         setDestinationSuggestions([]);
         return;
      }

      try {
         const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=pk.eyJ1Ijoic2hpdnJhai1yb3kiLCJhIjoiY21rdXltZDluMDAzeTNmcXprNTU3ejNpYSJ9.Uc1ZtL6Q_ZgsyxEEIOAKHg&limit=5&types=place,locality,neighborhood,address`,
         );
         if (response.ok) {
            const data = await response.json();
            setDestinationSuggestions(data.features || []);
         }
      } catch (error) {
         console.error("Failed to fetch destination suggestions:", error);
      }
   }

   function handleOriginInputChange(value: string) {
      setOriginLocationInput(value);
      setShowOriginSuggestions(true);

      if (originDebounceRef.current) {
         clearTimeout(originDebounceRef.current);
      }

      originDebounceRef.current = setTimeout(() => {
         fetchOriginSuggestions(value);
      }, 300);
   }

   function handleDestinationInputChange(value: string) {
      setDestinationLocationInput(value);
      setShowDestinationSuggestions(true);

      if (destinationDebounceRef.current) {
         clearTimeout(destinationDebounceRef.current);
      }

      destinationDebounceRef.current = setTimeout(() => {
         fetchDestinationSuggestions(value);
      }, 300);
   }

   function selectOriginSuggestion(suggestion: {
      place_name: string;
      center: [number, number];
   }) {
      // Store the full place name for API (better for geocoding)
      setOriginLocation(suggestion.place_name);
      // Store short name for display in input
      setOriginLocationInput(suggestion.place_name.split(",")[0]);
      setOriginSuggestions([]);
      setShowOriginSuggestions(false);
   }

   function selectDestinationSuggestion(suggestion: {
      place_name: string;
      center: [number, number];
   }) {
      // Store the full place name for API (better for geocoding)
      setDestinationLocation(suggestion.place_name);
      // Store short name for display in input
      setDestinationLocationInput(suggestion.place_name.split(",")[0]);
      setDestinationSuggestions([]);
      setShowDestinationSuggestions(false);
   }

   // Get current location for origin using browser geolocation
   async function getCurrentOriginLocation() {
      if (!navigator.geolocation) {
         alert("Geolocation is not supported by your browser");
         return;
      }

      setIsLocatingOrigin(true);
      navigator.geolocation.getCurrentPosition(
         async (position) => {
            const { latitude, longitude } = position.coords;

            // Reverse geocode to get location name
            try {
               const response = await fetch(
                  `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=pk.eyJ1Ijoic2hpdnJhai1yb3kiLCJhIjoiY21rdXltZDluMDAzeTNmcXprNTU3ejNpYSJ9.Uc1ZtL6Q_ZgsyxEEIOAKHg&limit=1`,
               );
               if (response.ok) {
                  const data = await response.json();
                  if (data.features && data.features.length > 0) {
                     const placeName = data.features[0].place_name;
                     setOriginLocation(placeName);
                     setOriginLocationInput(placeName.split(",")[0]);
                  } else {
                     setOriginLocation(`${latitude},${longitude}`);
                     setOriginLocationInput("Current Location");
                  }
               } else {
                  setOriginLocation(`${latitude},${longitude}`);
                  setOriginLocationInput("Current Location");
               }
            } catch (error) {
               console.error("Reverse geocoding failed:", error);
               setOriginLocation(`${latitude},${longitude}`);
               setOriginLocationInput("Current Location");
            }

            setIsLocatingOrigin(false);
            setOriginSuggestions([]);
            setShowOriginSuggestions(false);
         },
         (error) => {
            setIsLocatingOrigin(false);
            if (error.code === error.PERMISSION_DENIED) {
               alert(
                  "Location access denied. Please allow location access in your browser settings.",
               );
            } else {
               alert(
                  "Could not get your location. Please try again or enter manually.",
               );
            }
         },
         { enableHighAccuracy: true, timeout: 10000 },
      );
   }

   // Check if step 1 is complete (for goal and journey types)
   const isStep1Complete = useMemo(() => {
      if (type === "year") return true;
      if (type === "goal") {
         return (
            goal.trim() !== "" &&
            startYear !== "" &&
            startMonth !== "" &&
            startDay !== "" &&
            deadlineYear !== "" &&
            deadlineMonth !== "" &&
            deadlineDay !== ""
         );
      }
      if (type === "journey") {
         return (
            originLocation.trim() !== "" &&
            destinationLocation.trim() !== "" &&
            targetDateYear !== "" &&
            targetDateMonth !== "" &&
            targetDateDay !== ""
         );
      }
      return true;
   }, [
      type,
      goal,
      startYear,
      startMonth,
      startDay,
      deadlineYear,
      deadlineMonth,
      deadlineDay,
      originLocation,
      destinationLocation,
      targetDateYear,
      targetDateMonth,
      targetDateDay,
   ]);

   // Format dates for goal
   const startDate = useMemo(() => {
      if (startYear && startMonth && startDay) {
         return `${startYear}-${startMonth}-${startDay}`;
      }
      return "";
   }, [startYear, startMonth, startDay]);

   const deadlineDate = useMemo(() => {
      if (deadlineYear && deadlineMonth && deadlineDay) {
         return `${deadlineYear}-${deadlineMonth}-${deadlineDay}`;
      }
      return "";
   }, [deadlineYear, deadlineMonth, deadlineDay]);

   // Format target date for journey
   const targetDate = useMemo(() => {
      if (targetDateYear && targetDateMonth && targetDateDay) {
         return `${targetDateYear}-${targetDateMonth}-${targetDateDay}`;
      }
      return "";
   }, [targetDateYear, targetDateMonth, targetDateDay]);

   // Generate URL using useMemo instead of useEffect to avoid setState in effect
   const computedUrl = useMemo(() => {
      if (!isStep1Complete) {
         return "";
      }

      const baseUrl =
         typeof window !== "undefined" ? window.location.origin : "";
      const resolution = DEVICE_RESOLUTIONS[device];
      if (!resolution) return "";

      const params = new URLSearchParams();
      params.append("width", resolution.width.toString());
      params.append("height", resolution.height.toString());

      if (type === "year") {
         if (layout !== "year") params.append("layout", layout);
      } else if (type === "goal") {
         params.append("goal", goal);
         params.append("start_date", startDate);
         params.append("goal_date", deadlineDate);
      } else if (type === "journey") {
         params.append("origin", originLocation);
         params.append("destination", destinationLocation);
         params.append("target_date", targetDate);
         if (journeyZoom !== "16") params.append("zoom", journeyZoom);
      }

      if (accentColor !== "ff6347") params.append("accent", accentColor);
      if (theme !== "dark") params.append("theme", theme);
      if (shape !== "circle") params.append("shape", shape);

      const endpoints = {
         year: "/api/year",
         goal: "/api/goal",
         journey: "/api/journey",
      };
      return `${baseUrl}${endpoints[type]}?${params.toString()}`;
   }, [
      type,
      device,
      layout,
      accentColor,
      theme,
      shape,
      goal,
      startDate,
      deadlineDate,
      originLocation,
      destinationLocation,
      targetDate,
      journeyZoom,
      isStep1Complete,
   ]);

   // Track when dialog opens
   useEffect(() => {
      if (open) {
         posthog?.capture("wallpaper_dialog_opened", {
            calendar_type: type,
         });
      }
   }, [open, type, posthog]);

   async function copyUrl() {
      try {
         await navigator.clipboard.writeText(computedUrl);
         setCopied(true);
         setTimeout(() => setCopied(false), 2000);

         // Track URL copy
         posthog?.capture("wallpaper_url_copied", {
            calendar_type: type,
            device: device,
            theme: theme,
         });
      } catch (err) {
         console.error("Failed to copy:", err);
      }
   }

   function handleShortcutDownload() {
      // Track shortcut download
      posthog?.capture("shortcut_downloaded", {
         calendar_type: type,
         device: device,
      });
   }

   const config = DIALOG_CONFIG[type];

   return (
      <Drawer open={open} onOpenChange={onOpenChange}>
         <DrawerContent className="bg-zinc-900 border-zinc-800 text-white max-h-[90vh] md:max-h-[85vh] flex flex-col">
            <DrawerHeader className="border-b border-zinc-800 pb-4 shrink-0">
               <DrawerTitle className="text-xl font-semibold">
                  {config.title}
               </DrawerTitle>
               <p className="text-sm text-zinc-400 mt-2">
                  {config.description}
               </p>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-3 md:px-4">
               <div className="space-y-6 py-4">
                  {/* Step 1: Define Wallpaper */}
                  <div className="space-y-4">
                     <StepHeader
                        step={1}
                        title={
                           type === "journey"
                              ? "Configure your Journey"
                              : "Define your Wallpaper"
                        }
                     />
                     <div className="ml-0 md:ml-9 space-y-4">
                        {/* Type-specific fields */}
                        {type === "year" && (
                           <LayoutSelector
                              value={layout}
                              onChange={setLayout}
                           />
                        )}
                        {type === "goal" && (
                           <>
                              <div className="space-y-2">
                                 <FieldLabel>Goal</FieldLabel>
                                 <input
                                    type="text"
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    placeholder="e.g. No Junk Food"
                                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
                                 />
                              </div>
                              <DateSelector
                                 label="Start Date"
                                 year={startYear}
                                 month={startMonth}
                                 day={startDay}
                                 onYearChange={setStartYear}
                                 onMonthChange={setStartMonth}
                                 onDayChange={setStartDay}
                              />
                              <DateSelector
                                 label="Deadline"
                                 year={deadlineYear}
                                 month={deadlineMonth}
                                 day={deadlineDay}
                                 onYearChange={setDeadlineYear}
                                 onMonthChange={setDeadlineMonth}
                                 onDayChange={setDeadlineDay}
                              />
                           </>
                        )}
                        {type === "journey" && (
                           <>
                              <div className="space-y-2">
                                 <FieldLabel>Origin Location</FieldLabel>
                                 <div className="flex gap-2">
                                    <div className="relative flex-1">
                                       <input
                                          type="text"
                                          value={originLocationInput}
                                          onChange={(e) =>
                                             handleOriginInputChange(
                                                e.target.value,
                                             )
                                          }
                                          onFocus={() =>
                                             originSuggestions.length > 0 &&
                                             setShowOriginSuggestions(true)
                                          }
                                          onBlur={() =>
                                             setTimeout(
                                                () =>
                                                   setShowOriginSuggestions(
                                                      false,
                                                   ),
                                                200,
                                             )
                                          }
                                          placeholder="e.g. New York, NY"
                                          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
                                       />
                                       {showOriginSuggestions &&
                                          originSuggestions.length > 0 && (
                                             <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 max-h-48 overflow-y-auto">
                                                {originSuggestions.map(
                                                   (suggestion, index) => (
                                                      <button
                                                         key={index}
                                                         type="button"
                                                         onClick={() =>
                                                            selectOriginSuggestion(
                                                               suggestion,
                                                            )
                                                         }
                                                         className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
                                                      >
                                                         {suggestion.place_name}
                                                      </button>
                                                   ),
                                                )}
                                             </div>
                                          )}
                                    </div>
                                    <button
                                       onClick={getCurrentOriginLocation}
                                       disabled={isLocatingOrigin}
                                       className="px-3 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                                       title="Use current location"
                                    >
                                       {isLocatingOrigin ? (
                                          <svg
                                             className="w-5 h-5 animate-spin"
                                             viewBox="0 0 24 24"
                                             fill="none"
                                          >
                                             <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                             />
                                             <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                             />
                                          </svg>
                                       ) : (
                                          <svg
                                             className="w-5 h-5"
                                             fill="none"
                                             stroke="currentColor"
                                             viewBox="0 0 24 24"
                                          >
                                             <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                             />
                                             <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                             />
                                          </svg>
                                       )}
                                       <span className="hidden md:inline">
                                          {isLocatingOrigin
                                             ? "Locating..."
                                             : "Use Current"}
                                       </span>
                                    </button>
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <FieldLabel>Destination Location</FieldLabel>
                                 <div className="relative">
                                    <input
                                       type="text"
                                       value={destinationLocationInput}
                                       onChange={(e) =>
                                          handleDestinationInputChange(
                                             e.target.value,
                                          )
                                       }
                                       onFocus={() =>
                                          destinationSuggestions.length > 0 &&
                                          setShowDestinationSuggestions(true)
                                       }
                                       onBlur={() =>
                                          setTimeout(
                                             () =>
                                                setShowDestinationSuggestions(
                                                   false,
                                                ),
                                             200,
                                          )
                                       }
                                       placeholder="e.g. Los Angeles, CA"
                                       className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
                                    />
                                    {showDestinationSuggestions &&
                                       destinationSuggestions.length > 0 && (
                                          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 max-h-48 overflow-y-auto">
                                             {destinationSuggestions.map(
                                                (suggestion, index) => (
                                                   <button
                                                      key={index}
                                                      type="button"
                                                      onClick={() =>
                                                         selectDestinationSuggestion(
                                                            suggestion,
                                                         )
                                                      }
                                                      className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
                                                   >
                                                      {suggestion.place_name}
                                                   </button>
                                                ),
                                             )}
                                          </div>
                                       )}
                                 </div>
                              </div>
                              <DateSelector
                                 label="Target Date"
                                 year={targetDateYear}
                                 month={targetDateMonth}
                                 day={targetDateDay}
                                 onYearChange={setTargetDateYear}
                                 onMonthChange={setTargetDateMonth}
                                 onDayChange={setTargetDateDay}
                              />
                              <div className="space-y-2">
                                 <FieldLabel>Zoom Level</FieldLabel>
                                 <Select
                                    value={journeyZoom}
                                    onValueChange={setJourneyZoom}
                                 >
                                    <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 rounded-none cursor-pointer">
                                       <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-800 border-zinc-700 rounded-none">
                                       {ZOOM_LEVELS.map((level) => (
                                          <SelectItem
                                             key={level.value}
                                             value={level.value}
                                          >
                                             {level.label}
                                          </SelectItem>
                                       ))}
                                    </SelectContent>
                                 </Select>
                              </div>
                           </>
                        )}

                        {/* Shared fields */}
                        <DeviceSelector value={device} onChange={setDevice} />
                        <ThemeSelector value={theme} onChange={setTheme} />
                        <ShapeSelector value={shape} onChange={setShape} />
                        <AccentColorSelector
                           value={accentColor}
                           onChange={setAccentColor}
                           label={
                              type === "year"
                                 ? "Accent Color (Today's Dot)"
                                 : type === "journey"
                                   ? "Accent Color (Markers & Status)"
                                   : "Accent Color (Current Day)"
                           }
                        />
                        <Preview
                           url={computedUrl}
                           alt={`${type === "year" ? "Year" : type === "goal" ? "Goal" : "Journey"} Wallpaper Preview`}
                        />
                     </div>
                  </div>

                  {/* Step 2 - Automation setup */}
                  <AutomationSetupStep
                     url={computedUrl}
                     urlReady={isStep1Complete}
                     copied={copied}
                     onCopy={copyUrl}
                     onShortcutDownload={handleShortcutDownload}
                  />
               </div>
            </div>

            {/* Info Note */}
            <div className="px-3 md:px-4 py-3 bg-zinc-900/50 border-t border-zinc-800">
               <div className="text-xs text-zinc-400 space-y-0.5 md:space-y-2">
                  <p>
                     Wallpapers follow{" "}
                     <span className="text-zinc-300 font-medium">
                        UTC time standard.
                     </span>{" "}
                     Updates at midnight UTC.
                  </p>
                  <p>
                     Run automation manually the{" "}
                     <span className="text-zinc-300 font-medium">
                        first time,
                     </span>{" "}
                     then it updates automatically daily.
                  </p>
               </div>
            </div>

            <div className="flex gap-3 p-3 md:p-4 border-t border-zinc-800 shrink-0">
               <Button
                  variant="outline"
                  className="flex-1 border-zinc-700 hover:bg-zinc-800 rounded-none"
                  onClick={() => onOpenChange(false)}
               >
                  Close
               </Button>
            </div>
         </DrawerContent>
      </Drawer>
   );
}
