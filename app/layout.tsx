import type { Metadata } from "next";
import { Courier_Prime } from "next/font/google";
import "./globals.css";

/* Display face for the system's mechanical / typewriter voice.
   Body type is Arial per the spec, so no second webfont. */
const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-courier-prime",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vamosany.example.com"),
  title: "Vamos a NY — New York itineraries, planned to the block",
  description:
    "Day-by-day New York itineraries written on foot, not from a spreadsheet. Download the PDF and the offline map, and walk out of the subway knowing exactly where you are going.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={courierPrime.variable}>
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
