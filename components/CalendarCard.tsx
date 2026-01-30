import Image from "next/image";

interface CalendarCardProps {
   title: string;
   description: string;
   imageSrc: string;
   onClick: () => void;
   priority?: boolean;
}

export default function CalendarCard({
   title,
   description,
   imageSrc,
   onClick,
   priority = false,
}: CalendarCardProps) {
   return (
      <div
         className="bg-zinc-900/50 p-6 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors"
         onClick={onClick}
      >
         <div className="text-center mb-4">
            <h2 className="text-xl font-semibold">
               {title} <span className="text-[#ff6347]">.</span> Calendar
            </h2>
            <p className="text-sm text-zinc-400 mt-1">{description}</p>
         </div>

         <div className="relative w-full aspect-4/3 mb-4">
            <Image
               src={imageSrc}
               alt={`${title} Calendar Wallpaper Preview`}
               fill
               sizes="(max-width: 768px) 100vw, 50vw"
               className="object-contain"
               priority={priority}
            />
         </div>

         <button
            onClick={(e) => {
               e.stopPropagation();
               onClick();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 transition-colors group cursor-pointer"
         >
            <span>Install</span>
            <svg
               className="w-4 h-4 group-hover:translate-x-0.5 group-hover:text-[#ff6347] transition-transform"
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
   );
}
