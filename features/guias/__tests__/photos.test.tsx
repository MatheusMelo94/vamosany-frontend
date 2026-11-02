import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { render } from "@testing-library/react";
import { Footer } from "@/components/layout/footer";
import { GUIDE_SLUGS } from "@/features/guias/content/slugs";
import {
  GUIDE_PHOTOS,
  PHOTOS,
  creditLine,
} from "@/features/guias/content/photos";

const PUBLIC_IMG = path.resolve(__dirname, "../../../public/img");

type CreditEntry = { file: string; author: string; license: string };
const CREDITS: CreditEntry[] = JSON.parse(
  readFileSync(path.join(PUBLIC_IMG, "CREDITS.json"), "utf8"),
);

/** Spec § Photos mapping: guide -> file and focal point. */
const MAPPING = [
  ["el-subte-explicado", "how-subway.webp", "50% 45%"],
  ["desde-el-aeropuerto", "quote-street.webp", "50% 45%"],
  ["caminar-por-new-york", "trip-high-line.webp", "50% 55%"],
  ["como-moverte-por-new-york", "post-dumbo.webp", "50% 60%"],
  ["west-village", "trip-soho.webp", "50% 40%"],
  ["murray-hill", "trip-grand-central.webp", "50% 40%"],
  ["financial-district", "band-bridges.webp", "85% 50%"],
  ["williamsburg", "band-bridges.webp", "45% 50%"],
  ["visa-a-estados-unidos", "ring/vamosany6.webp", "50% 55%"],
  ["cuanto-cuesta-un-dia-en-new-york", "trip-chinatown.webp", "50% 55%"],
  ["que-llevar-segun-la-temporada", "trip-central-park.webp", "50% 50%"],
  ["entradas-para-broadway", "ring/vamosany3.webp", "50% 50%"],
] as const;

describe("GUIDE_PHOTOS (spec § Photos, AC 29)", () => {
  it.each(MAPPING)("%s uses %s at %s", (slug, file, focal) => {
    const use = GUIDE_PHOTOS[slug];
    expect(PHOTOS[use.photo]?.file).toBe(file);
    expect(use.focal).toBe(focal);
  });

  it("covers every guide", () => {
    expect(Object.keys(GUIDE_PHOTOS).sort()).toEqual([...GUIDE_SLUGS].sort());
  });

  it("band-bridges serves two guides with different focal points", () => {
    const uses = GUIDE_SLUGS.filter(
      (slug) => PHOTOS[GUIDE_PHOTOS[slug].photo]?.file === "band-bridges.webp",
    );
    expect(uses).toEqual(["financial-district", "williamsburg"]);
    const focals = uses.map((slug) => GUIDE_PHOTOS[slug].focal);
    expect(new Set(focals).size).toBe(2);
  });

  it("never references a hero-* file", () => {
    for (const photo of Object.values(PHOTOS)) {
      expect(photo.file).not.toMatch(/(^|\/)hero-/);
    }
  });

  it("every registered file exists under public/img", () => {
    for (const photo of Object.values(PHOTOS)) {
      expect(existsSync(path.join(PUBLIC_IMG, photo.file)), photo.file).toBe(
        true,
      );
    }
  });

  it("has a descriptive Spanish alt that does not start with 'Foto de'", () => {
    for (const slug of GUIDE_SLUGS) {
      const { alt } = GUIDE_PHOTOS[slug];
      expect(alt.trim().length, slug).toBeGreaterThan(20);
      expect(alt, slug).not.toMatch(/^foto de/i);
    }
  });
});

describe("creditLine (AC 14)", () => {
  it("reads 'Foto: <Subject> — <Author>, <License>' with the footer's strings", () => {
    expect(creditLine("el-subte-explicado")).toBe(
      "Foto: Subte de Union Square — TLK in 3, CC BY-SA 3.0",
    );
    expect(creditLine("desde-el-aeropuerto")).toBe(
      "Foto: Taxi amarillo después de la nieve — Corentin Villemeur, CC BY-SA 4.0",
    );
  });

  it("uses the footer's casing: 'Dominio público' (plan D-12)", () => {
    expect(creditLine("cuanto-cuesta-un-dia-en-new-york")).toBe(
      "Foto: Chinatown, Manhattan — Derek Jensen, Dominio público",
    );
  });

  it("credits the two brand photos to Vamos a NY", () => {
    expect(creditLine("visa-a-estados-unidos")).toBe("Foto: Vamos a NY");
    expect(creditLine("entradas-para-broadway")).toBe("Foto: Vamos a NY");
  });

  it("both Financial District and Williamsburg credit the same bridges photo", () => {
    expect(creditLine("financial-district")).toBe(creditLine("williamsburg"));
  });
});

describe("credits against CREDITS.json and the footer (AC 30, plan D-8)", () => {
  const wikimedia = Object.values(PHOTOS).filter((p) => p.kind === "wikimedia");
  const { container } = render(<Footer />);
  const footerText = container.textContent ?? "";

  it("uses 9 Wikimedia photos and 2 brand photos", () => {
    expect(wikimedia).toHaveLength(9);
    expect(
      Object.values(PHOTOS).filter((p) => p.kind === "brand"),
    ).toHaveLength(2);
  });

  it.each(wikimedia.map((p) => [p.file, p] as const))(
    "%s has a CREDITS.json entry with a compatible author and license",
    (_file, photo) => {
      const entry = CREDITS.find((c) => c.file === photo.file);
      expect(entry, `CREDITS.json entry for ${photo.file}`).toBeDefined();
      expect(entry?.author.toLowerCase()).toContain(photo.author.toLowerCase());
      const license =
        photo.license === "Dominio público" ? "Public domain" : photo.license;
      expect(entry?.license).toBe(license);
    },
  );

  it.each(wikimedia.map((p) => [p.file, p] as const))(
    "%s has its line in the rendered footer",
    (_file, photo) => {
      expect(footerText).toContain(
        `${photo.subject} — ${photo.author}, ${photo.license}`,
      );
    },
  );
});
