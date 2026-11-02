import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { render, screen, within } from "@testing-library/react";
import { Footer } from "@/components/layout/footer";

const ROOT = path.resolve(__dirname, "../../..");

/** Source files under a directory, skipping tests and build output. */
function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (name === "__tests__" || name === "node_modules") return [];
    if (statSync(full).isDirectory()) return sources(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

describe("Footer › Guías column (user decision 2026-11-02, spec AC 5)", () => {
  function guiasLinks() {
    render(<Footer />);
    const column = screen.getByText("Guías", { selector: "p" }).parentElement;
    return within(column as HTMLElement).getAllByRole("link");
  }

  it('shows "Caminar por New York" instead of "Taxi, Uber o subte"', () => {
    const links = guiasLinks();
    const labels = links.map((a) => a.textContent);
    expect(labels).toContain("Caminar por New York");
    expect(labels).not.toContain("Taxi, Uber o subte");
  });

  it("keeps the column's structure: the same 8 entries, in the same order", () => {
    expect(guiasLinks().map((a) => a.textContent)).toEqual([
      "El subte, explicado",
      "Desde el aeropuerto",
      "Caminar por New York",
      "Cómo moverte por New York",
      "Visa a Estados Unidos",
      "Cuánto cuesta un día en New York",
      "Qué llevar según la temporada",
      "Entradas para Broadway",
    ]);
  });

  it("links each entry to its guide", () => {
    const hrefs = guiasLinks().map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual([
      "/guias/el-subte-explicado",
      "/guias/desde-el-aeropuerto",
      "/guias/caminar-por-new-york",
      "/guias/como-moverte-por-new-york",
      "/guias/visa-a-estados-unidos",
      "/guias/cuanto-cuesta-un-dia-en-new-york",
      "/guias/que-llevar-segun-la-temporada",
      "/guias/entradas-para-broadway",
    ]);
  });

  it("leaves the other columns' placeholder links alone", () => {
    render(<Footer />);
    const blog = screen.getByText("Blog", { selector: "p" }).parentElement;
    for (const link of within(blog as HTMLElement).getAllByRole("link")) {
      expect(link).toHaveAttribute("href", "#");
    }
  });
});

describe('"Taxi, Uber o subte" is gone from the site (spec AC 5)', () => {
  it("appears in no source file under app/, components/ or features/", () => {
    const offenders = ["app", "components", "features"]
      .flatMap((dir) => sources(path.join(ROOT, dir)))
      .filter((file) =>
        readFileSync(file, "utf8").includes("Taxi, Uber o subte"),
      );
    expect(offenders.map((f) => path.relative(ROOT, f))).toEqual([]);
  });
});
