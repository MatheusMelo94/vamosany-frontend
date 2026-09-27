import { renderToStaticMarkup } from "react-dom/server";
import GlobalError from "@/app/global-error";

// The next/font instance as the build emits it: a scoped family plus its
// metric-adjusted fallback face (names are illustrative).
vi.mock("next/font/google", () => {
  const font = (family: string) => () => ({
    className: "",
    variable: "",
    style: { fontFamily: `'${family}', '${family} Fallback'` },
  });
  return {
    Courier_Prime: font("Courier Prime"),
    Montserrat: font("Montserrat"),
  };
});

function bodyOf(markup: string): HTMLElement {
  const doc = new DOMParser().parseFromString(markup, "text/html");
  return doc.body;
}

describe("GlobalError", () => {
  it("renders body text in the Montserrat instance, with Arial as the fallback (DDR-0005)", () => {
    const body = bodyOf(
      renderToStaticMarkup(
        <GlobalError error={new Error("boom")} reset={() => {}} />,
      ),
    );
    expect(body.style.fontFamily).toBe(
      '"Montserrat", "Montserrat Fallback", Arial, sans-serif',
    );
  });

  it("does not depend on the design tokens (no CSS variables in the family)", () => {
    const body = bodyOf(
      renderToStaticMarkup(
        <GlobalError error={new Error("boom")} reset={() => {}} />,
      ),
    );
    expect(body.getAttribute("style")).not.toContain("var(");
  });
});
