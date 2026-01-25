import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
   variable: "--font-instrument-sans",
   subsets: ["latin"],
});

export const metadata: Metadata = {
   title: "MyDotCalendar - Your Year, One Dot at a Time",
   description:
      "Generate dynamic wallpapers that visualize your year as a grid of dots. Watch your progress through the year with a beautiful, mindful calendar wallpaper.",
   keywords: [
      "wallpaper",
      "calendar",
      "year tracker",
      "productivity",
      "macbook wallpaper",
   ],
   authors: [{ name: "MyDotCalendar" }],
   openGraph: {
      title: "MyDotCalendar - Your Year, One Dot at a Time",
      description:
         "Generate dynamic wallpapers that visualize your year as a grid of dots.",
      type: "website",
   },
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en" className="dark">
         <body
            className={`${instrumentSans.variable} font-[family-name:var(--font-instrument-sans)] antialiased bg-zinc-950`}
         >
            {children}
         </body>
      </html>
   );
}
