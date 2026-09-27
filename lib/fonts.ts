import { Courier_Prime, Montserrat } from "next/font/google";

/* Font definitions, shared by the root layout and the global-error boundary
   so both use one instance: the same self-hosted files and the same hashed
   family name. Nothing here reads env or tokens, so a client boundary can
   import it. */

/** Display face: the system's mechanical / typewriter voice. */
export const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-courier-prime",
  display: "swap",
});

/** Body face (DDR-0005): one variable file covers 400, 600 and 700; upright only. */
export const montserrat = Montserrat({
  subsets: ["latin"],
  style: ["normal"],
  variable: "--font-montserrat",
  display: "swap",
});
