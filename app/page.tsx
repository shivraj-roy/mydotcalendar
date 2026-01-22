import WallpaperGenerator from "@/components/WallpaperGenerator";

export default function Home() {
   return (
      <div className="min-h-screen bg-zinc-950 text-white">
         <main className="container mx-auto px-4 py-16">
            {/* Hero Section */}
            <section className="text-center mb-16">
               <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  MyDotCalendar
               </h1>
               <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                  Your year, one dot at a time. Generate dynamic wallpapers that
                  show every day of your year as a dot, updating daily to track
                  your progress.
               </p>
            </section>

            {/* Generator Section */}
            <section className="mb-16">
               <WallpaperGenerator />
            </section>

            {/* Instructions Section */}
            <section className="max-w-2xl mx-auto mb-16">
               <h2 className="text-2xl font-semibold mb-6 text-center">
                  How to Set Up
               </h2>
               <div className="space-y-4 text-zinc-400">
                  <div className="flex gap-4 items-start">
                     <span className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        1
                     </span>
                     <div>
                        <h3 className="text-white font-medium">
                           Choose Your Device
                        </h3>
                        <p>
                           Select your MacBook model or enter custom dimensions.
                        </p>
                     </div>
                  </div>
                  <div className="flex gap-4 items-start">
                     <span className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        2
                     </span>
                     <div>
                        <h3 className="text-white font-medium">
                           Customize (Optional)
                        </h3>
                        <p>Pick your accent color and theme preference.</p>
                     </div>
                  </div>
                  <div className="flex gap-4 items-start">
                     <span className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        3
                     </span>
                     <div>
                        <h3 className="text-white font-medium">Copy the URL</h3>
                        <p>
                           Copy the generated wallpaper URL to your clipboard.
                        </p>
                     </div>
                  </div>
                  <div className="flex gap-4 items-start">
                     <span className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        4
                     </span>
                     <div>
                        <h3 className="text-white font-medium">
                           Set as Wallpaper
                        </h3>
                        <p>
                           On Mac: System Settings &gt; Wallpaper &gt; Add
                           Folder/Photo &gt; paste URL. Or use a dynamic
                           wallpaper app that supports URLs.
                        </p>
                     </div>
                  </div>
               </div>
            </section>

            {/* Features Section */}
            <section className="max-w-4xl mx-auto mb-16">
               <h2 className="text-2xl font-semibold mb-8 text-center">
                  What Each Dot Means
               </h2>
               <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                     <div className="w-8 h-8 rounded-full bg-white mb-4"></div>
                     <h3 className="text-lg font-medium mb-2">White Dots</h3>
                     <p className="text-zinc-400">
                        Days that have passed - days you&apos;ve already lived
                        this year.
                     </p>
                  </div>
                  <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                     <div className="w-8 h-8 rounded-full bg-orange-500 mb-4"></div>
                     <h3 className="text-lg font-medium mb-2">Orange Dot</h3>
                     <p className="text-zinc-400">
                        Today - your current position in the year.
                     </p>
                  </div>
                  <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                     <div className="w-8 h-8 rounded-full bg-zinc-700 mb-4"></div>
                     <h3 className="text-lg font-medium mb-2">Gray Dots</h3>
                     <p className="text-zinc-400">
                        Future days - the time you still have ahead.
                     </p>
                  </div>
               </div>
            </section>

            {/* FAQ Section */}
            <section className="max-w-2xl mx-auto mb-16">
               <h2 className="text-2xl font-semibold mb-8 text-center">FAQ</h2>
               <div className="space-y-6">
                  <div>
                     <h3 className="text-lg font-medium mb-2">
                        How does it update daily?
                     </h3>
                     <p className="text-zinc-400">
                        The URL generates a fresh image each time it&apos;s
                        loaded. If your wallpaper app refreshes periodically or
                        on wake, you&apos;ll see the updated calendar.
                     </p>
                  </div>
                  <div>
                     <h3 className="text-lg font-medium mb-2">
                        What are the 365 dots?
                     </h3>
                     <p className="text-zinc-400">
                        Each dot represents one day of the year. On leap years,
                        you&apos;ll see 366 dots.
                     </p>
                  </div>
                  <div>
                     <h3 className="text-lg font-medium mb-2">
                        Can I use custom colors?
                     </h3>
                     <p className="text-zinc-400">
                        Yes! Use the color picker to choose any accent color for
                        today&apos;s dot and the status text.
                     </p>
                  </div>
               </div>
            </section>

            {/* Footer */}
            <footer className="text-center text-zinc-500 text-sm">
               <p>MyDotCalendar - 365 dots. One year. Make it count.</p>
            </footer>
         </main>
      </div>
   );
}
