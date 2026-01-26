"use client";

import { useState, useEffect, useMemo } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { DEVICE_RESOLUTIONS } from "@/lib/constants";

// ============ Types ============
type WallpaperType = "year" | "goal";
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
   { name: "Blue", value: "3b82f6" },
   { name: "Lavender", value: "8b5cf6" },
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
      title: "Installation Steps",
      description:
         "Start by configuring your wallpaper settings. Next, set up a daily automation. Finally, add the shortcut actions so your wallpaper updates automatically.",
   },
   goal: {
      title: "Goal Calendar Setup",
      description:
         "Track your progress towards any goal with a visual countdown wallpaper.",
   },
};

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
            <ToggleButton selected={value === "dark"} onClick={() => onChange("dark")}>
               Dark
            </ToggleButton>
            <ToggleButton selected={value === "light"} onClick={() => onChange("light")}>
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
               icon={<span className="w-3 h-3 rounded-[4px] bg-current" />}
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

function AutomationStep() {
   return (
      <div className="space-y-4">
         <StepHeader step={2} title="Create Automation" />
         <div className="ml-0 md:ml-9 space-y-2 text-sm text-zinc-400">
            <p>
               Open{" "}
               <a
                  href="shortcuts://"
                  className="text-blue-400 underline hover:text-blue-300"
               >
                  Shortcuts
               </a>{" "}
               app ➡︎ Go to{" "}
               <span className="text-white font-medium">Automation</span> tab ➡︎ New
               Automation ➡︎{" "}
               <span className="text-white font-medium">Time of Day</span> ➡︎ 6:00 AM
               ➡︎ Repeat{" "}
               <span className="text-white font-medium">&quot;Daily&quot;</span> ➡︎
               Select{" "}
               <span className="text-white font-medium">
                  &quot;Run Immediately&quot;
               </span>{" "}
               ➡︎{" "}
               <span className="text-orange-400 font-medium">
                  &quot;Create New Shortcut&quot;
               </span>
            </p>
         </div>
      </div>
   );
}

