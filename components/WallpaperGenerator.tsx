"use client";

import { useState, useEffect } from "react";
import { DEVICE_RESOLUTIONS } from "@/lib/constants";

const deviceNames = Object.keys(DEVICE_RESOLUTIONS).filter(
   (name) => name !== "Custom",
);

export default function WallpaperGenerator() {
   const [device, setDevice] = useState('MacBook Pro 14" (M1-M4)');
   const [customWidth, setCustomWidth] = useState(3024);
   const [customHeight, setCustomHeight] = useState(1964);
   const [accentColor, setAccentColor] = useState("ff6347");
   const [theme, setTheme] = useState<"dark" | "light">("dark");
   const [shape, setShape] = useState<"circle" | "square" | "rounded">("circle");
   const [generatedUrl, setGeneratedUrl] = useState("");
   const [copied, setCopied] = useState(false);
   const [isCustom, setIsCustom] = useState(false);

   // Update dimensions when device changes
   useEffect(() => {
      if (device !== "Custom" && DEVICE_RESOLUTIONS[device]) {
         const res = DEVICE_RESOLUTIONS[device];
         setCustomWidth(res.width);
         setCustomHeight(res.height);
         setIsCustom(false);
      } else {
         setIsCustom(true);
      }
   }, [device]);

   // Generate URL whenever parameters change
   useEffect(() => {
      generateUrl();
   }, [customWidth, customHeight, accentColor, theme, shape]);

   function generateUrl() {
      const baseUrl =
         typeof window !== "undefined" ? window.location.origin : "";
      const params = new URLSearchParams();
      params.append("width", customWidth.toString());
      params.append("height", customHeight.toString());

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

   async function copyToClipboard() {
      try {
         await navigator.clipboard.writeText(generatedUrl);
         setCopied(true);
         setTimeout(() => setCopied(false), 2000);
      } catch (err) {
         console.error("Failed to copy:", err);
      }
   }

   function downloadImage() {
      if (generatedUrl) {
         window.open(generatedUrl, "_blank");
      }
   }

   return (
      <div className="w-full max-w-2xl mx-auto space-y-8">
         {/* Device Selection */}
         <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">
               Select Your Device
            </label>
            <select
               value={device}
               onChange={(e) => setDevice(e.target.value)}
               className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
               {deviceNames.map((name) => (
                  <option key={name} value={name}>
                     {name}
                  </option>
               ))}
               <option value="Custom">Custom Resolution</option>
            </select>
         </div>

         {/* Custom Resolution (shown when Custom is selected) */}
         {isCustom && (
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">
                     Width (px)
                  </label>
                  <input
                     type="number"
                     value={customWidth}
                     onChange={(e) =>
                        setCustomWidth(parseInt(e.target.value) || 0)
                     }
                     min={100}
                     max={10000}
                     className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
               </div>
               <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">
                     Height (px)
                  </label>
                  <input
                     type="number"
                     value={customHeight}
                     onChange={(e) =>
                        setCustomHeight(parseInt(e.target.value) || 0)
                     }
                     min={100}
                     max={10000}
                     className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
               </div>
            </div>
         )}

         {/* Accent Color */}
         <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">
               Accent Color (Today&apos;s Dot)
            </label>
            <div className="flex gap-4 items-center">
               <input
                  type="color"
                  value={`#${accentColor}`}
                  onChange={(e) =>
                     setAccentColor(e.target.value.replace("#", ""))
                  }
                  className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent"
               />
               <input
                  type="text"
                  value={accentColor}
                  onChange={(e) =>
                     setAccentColor(e.target.value.replace("#", ""))
                  }
                  placeholder="ff6347"
                  maxLength={6}
                  className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
               />
            </div>
            {/* Preset Colors */}
            <div className="flex gap-2 mt-2">
               {[
                  "ff6347",
                  "3b82f6",
                  "10b981",
                  "f59e0b",
                  "ef4444",
                  "8b5cf6",
               ].map((color) => (
                  <button
                     key={color}
                     onClick={() => setAccentColor(color)}
                     className={`w-8 h-8 rounded-full border-2 transition-all ${
                        accentColor === color
                           ? "border-white scale-110"
                           : "border-transparent"
                     }`}
                     style={{ backgroundColor: `#${color}` }}
                  />
               ))}
            </div>
         </div>

         {/* Theme Toggle */}
         <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">
               Theme
            </label>
            <div className="flex gap-4">
               <button
                  onClick={() => setTheme("dark")}
                  className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                     theme === "dark"
                        ? "bg-zinc-700 border-orange-500 text-white"
                        : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
               >
                  Dark
               </button>
               <button
                  onClick={() => setTheme("light")}
                  className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
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
            <label className="block text-sm font-medium text-zinc-300">
               Shape
            </label>
            <div className="flex gap-4">
               <button
                  onClick={() => setShape("circle")}
                  className={`flex-1 px-4 py-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                     shape === "circle"
                        ? "bg-zinc-700 border-orange-500 text-white"
                        : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
               >
                  <span className="w-4 h-4 rounded-full bg-current" />
                  Circle
               </button>
               <button
                  onClick={() => setShape("square")}
                  className={`flex-1 px-4 py-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                     shape === "square"
                        ? "bg-zinc-700 border-orange-500 text-white"
                        : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
               >
                  <span className="w-4 h-4 bg-current" />
                  Square
               </button>
               <button
                  onClick={() => setShape("rounded")}
                  className={`flex-1 px-4 py-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                     shape === "rounded"
                        ? "bg-zinc-700 border-orange-500 text-white"
                        : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
               >
                  <span className="w-4 h-4 rounded-sm bg-current" />
                  Rounded
               </button>
            </div>
         </div>

         {/* Generated URL */}
         <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">
               Your Wallpaper URL
            </label>
            <div className="flex gap-2">
               <input
                  type="text"
                  value={generatedUrl}
                  readOnly
                  className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-400 font-mono text-sm truncate"
               />
               <button
                  onClick={copyToClipboard}
                  className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
               >
                  {copied ? "Copied!" : "Copy"}
               </button>
            </div>
         </div>

         {/* Action Buttons */}
         <div className="flex gap-4">
            <button
               onClick={downloadImage}
               className="flex-1 px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors border border-zinc-700"
            >
               Preview / Download
            </button>
         </div>

         {/* Preview */}
         {generatedUrl && (
            <div className="space-y-2">
               <label className="block text-sm font-medium text-zinc-300">
                  Preview (scaled)
               </label>
               <div className="relative w-full aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-700">
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
   );
}
