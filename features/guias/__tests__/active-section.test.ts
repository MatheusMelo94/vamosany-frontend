import { activeSectionId } from "@/features/guias/lib/active-section";

const LINE = 120;
const tops = (...values: number[]) =>
  values.map((top, i) => ({ id: `s${i + 1}`, top }));

/** Spec § Motion Intent: the last section whose heading has passed the 120px line (AC 22, 26). */
describe("activeSectionId", () => {
  it("returns null with no sections", () => {
    expect(
      activeSectionId({ tops: [], line: LINE, atBottom: false }),
    ).toBeNull();
    expect(
      activeSectionId({ tops: [], line: LINE, atBottom: true }),
    ).toBeNull();
  });

  it("activates the first section above the first H2 (page top)", () => {
    expect(
      activeSectionId({
        tops: tops(600, 1200, 1800),
        line: LINE,
        atBottom: false,
      }),
    ).toBe("s1");
  });

  it("activates the last heading above the line, between two headings", () => {
    expect(
      activeSectionId({
        tops: tops(-900, -200, 400, 900),
        line: LINE,
        atBottom: false,
      }),
    ).toBe("s2");
  });

  it("activates a heading exactly on the line", () => {
    expect(
      activeSectionId({
        tops: tops(-500, 120, 700),
        line: LINE,
        atBottom: false,
      }),
    ).toBe("s2");
  });

  it("does not activate a heading one pixel below the line", () => {
    expect(
      activeSectionId({
        tops: tops(-500, 121, 700),
        line: LINE,
        atBottom: false,
      }),
    ).toBe("s1");
  });

  it("activates the last section at the bottom even if its heading never reaches the line", () => {
    expect(
      activeSectionId({
        tops: tops(-900, -300, 300),
        line: LINE,
        atBottom: true,
      }),
    ).toBe("s3");
  });

  it("does not depend on the document hash: it only reads geometry (AC 26)", () => {
    const input = { tops: tops(500, 1000), line: LINE, atBottom: false };
    expect(activeSectionId(input)).toBe("s1");
  });
});
