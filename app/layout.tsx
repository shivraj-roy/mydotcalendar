import type { Metadata } from "next";
import Script from "next/script";
import { Instrument_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { PostHogProvider } from "./providers";
import "./globals.css";

const instrumentSans = Instrument_Sans({
   variable: "--font-instrument-sans",
   subsets: ["latin"],
});

export const metadata: Metadata = {
   title: "Dot Cal",
   description:
      "Track your year, goals, and journeys with beautiful minimal calendars. Generate dynamic wallpapers that visualize your year, goals, and journeys as a grid of dots. Updates automatically daily.",
   keywords: [
      "wallpaper",
      "calendar",
      "dot cal",
      "dot calendar",
      "year tracker",
      "productivity",
      "macbook wallpaper",
      "dynamic wallpaper",
      "goal tracker",
      "journey calendar",
      "life calendar",
      "minimal wallpaper",
   ],
   authors: [{ name: "Shivraj Roy" }],
   creator: "Shivraj Roy",
   publisher: "Shivraj Roy",
   metadataBase: new URL("https://www.dotcal.in"),
   alternates: {
      canonical: "/",
   },
   openGraph: {
      title: "Dot Cal | Track your year, goals, and journeys.",
      description:
         "Minimal wallpaper to track your year, goals, and journeys. Create dynamic dot‑grid wallpapers that auto-updates daily to visualize your progress.",
      type: "website",
      url: "https://www.dotcal.in",
      siteName: "Dot Cal",
      images: [
         {
            url: "/assets/images/og-image.png",
            width: 1200,
            height: 630,
            alt: "My Dot Calendar • Minimal wallpaper to track your year, goals, and journeys.",
         },
      ],
      locale: "en_US",
   },
   twitter: {
      card: "summary_large_image",
      title: "Dot Cal | Track your year, goals, and journeys.",
      description:
         "Minimal wallpaper to track your year, goals, and journeys. Create dynamic dot-grid wallpapers that auto-update daily to visualize your progress.",
      images: ["/assets/images/og-image.png"],
   },
   icons: {
      icon: [
         { url: "/assets/images/icon.png", sizes: "any" },
         { url: "/assets/images/favicon.ico", sizes: "any" },
      ],
      apple: [
         {
            url: "/assets/images/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
         },
      ],
      other: [
         {
            rel: "mask-icon",
            url: "/assets/images/safari-pinned-tab.svg",
            color: "#ff6347",
         },
      ],
   },
   manifest: "/manifest.json",
   appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "Dot Cal",
   },
   viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 1,
   },
   themeColor: [
      { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
      { media: "(prefers-color-scheme: light)", color: "#ffffff" },
   ],
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
            {/* Google Analytics */}
            <Script
               src="https://www.googletagmanager.com/gtag/js?id=G-DBW3C7ZH6S"
               strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
               {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-DBW3C7ZH6S');
               `}
            </Script>

            {/* Microsoft Clarity */}
            <Script id="microsoft-clarity" strategy="afterInteractive">
               {`
                  (function(c,l,a,r,i,t,y){
                     c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                     t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                     y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                  })(window, document, "clarity", "script", "vaimrre0nh");
               `}
            </Script>

            <PostHogProvider>{children}</PostHogProvider>

            <Analytics />
         </body>
      </html>
   );
}
