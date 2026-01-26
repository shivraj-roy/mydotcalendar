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

interface GoalInstallationDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
}

const deviceNames = Object.keys(DEVICE_RESOLUTIONS).filter(
   (name) => name !== "Custom",
);

const accentColors = [
   { name: "Orange", value: "ff6347" },
   { name: "Blue", value: "3b82f6" },
   { name: "Lavender", value: "8b5cf6" },
];

// Generate year options (current year and next 5 years)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, i) => currentYear + i);

// Months
const months = [
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

// Days (1-31)
const days = Array.from({ length: 31 }, (_, i) => {
   const day = i + 1;
   return { value: day.toString().padStart(2, "0"), label: day.toString() };
});

export default function GoalInstallationDialog({
   open,
   onOpenChange,
}: GoalInstallationDialogProps) {
   const [device, setDevice] = useState('MacBook Pro 14" (M1-M4)');
   const [accentColor, setAccentColor] = useState("ff6347");
   const [theme, setTheme] = useState<"dark" | "light">("dark");
   const [shape, setShape] = useState<"circle" | "square" | "rounded">(
      "circle",
   );
   const [generatedUrl, setGeneratedUrl] = useState("");
   const [copied, setCopied] = useState(false);

   // Goal specific state
   const [goal, setGoal] = useState("");
   const [startYear, setStartYear] = useState("");
   const [startMonth, setStartMonth] = useState("");
   const [startDay, setStartDay] = useState("");
   const [deadlineYear, setDeadlineYear] = useState("");
   const [deadlineMonth, setDeadlineMonth] = useState("");
   const [deadlineDay, setDeadlineDay] = useState("");

   // Check if step 1 is complete
   const isStep1Complete = useMemo(() => {
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
      goal,
      startYear,
      startMonth,
      startDay,
      deadlineYear,
      deadlineMonth,
      deadlineDay,
   ]);

   // Format dates
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

   useEffect(() => {
      if (!isStep1Complete) {
         setGeneratedUrl("");
         return;
      }

      const baseUrl =
         typeof window !== "undefined" ? window.location.origin : "";
      const resolution = DEVICE_RESOLUTIONS[device];
      if (!resolution) return;

      const params = new URLSearchParams();
      params.append("goal", goal);
      params.append("start_date", startDate);
      params.append("goal_date", deadlineDate);
      params.append("width", resolution.width.toString());
      params.append("height", resolution.height.toString());
      if (accentColor !== "ff6347") {
         params.append("accent", accentColor);
      }
      if (theme !== "dark") {
         params.append("theme", theme);
      }
      if (shape !== "circle") {
         params.append("shape", shape);
      }

      const url = `${baseUrl}/api/goal?${params.toString()}`;
      setGeneratedUrl(url);
   }, [
      device,
      accentColor,
      theme,
      shape,
      goal,
      startDate,
      deadlineDate,
      isStep1Complete,
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

   return (
      <Drawer open={open} onOpenChange={onOpenChange}>
         <DrawerContent className="bg-zinc-900 border-zinc-800 text-white max-h-[90vh] md:max-h-[85vh] flex flex-col">
            <DrawerHeader className="border-b border-zinc-800 pb-4 shrink-0">
               <DrawerTitle className="text-xl font-semibold">
                  Goal Calendar Setup
               </DrawerTitle>
               <p className="text-sm text-zinc-400 mt-2">
                  Track your progress towards any goal with a visual countdown
                  wallpaper.
               </p>
            </DrawerHeader>

            <ScrollArea
               className="flex-1 overflow-y-auto px-3 md:px-4"
               style={{ maxHeight: "calc(90vh - 160px)" }}
            >
               <div className="space-y-6 py-4">
                  {/* Step 1: Define Wallpaper */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 bg-zinc-800 text-sm font-medium">
                           1
                        </span>
                        <h3 className="font-medium">Define your Wallpaper</h3>
                     </div>

                     <div className="ml-0 md:ml-9 space-y-4">
                        {/* Goal Input */}
                        <div className="space-y-2">
                           <label className="text-sm text-zinc-400">Goal</label>
                           <input
                              type="text"
                              value={goal}
                              onChange={(e) => setGoal(e.target.value)}
                              placeholder="e.g. No Junk Food"
                              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
                           />
                        </div>

                        {/* Start Date */}
                        <div className="space-y-2">
                           <label className="text-sm text-zinc-400">
                              Start Date
                           </label>
                           <div className="grid grid-cols-3 gap-2">
                              <Select
                                 value={startYear}
                                 onValueChange={setStartYear}
                              >
                                 <SelectTrigger className="bg-zinc-800 border-zinc-700 rounded-none cursor-pointer">
                                    <SelectValue placeholder="Year" />
                                 </SelectTrigger>
                                 <SelectContent className="bg-zinc-800 border-zinc-700 rounded-none">
                                    {years.map((year) => (
                                       <SelectItem
                                          key={year}
                                          value={year.toString()}
                                       >
                                          {year}
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                              <Select
                                 value={startMonth}
                                 onValueChange={setStartMonth}
                              >
                                 <SelectTrigger className="bg-zinc-800 border-zinc-700 rounded-none cursor-pointer">
                                    <SelectValue placeholder="Month" />
                                 </SelectTrigger>
                                 <SelectContent className="bg-zinc-800 border-zinc-700 rounded-none">
                                    {months.map((month) => (
                                       <SelectItem
                                          key={month.value}
                                          value={month.value}
                                       >
                                          {month.label}
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                              <Select
                                 value={startDay}
                                 onValueChange={setStartDay}
                              >
                                 <SelectTrigger className="bg-zinc-800 border-zinc-700 rounded-none cursor-pointer">
                                    <SelectValue placeholder="Day" />
                                 </SelectTrigger>
                                 <SelectContent className="bg-zinc-800 border-zinc-700 rounded-none">
                                    {days.map((day) => (
                                       <SelectItem
                                          key={day.value}
                                          value={day.value}
                                       >
                                          {day.label}
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                           </div>
                        </div>

                        {/* Deadline Date */}
                        <div className="space-y-2">
                           <label className="text-sm text-zinc-400">
                              Deadline
                           </label>
                           <div className="grid grid-cols-3 gap-2">
                              <Select
                                 value={deadlineYear}
                                 onValueChange={setDeadlineYear}
                              >
                                 <SelectTrigger className="bg-zinc-800 border-zinc-700 rounded-none cursor-pointer">
                                    <SelectValue placeholder="Year" />
                                 </SelectTrigger>
                                 <SelectContent className="bg-zinc-800 border-zinc-700 rounded-none">
                                    {years.map((year) => (
                                       <SelectItem
                                          key={year}
                                          value={year.toString()}
                                       >
                                          {year}
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                              <Select
                                 value={deadlineMonth}
                                 onValueChange={setDeadlineMonth}
                              >
                                 <SelectTrigger className="bg-zinc-800 border-zinc-700 rounded-none cursor-pointer">
                                    <SelectValue placeholder="Month" />
                                 </SelectTrigger>
                                 <SelectContent className="bg-zinc-800 border-zinc-700 rounded-none">
                                    {months.map((month) => (
                                       <SelectItem
                                          key={month.value}
                                          value={month.value}
                                       >
                                          {month.label}
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                              <Select
                                 value={deadlineDay}
                                 onValueChange={setDeadlineDay}
                              >
                                 <SelectTrigger className="bg-zinc-800 border-zinc-700 rounded-none cursor-pointer">
                                    <SelectValue placeholder="Day" />
                                 </SelectTrigger>
                                 <SelectContent className="bg-zinc-800 border-zinc-700 rounded-none">
                                    {days.map((day) => (
                                       <SelectItem
                                          key={day.value}
                                          value={day.value}
                                       >
                                          {day.label}
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                           </div>
                        </div>

                        {/* MacBook Model */}
                        <div className="space-y-2">
                           <label className="text-sm text-zinc-400">
                              MacBook Model
                           </label>
                           <Select value={device} onValueChange={setDevice}>
                              <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 rounded-none cursor-pointer">
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-800 border-zinc-700 rounded-none">
                                 {deviceNames.map((name) => (
                                    <SelectItem key={name} value={name}>
                                       {name}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </div>

                        {/* Theme Toggle */}
                        <div className="space-y-2">
                           <label className="text-sm text-zinc-400">
                              Theme
                           </label>
                           <div className="flex gap-2">
                              <button
                                 onClick={() => setTheme("dark")}
                                 className={`flex-1 px-4 py-2 border transition-all cursor-pointer ${
                                    theme === "dark"
                                       ? "bg-zinc-700 border-orange-500 text-white"
                                       : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                                 }`}
                              >
                                 Dark
                              </button>
                              <button
                                 onClick={() => setTheme("light")}
                                 className={`flex-1 px-4 py-2 border transition-all cursor-pointer ${
                                    theme === "light"
                                       ? "bg-zinc-700 border-orange-500 text-white"
                                       : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                                 }`}
                              >
                                 Light
                              </button>
                           </div>
                        </div>

                        {/* Shape Selection */}
                        <div className="space-y-2">
                           <label className="text-sm text-zinc-400">
                              Shape
                           </label>
                           <div className="flex gap-2">
                              <button
                                 onClick={() => setShape("circle")}
                                 className={`flex-1 px-2 md:px-4 py-2 border transition-all flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base cursor-pointer ${
                                    shape === "circle"
                                       ? "bg-zinc-700 border-orange-500 text-white"
                                       : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                                 }`}
                              >
                                 <span className="w-3 h-3 rounded-full bg-current" />
                                 Circle
                              </button>
                              <button
                                 onClick={() => setShape("square")}
                                 className={`flex-1 px-2 md:px-4 py-2 border transition-all flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base cursor-pointer ${
                                    shape === "square"
                                       ? "bg-zinc-700 border-orange-500 text-white"
                                       : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                                 }`}
                              >
                                 <span className="w-3 h-3 bg-current" />
                                 Square
                              </button>
                              <button
                                 onClick={() => setShape("rounded")}
                                 className={`flex-1 px-2 md:px-4 py-2 border transition-all flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base cursor-pointer ${
                                    shape === "rounded"
                                       ? "bg-zinc-700 border-orange-500 text-white"
                                       : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                                 }`}
                              >
                                 <span className="w-3 h-3 rounded-[4px] bg-current" />
                                 Rounded
                              </button>
                           </div>
                        </div>

                        {/* Accent Color */}
                        <div className="space-y-2">
                           <label className="text-sm text-zinc-400">
                              Accent Color (Current Day)
                           </label>
                           <div className="flex gap-2">
                              {accentColors.map((color) => (
                                 <button
                                    key={color.value}
                                    onClick={() => setAccentColor(color.value)}
                                    className={`flex-1 px-2 md:px-4 py-2 border transition-all flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base cursor-pointer ${
                                       accentColor === color.value
                                          ? "bg-zinc-700 border-orange-500 text-white"
                                          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                                    }`}
                                 >
                                    <span
                                       className="w-3 h-3 rounded-full"
                                       style={{
                                          backgroundColor: `#${color.value}`,
                                       }}
                                    />
                                    {color.name}
                                 </button>
                              ))}
                           </div>
                        </div>

                        {/* Preview - only show when URL is generated */}
                        {generatedUrl && (
                           <div className="space-y-2">
                              <label className="text-sm text-zinc-400">
                                 Preview
                              </label>
                              <div className="relative w-full aspect-video bg-zinc-950 overflow-hidden border border-zinc-800">
                                 {/* eslint-disable-next-line @next/next/no-img-element */}
                                 <img
                                    src={generatedUrl}
                                    alt="Goal Wallpaper Preview"
                                    className="w-full h-full object-contain"
                                 />
                              </div>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Step 2: Create Automation */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 bg-zinc-800 text-sm font-medium">
                           2
                        </span>
                        <h3 className="font-medium">Create Automation</h3>
                     </div>

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
                           <span className="text-white font-medium">
                              Automation
                           </span>{" "}
                           tab ➡︎ New Automation ➡︎{" "}
                           <span className="text-white font-medium">
                              Time of Day
                           </span>{" "}
                           ➡︎ 6:00 AM ➡︎ Repeat{" "}
                           <span className="text-white font-medium">
                              &quot;Daily&quot;
                           </span>{" "}
                           ➡︎ Select{" "}
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

                  {/* Step 3: Create Shortcut */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 bg-zinc-800 text-sm font-medium">
                           3
                        </span>
                        <h3 className="font-medium">Create Shortcut</h3>
                     </div>

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
                                    value={isStep1Complete ? generatedUrl : ""}
                                    placeholder="Complete step 1 first..."
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 font-mono truncate placeholder:text-zinc-500 placeholder:font-sans"
                                 />
                                 <Button
                                    onClick={copyUrl}
                                    variant="outline"
                                    size="sm"
                                    disabled={!isStep1Complete}
                                    className="border-zinc-700 hover:bg-zinc-800 rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                 >
                                    {copied ? "Copied!" : "Copy"}
                                 </Button>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <p className="text-sm">
                                 <span className="text-zinc-500">Step 2: </span>{" "}
                                 <span className="text-white font-medium">
                                    &quot;Set Wallpaper Photo&quot;
                                 </span>{" "}
                              </p>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <div className="flex-1 h-px bg-zinc-700" />
                           <span className="text-xs text-zinc-500 uppercase">
                              Or download shortcut
                           </span>
                           <div className="flex-1 h-px bg-zinc-700" />
                        </div>

                        {/* Download Shortcut Option */}
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
                              After downloading, double-click to import into
                              Shortcuts app. Then copy the URL above and paste
                              it into the shortcut.
                           </p>
                        </div>

                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-sm">
                           <p className="text-blue-400 font-medium">
                              Important:
                           </p>
                           <p className="text-zinc-400 mt-1">
                              In System Setting&#39;s{" "}
                              <span className="text-white">
                                 &quot;Wallpaper &quot;
                              </span>
                              , set to{" "}
                              <span className="text-white">
                                 &quot;Fill Screen&quot;
                              </span>
                              .
                           </p>
                           <p className="text-zinc-500 mt-2 text-xs">
                              This helps the wallpaper not get cut off.
                           </p>
                        </div>
                     </div>
                  </div>
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
