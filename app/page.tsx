"use client";

import { useState } from "react";
import Image from "next/image";
import WallpaperDialog from "@/components/WallpaperDialog";
import CalendarCard from "@/components/CalendarCard";

export default function Home() {
   const [dialogOpen, setDialogOpen] = useState(false);
   const [goalDialogOpen, setGoalDialogOpen] = useState(false);
   const [locationDialogOpen, setLocationDialogOpen] = useState(false);

   return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
         {/* Fixed Header */}
         <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950 border-b border-zinc-800">
            <div className="container mx-auto px-4 py-3 relative flex items-center justify-center h-12">
               <div className="absolute left-1/2 -translate-x-1/2 group">
                  <Image
                     src="/assets/dot-logo.png"
                     alt="Logo"
                     width={46}
                     height={46}
                     className="cursor-pointer"
                  />
                  <span className="absolute right-full mr-0 top-1/2 -translate-y-1/2 text-base font-bold tracking-wide transition-all duration-300 group-hover:opacity-0 group-hover:translate-y-1 whitespace-nowrap">
                     My
                  </span>
                  <span className="absolute left-full ml-0 top-1/2 -translate-y-1/2 text-base font-bold tracking-wide transition-all duration-300 group-hover:opacity-0 group-hover:translate-y-1 whitespace-nowrap">
                     Calendar
                  </span>
               </div>
            </div>
         </header>

         <main className="container mx-auto px-4 pt-20 pb-8 flex-1">
            {/* Hero Section */}
            <section className="text-center mt-4 md:mt-8 mb-10 md:mb-16 max-w-4xl mx-auto">
               <h1 className="text-4xl md:text-7xl font-bold leading-[1.1]">
                  <span className="">
                     Minimal by design
                     <span className="text-[#ff6347]">.</span>{" "}
                  </span>
                  <br />
                  <span className="">
                     Productive wallpapers
                     <span className="text-[#ff6347]">.</span>{" "}
                  </span>
               </h1>
               <p className="text-lg md:text-xl text-zinc-400 mt-6 max-w-2xl mx-auto">
                  Your progress, at a glance. <br />
                  Auto-updated on your screen.
               </p>
            </section>

            {/* Calendar Cards */}
            <section className="max-w-5xl mx-auto mb-12 md:mb-20">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CalendarCard
                     title="Year"
                     description="Track your year's progress"
                     imageSrc="/my-dot-calendar.png"
                     onClick={() => setDialogOpen(true)}
                  />
                  <CalendarCard
                     title="Goal"
                     description="Track progress towards your goal"
                     imageSrc="/goal calendar.png"
                     onClick={() => setGoalDialogOpen(true)}
                  />
                  <CalendarCard
                     title="Location"
                     description="Your city in dot-art style"
                     imageSrc="/location-map.png"
                     onClick={() => setLocationDialogOpen(true)}
                  />
               </div>
            </section>
         </main>

         {/* Footer */}
         <footer className="border-t border-zinc-800 py-8">
            <div className="container mx-auto px-4 text-center text-zinc-500 text-sm">
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
            type="location"
            open={locationDialogOpen}
            onOpenChange={setLocationDialogOpen}
         />
      </div>
   );
}
