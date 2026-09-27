import type { JSX, ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

type Props = { children: ReactNode };

/**
 * Shell of the Sobre mí pages ("Cuaderno de campo"): the site navbar and
 * footer around a Spanish <main> (spec § Locale Behavior: the root is
 * lang="en" until i18n routing lands). The landing keeps its own shell.
 */
export default function CuadernoLayout({ children }: Props): JSX.Element {
  return (
    <>
      <Navbar />
      {/* Named "screen" container: page-width container queries, as in the
          approved mockup (e.g. audience rows at 760px, spec § Responsive). */}
      <main lang="es" id="contenido" className="@container/screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
