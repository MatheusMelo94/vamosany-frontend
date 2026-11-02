import type { JSX, ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

type Props = { children: ReactNode };

/**
 * Shell of the Guías pages: the site navbar and footer around a Spanish
 * <main>. Same shell as the Sobre mí pages, in its own route group because the
 * two families diverge (Guías get an aside and no template.tsx; plan D-1).
 * The named "screen" container drives the page-width container queries
 * (@guide-facts, @guide-aside, @guide-cards).
 */
export default function GuiasLayout({ children }: Props): JSX.Element {
  return (
    <>
      <Navbar />
      <main lang="es" id="contenido" className="@container/screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
