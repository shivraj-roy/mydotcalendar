"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Github, Star } from "lucide-react";
import WallpaperDialog from "@/components/WallpaperDialog";
import CalendarCard from "@/components/CalendarCard";

export default function Home() {
   const [dialogOpen, setDialogOpen] = useState(false);
   const [goalDialogOpen, setGoalDialogOpen] = useState(false);
   const [journeyDialogOpen, setJourneyDialogOpen] = useState(false);

   const tooltipMessages = [
      "Like it!",
      "Love it!",
      "What a dot!",
      "Buy me coffee!",
      "Thanks for the dot!",
   ];
   const [messageIndex, setMessageIndex] = useState(0);
   const [tooltipVisible, setTooltipVisible] = useState(false);

   // Show tooltip after 10 seconds initial delay
   useEffect(() => {
      const initialDelay = setTimeout(() => {
         setTooltipVisible(true);
      }, 10000);

      return () => clearTimeout(initialDelay);
   }, []);

   // Rotate tooltip message every 8 seconds (only after tooltip is visible)
   useEffect(() => {
      if (!tooltipVisible) return;

      const interval = setInterval(() => {
         setMessageIndex((prev) => (prev + 1) % tooltipMessages.length);
      }, 8000);
      return () => clearInterval(interval);
   }, [tooltipVisible, tooltipMessages.length]);

   return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
         {/* Fixed Header */}
         <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950 border-b border-zinc-800">
            <div className="container mx-auto px-4 py-3 relative flex items-center justify-center h-12">
               <div className="absolute left-1/2 -translate-x-1/2 group flex items-center">
                  <Image
                     src="/assets/dot-logo.png"
                     alt="Logo"
                     width={46}
                     height={46}
                     className="cursor-pointer"
                  />
                  <span className="text-base font-bold tracking-wide transition-all duration-300 group-hover:opacity-0 group-hover:translate-y-1 whitespace-nowrap cursor-default">
                     Dot
                     <span className="text-[#ff6347]">.</span>
                     Cal
                  </span>
               </div>
            </div>
         </header>

         <main className="container mx-auto px-4 pt-20 pb-8 flex-1">
            {/* Hero Section */}
            <section className="text-center mt-4 md:mt-8 mb-10 md:mb-16 max-w-4xl mx-auto cursor-default">
               <h1 className="text-4xl md:text-7xl font-bold leading-[1.1]">
                  Minimal by design
                  <span className="text-[#ff6347]">.</span> <br />
                  Productive wallpapers
                  <span className="text-[#ff6347]">.</span>{" "}
               </h1>
               <p className="text-lg md:text-xl text-zinc-400 mt-6 max-w-2xl mx-auto">
                  Auto-updating macOS wallpapers that turn <br />
                  your desktop into a progress tracker.
               </p>
            </section>

            {/* Calendar Cards */}
            <section className="max-w-5xl mx-auto mb-12 md:mb-20">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CalendarCard
                     title="Year"
                     description="Track your year's progress"
                     imageSrc="/assets/mockups/Year Mockup.png"
                     onClick={() => setDialogOpen(true)}
                     priority
                  />
                  <CalendarCard
                     title="Goal"
                     description="Track progress towards your goal"
                     imageSrc="/assets/mockups/Goal Mockup.png"
                     onClick={() => setGoalDialogOpen(true)}
                     priority
                  />
                  <CalendarCard
                     title="Journey"
                     description="Track progress to your destination"
                     imageSrc="/assets/mockups/Journey Mockup.png"
                     onClick={() => setJourneyDialogOpen(true)}
                  />
               </div>
            </section>
         </main>

         {/* Footer */}
         <footer className="border-t border-zinc-800 py-5">
            <div className="container mx-auto px-4 flex items-center justify-center gap-3 text-zinc-500 text-sm">
               <p>
                  Made by{" "}
                  <a
                     href="https://twitter.com/shivraj_roy10"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-zinc-400 hover:text-white transition-colors underline"
                  >
                     @shivraj_roy10
                  </a>
               </p>
               <span className="text-[#ff6347] text-lg">.</span>
               <a
                  href="https://github.com/shivraj-roy/mydotcalendar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group text-zinc-400 hover:text-white transition-colors"
                  aria-label="Star on GitHub"
               >
                  <Github size={18} />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-zinc-800 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1">
                     <Star size={12} />
                     Star on GitHub..!
                  </span>
               </a>
            </div>
         </footer>

         {/* Installation Dialogs */}
         <WallpaperDialog
            type="year"
            open={dialogOpen}
            onOpenChange={setDialogOpen}
         />
         <WallpaperDialog
            type="goal"
            open={goalDialogOpen}
            onOpenChange={setGoalDialogOpen}
         />
         <WallpaperDialog
            type="journey"
            open={journeyDialogOpen}
            onOpenChange={setJourneyDialogOpen}
         />

         {/* Buy Me a Coffee Button */}
         <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
            {/* Tooltip Bubble */}
            {tooltipVisible && (
               <div
                  key={messageIndex}
                  className="absolute bottom-full right-0 mb-3 animate-[fadeIn_0.5s_ease-in-out]"
               >
                  <div className="relative bg-zinc-800 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
                     {tooltipMessages[messageIndex]}
                     {/* Arrow pointing down */}
                     <div className="absolute -bottom-1 right-6 w-3 h-3 bg-zinc-800 rotate-45"></div>
                  </div>
               </div>
            )}

            <a
               href="https://buymeacoffee.com/shivraj.roy"
               target="_blank"
               rel="noopener noreferrer"
               className="block bg-[#27272A] hover:bg-[#404040] transition-all duration-300 rounded-full p-3 shadow-lg hover:shadow-xl hover:scale-110"
               aria-label="Buy me a coffee"
            >
               <Image
                  src="/BMC.svg"
                  alt="Buy me a coffee"
                  width={32}
                  height={32}
                  className="w-8 h-8"
               />
            </a>
         </div>
      </div>
   );
}
