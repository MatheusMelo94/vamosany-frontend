import type { Metadata } from "next";
import type { JSX, ReactNode } from "react";
import "./globals.css";
import { env } from "@/lib/env";
import { courierPrime, montserrat } from "@/lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: "Vamos a NY — New York itineraries, planned to the block",
  description:
    "Day-by-day New York itineraries written on foot, not from a spreadsheet. Download the PDF and the offline map, and walk out of the subway knowing exactly where you are going.",
};

type Props = { children: ReactNode };

export default function RootLayout({ children }: Props): JSX.Element {
  return (
    <html
      lang="en"
      className={`${courierPrime.variable} ${montserrat.variable}`}
    >
      <head>
        {/* Runs before first paint: opts the page into scroll motion only
            when JS is available and motion is not reduced. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('gsap')}}catch(e){}",
          }}
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
