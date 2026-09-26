import type { JSX } from "react";
import { ClosingRow } from "@/features/sobre-mi/components/closing-row";
import { PageHeader } from "@/features/sobre-mi/components/page-header";
import { ProductLedger } from "@/features/sobre-mi/components/product-ledger";
import { RichText } from "@/features/sobre-mi/components/rich-text";
import { COLABORACIONES } from "@/features/sobre-mi/content/colaboraciones";

/** /colaboraciones (spec § Page 2): the product ledger and its closing row. */
export function ColaboracionesPage(): JSX.Element {
  const { header, rows, closing } = COLABORACIONES;
  return (
    <div className="container-ds pb-16">
      <PageHeader {...header} />
      <ProductLedger rows={rows} />
      <ClosingRow
        headline={closing.headline}
        text={<RichText text={closing.text} />}
        primary={closing.primary}
        secondary={closing.secondary}
      />
    </div>
  );
}
