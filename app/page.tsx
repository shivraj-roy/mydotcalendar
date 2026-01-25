"use client";

import { useState } from "react";
import Image from "next/image";
import InstallationDialog from "@/components/InstallationDialog";

export default function Home() {
   const [dialogOpen, setDialogOpen] = useState(false);

   return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
         {/* Fixed Header */}
         <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950 border-b border-zinc-800">
            <div className="container mx-auto px-4 py-4 text-center">
               <p className="text-sm text-zinc-400 tracking-wide">
                  MyDotCalendar
               </p>
            </div>
         </header>

         <main className="container mx-auto px-4 pt-20 pb-8 flex-1">
            {/* Hero Section */}
            <section className="text-center mt-8 mb-16 max-w-4xl mx-auto">
               <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  <span className="">Minimalist wallpapers</span>
                  <br />
                  <span className="">for mindful living.</span>
               </h1>
               <p className="text-lg md:text-xl text-zinc-400 mt-6 max-w-2xl mx-auto">
                  Visualize your year progress at a glance. Updated
                  automatically on your lock screen.
               </p>
            </section>

            {/* Calendar Card */}
            <section className="max-w-md mx-auto mb-20">
               <div
                  className="bg-zinc-900/50 p-6 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors"
                  onClick={() => setDialogOpen(true)}
               >
                  <div className="text-center mb-4">
                     <h2 className="text-xl font-semibold">Year Calendar</h2>
                     <p className="text-sm text-zinc-400 mt-1">
                        Track your year&apos;s progress
                     </p>
                  </div>

                  {/* MacBook Mockup */}
                  <div className="relative w-full aspect-[4/3] mb-4">
                     <Image
                        src="/my-dot-calendar.png"
                        alt="Year Calendar Wallpaper Preview"
                        fill
                        className="object-contain"
                        priority
                     />
                  </div>

                  {/* Install Button */}
                  <button
                     onClick={(e) => {
                        e.stopPropagation();
                        setDialogOpen(true);
                     }}
                     className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 transition-colors group"
                  >
                     <span>Install</span>
                     <svg
                        className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M9 5l7 7-7 7"
                        />
                     </svg>
                  </button>
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

         {/* Installation Dialog */}
         <InstallationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
   );
}