function ShortcutStep({
   url,
   urlReady,
   copied,
   onCopy,
}: {
   url: string;
   urlReady: boolean;
   copied: boolean;
   onCopy: () => void;
}) {
   return (
      <div className="space-y-4">
         <StepHeader step={3} title="Create Shortcut" />
         <div className="ml-0 md:ml-9 space-y-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">
               Add these actions:
            </p>

            <div className="space-y-3">
               <div className="space-y-2">
                  <p className="text-sm">
                     <span className="text-zinc-500">Step 1: </span>{" "}
                     <span className="text-white font-medium">
                        &quot;Get Contents of URL&quot;
                     </span>{" "}
                     <span className="text-zinc-400">
                        ➡︎ paste the following URL below:
                     </span>
                  </p>
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

               <p className="text-sm">
                  <span className="text-zinc-500">Step 2: </span>{" "}
                  <span className="text-white font-medium">
                     &quot;Set Wallpaper Photo&quot;
                  </span>
               </p>
            </div>

            <div className="flex items-center gap-3">
               <div className="flex-1 h-px bg-zinc-700" />
               <span className="text-xs text-zinc-500 uppercase">
                  Or download shortcut
               </span>
               <div className="flex-1 h-px bg-zinc-700" />
            </div>

            <div className="p-3 bg-zinc-800/50 border border-zinc-700">
               <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <p className="text-sm text-zinc-300">
                     Don&apos;t want to create manually?{" "}
                     <span className="hidden md:inline">
                        Download our pre-made shortcut:
                     </span>
                     <span className="md:hidden">
                        <br />
                        Download our pre-made shortcut:
                     </span>
                  </p>
                  <a
                     href="/assets/Set My Dot Wallpaper.shortcut"
                     download="Set My Dot Wallpaper.shortcut"
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
               <p className="text-xs text-zinc-500 mt-2">
                  After downloading, double-click to import into Shortcuts app. Then
                  copy the URL above and paste it into the shortcut.
               </p>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-sm">
               <p className="text-blue-400 font-medium">Important:</p>
               <p className="text-zinc-400 mt-1">
                  In System Setting&#39;s{" "}
                  <span className="text-white">&quot;Wallpaper &quot;</span>, set to{" "}
                  <span className="text-white">&quot;Fill Screen&quot;</span>.
               </p>
               <p className="text-zinc-500 mt-2 text-xs">
                  This helps the wallpaper not get cut off.
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
   // Shared state
   const [device, setDevice] = useState('MacBook Pro 14" (M1-M4)');
   const [accentColor, setAccentColor] = useState("ff6347");
   const [theme, setTheme] = useState<Theme>("dark");
   const [shape, setShape] = useState<Shape>("circle");
   const [generatedUrl, setGeneratedUrl] = useState("");
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

   // Check if goal step 1 is complete
   const isGoalStep1Complete = useMemo(() => {
      if (type !== "goal") return true;
      return (
         goal.trim() !== "" &&
         startYear !== "" &&
         startMonth !== "" &&
         startDay !== "" &&
         deadlineYear !== "" &&
         deadlineMonth !== "" &&
         deadlineDay !== ""
      );
   }, [
      type,
      goal,
      startYear,
      startMonth,
      startDay,
      deadlineYear,
      deadlineMonth,
      deadlineDay,
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

   // Generate URL
   useEffect(() => {
      if (type === "goal" && !isGoalStep1Complete) {
         setGeneratedUrl("");
         return;
      }

      const baseUrl =
         typeof window !== "undefined" ? window.location.origin : "";
      const resolution = DEVICE_RESOLUTIONS[device];
      if (!resolution) return;

      const params = new URLSearchParams();
      params.append("width", resolution.width.toString());
      params.append("height", resolution.height.toString());

      if (type === "year") {
         if (layout !== "year") params.append("layout", layout);
      } else {
         params.append("goal", goal);
         params.append("start_date", startDate);
         params.append("goal_date", deadlineDate);
      }

      if (accentColor !== "ff6347") params.append("accent", accentColor);
      if (theme !== "dark") params.append("theme", theme);
      if (shape !== "circle") params.append("shape", shape);

      const endpoint = type === "year" ? "/api/year" : "/api/goal";
      setGeneratedUrl(`${baseUrl}${endpoint}?${params.toString()}`);
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
      isGoalStep1Complete,
   ]);

   async function copyUrl() {
      try {
         await navigator.clipboard.writeText(generatedUrl);
         setCopied(true);
         setTimeout(() => setCopied(false), 2000);
      } catch (err) {
         console.error("Failed to copy:", err);
      }
   }

   const config = DIALOG_CONFIG[type];

   return (
      <Drawer open={open} onOpenChange={onOpenChange}>
         <DrawerContent className="bg-zinc-900 border-zinc-800 text-white max-h-[90vh] md:max-h-[85vh] flex flex-col">
            <DrawerHeader className="border-b border-zinc-800 pb-4 shrink-0">
               <DrawerTitle className="text-xl font-semibold">
                  {config.title}
               </DrawerTitle>
               <p className="text-sm text-zinc-400 mt-2">{config.description}</p>
            </DrawerHeader>

            <ScrollArea
               className="flex-1 overflow-y-auto px-3 md:px-4"
               style={{ maxHeight: "calc(90vh - 160px)" }}
            >
               <div className="space-y-6 py-4">
                  {/* Step 1: Define Wallpaper */}
                  <div className="space-y-4">
                     <StepHeader step={1} title="Define your Wallpaper" />
                     <div className="ml-0 md:ml-9 space-y-4">
                        {/* Type-specific fields */}
                        {type === "year" ? (
                           <LayoutSelector value={layout} onChange={setLayout} />
                        ) : (
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
                                 : "Accent Color (Current Day)"
                           }
                        />
                        <Preview
                           url={generatedUrl}
                           alt={`${type === "year" ? "Year" : "Goal"} Wallpaper Preview`}
                        />
                     </div>
                  </div>

                  {/* Step 2 & 3 - Shared */}
                  <AutomationStep />
                  <ShortcutStep
                     url={generatedUrl}
                     urlReady={type === "year" || isGoalStep1Complete}
                     copied={copied}
                     onCopy={copyUrl}
                  />
               </div>
            </ScrollArea>

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
