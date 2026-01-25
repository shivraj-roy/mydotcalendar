"use client";

import { useState, useEffect } from "react";
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

interface InstallationDialogProps {
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

export default function InstallationDialog({
   open,
   onOpenChange,
}: InstallationDialogProps) {
   const [device, setDevice] = useState('MacBook Pro 14" (M1-M4)');
   const [layout, setLayout] = useState<"year" | "month">("year");
   const [accentColor, setAccentColor] = useState("ff6347");
   const [theme, setTheme] = useState<"dark" | "light">("dark");
   const [shape, setShape] = useState<"circle" | "square" | "rounded">(
      "circle",
   );
   const [generatedUrl, setGeneratedUrl] = useState("");
   const [copied, setCopied] = useState(false);

   useEffect(() => {
      generateUrl();
   }, [device, layout, accentColor, theme, shape]);

   function generateUrl() {
      const baseUrl =
         typeof window !== "undefined" ? window.location.origin : "";
      const resolution = DEVICE_RESOLUTIONS[device];
      if (!resolution) return;

      const params = new URLSearchParams();
      params.append("width", resolution.width.toString());
      params.append("height", resolution.height.toString());
      if (layout !== "year") {
         params.append("layout", layout);
      }
      if (accentColor !== "ff6347") {
         params.append("accent", accentColor);
      }
      if (theme !== "dark") {
         params.append("theme", theme);
      }
      if (shape !== "circle") {
         params.append("shape", shape);
      }

      const url = `${baseUrl}/api/year?${params.toString()}`;
      setGeneratedUrl(url);
   }

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
                  Installation Steps
               </DrawerTitle>
               <p className="text-sm text-zinc-400 mt-2">
                  Start by configuring your wallpaper settings. Next, set up a
                  daily automation. Finally, add the shortcut actions so your
                  wallpaper updates automatically.
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
                        {/* Layout Style */}
                        <div className="space-y-2">
                           <label className="text-sm text-zinc-400">
                              Layout Style
                           </label>
                           <Select
                              value={layout}
                              onValueChange={(value: "year" | "month") =>
                                 setLayout(value)
                              }
                           >
                              <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 rounded-none cursor-pointer">
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-800 border-zinc-700 rounded-none">
                                 <SelectItem value="year">
                                    Days (all days of the year)
                                 </SelectItem>
                                 <SelectItem value="month">
                                    Months (calendar grid)
                                 </SelectItem>
                              </SelectContent>
                           </Select>
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

                        {/* Accent Color - 3 options only */}
                        <div className="space-y-2">
                           <label className="text-sm text-zinc-400">
                              Accent Color (Today&apos;s Dot)
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

                        {/* Preview */}
                        {generatedUrl && (
                           <div className="space-y-2">
                              <label className="text-sm text-zinc-400">
                                 Preview
                              </label>
                              <div className="relative w-full aspect-video bg-zinc-950 overflow-hidden border border-zinc-800">
                                 {/* eslint-disable-next-line @next/next/no-img-element */}
                                 <img
                                    src={generatedUrl}
                                    alt="Wallpaper Preview"
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
                                    value={generatedUrl}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 font-mono truncate"
                                 />
                                 <Button
                                    onClick={copyUrl}
                                    variant="outline"
                                    size="sm"
                                    className="border-zinc-700 hover:bg-zinc-800 rounded-none cursor-pointer"
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
                              Or create manually
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
                              Shortcuts app. Then copy the URL below and paste
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
