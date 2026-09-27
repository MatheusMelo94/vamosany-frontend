import { act, render } from "@testing-library/react";
import { FaqDeepLink } from "@/features/sobre-mi/components/faq-deep-link";

function Page() {
  return (
    <>
      <FaqDeepLink />
      <div id="contenido">
        <details id="footer-credits">
          <summary>Not an FAQ anchor</summary>
          <p>Credits</p>
        </details>
      </div>
      <section id="viajes-grupales" data-sm-anchor="">
        <details id="como-funcionan-los-viajes-grupales" data-sm-anchor="">
          <summary>¿Cómo funcionan los viajes grupales?</summary>
          <p>Answer</p>
        </details>
      </section>
      <details id="que-es-un-itinerario-personalizado" data-sm-anchor="">
        <summary>¿Qué es un itinerario personalizado?</summary>
        <p>Answer</p>
      </details>
    </>
  );
}

const openIds = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("details"))
    .filter((d) => d.open)
    .map((d) => d.id);

describe("FaqDeepLink (AC 48)", () => {
  let scroll: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    scroll = vi.fn();
    Element.prototype.scrollIntoView =
      scroll as unknown as Element["scrollIntoView"];
  });
  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("opens the question named by the hash and scrolls it into view", () => {
    window.history.replaceState(
      null,
      "",
      "/#que-es-un-itinerario-personalizado",
    );
    const { container } = render(<Page />);
    expect(openIds(container)).toEqual(["que-es-un-itinerario-personalizado"]);
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(scroll.mock.contexts[0]).toHaveProperty(
      "id",
      "que-es-un-itinerario-personalizado",
    );
  });

  it("aligns again after the browser's own fragment scroll ends", () => {
    window.history.replaceState(null, "", "/#viajes-grupales");
    render(<Page />);
    const before = scroll.mock.calls.length;
    act(() => {
      window.dispatchEvent(new Event("scrollend"));
    });
    expect(scroll.mock.calls.length).toBe(before + 1);
    act(() => {
      window.dispatchEvent(new Event("scrollend"));
    });
    expect(scroll.mock.calls.length).toBe(before + 1);
  });

  it("scrolls to a group without opening anything", () => {
    window.history.replaceState(null, "", "/#viajes-grupales");
    const { container } = render(<Page />);
    expect(openIds(container)).toEqual([]);
    expect(scroll.mock.contexts[0]).toHaveProperty("id", "viajes-grupales");
  });

  it("leaves everything closed and unscrolled for an unknown or hostile hash", () => {
    for (const hash of ["#no-existe", '#"><img src=x onerror=alert(1)>', "#"]) {
      window.history.replaceState(null, "", `/${hash}`);
      const { container, unmount } = render(<Page />);
      expect(openIds(container)).toEqual([]);
      expect(container.querySelector("img")).toBeNull();
      unmount();
    }
    expect(scroll).not.toHaveBeenCalled();
  });

  it("follows later hash changes on the same page", () => {
    const { container } = render(<Page />);
    act(() => {
      window.history.replaceState(
        null,
        "",
        "/#como-funcionan-los-viajes-grupales",
      );
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(openIds(container)).toEqual(["como-funcionan-los-viajes-grupales"]);
  });

  it("renders nothing", () => {
    const { container } = render(<FaqDeepLink />);
    expect(container).toBeEmptyDOMElement();
  });

  it("ignores ids that aren't FAQ anchors (G2 finding 0013)", () => {
    for (const hash of ["#contenido", "#footer-credits"]) {
      window.history.replaceState(null, "", `/${hash}`);
      const { container, unmount } = render(<Page />);
      expect(openIds(container)).toEqual([]);
      unmount();
    }
    expect(scroll).not.toHaveBeenCalled();
  });

  it("survives a malformed percent-escape and an oversized hash (G2 finding 0014, R-04)", () => {
    for (const hash of [
      "#%E0%A4%A",
      "#" + "a".repeat(5 * 1024),
      "#" + "que-es-un-itinerario-personalizado".repeat(200),
    ]) {
      window.history.replaceState(null, "", `/${hash}`);
      expect(() => {
        const { unmount } = render(<Page />);
        unmount();
      }).not.toThrow();
    }
    expect(scroll).not.toHaveBeenCalled();
  });
});
