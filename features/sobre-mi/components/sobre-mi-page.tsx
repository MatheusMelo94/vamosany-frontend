import type { JSX } from "react";
import { PageHeader } from "@/features/sobre-mi/components/page-header";

/** /sobre-mi (spec § Page 1). Header only; the body lands in T017. */
export function SobreMiPage(): JSX.Element {
  return (
    <div className="container-ds">
      <PageHeader
        label={["Sobre mí", "Montevideo → New York", "+20 visitas"]}
        title="Sobre mí"
        dek="Soy Belén, comunicadora, estratega digital y, sobre todo, una persona profundamente enamorada de New York."
      />
    </div>
  );
}
