import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NAV, type NavGroup } from "@/components/layout/nav-config";
import { DrawerGroup } from "../drawer-group";

function group(label: string): NavGroup {
  const found = NAV.find((g) => g.label === label);
  if (!found) throw new Error(`no group ${label}`);
  return found;
}

type Overrides = Partial<{
  expanded: boolean;
  painted: boolean;
  hasCurrent: boolean;
  pathname: string;
  onToggle: () => void;
  onNavigate: () => void;
}>;

function renderGroup(label: string, o: Overrides = {}) {
  return render(
    <DrawerGroup
      group={group(label)}
      expanded={o.expanded ?? false}
      painted={o.painted}
      hasCurrent={o.hasCurrent ?? false}
      pathname={o.pathname ?? "/"}
      onToggle={o.onToggle ?? (() => undefined)}
      onNavigate={o.onNavigate ?? (() => undefined)}
    />,
  );
}

describe("DrawerGroup header (AC 6, 7, 35, 36, 37)", () => {
  it("is a button inside an h2, named by the label and described by the scent line", () => {
    renderGroup("Blog");
    const header = screen.getByRole("button", { name: "Blog" });
    expect(header.parentElement?.tagName).toBe("H2");
    expect(header).toHaveAccessibleDescription("Categorías");
    expect(
      screen.getByRole("heading", { level: 2, name: "Blog" }),
    ).toContainElement(header);
  });

  it("points aria-controls at its body and reflects the expanded state", () => {
    const { rerender } = renderGroup("Guías");
    const header = screen.getByRole("button", { name: "Guías" });
    expect(header).toHaveAttribute("aria-expanded", "false");
    const body = document.getElementById(
      header.getAttribute("aria-controls") ?? "",
    );
    expect(body).toHaveAttribute("data-drawer-body");
    expect(body).not.toBeVisible();
    rerender(
      <DrawerGroup
        group={group("Guías")}
        expanded
        hasCurrent={false}
        pathname="/"
        onToggle={() => undefined}
        onNavigate={() => undefined}
      />,
    );
    expect(header).toHaveAttribute("aria-expanded", "true");
    expect(body).toBeVisible();
  });

  it("hides the chevron from assistive tech and marks it for the gated transition", () => {
    renderGroup("Blog");
    const chevron = screen
      .getByRole("button", { name: "Blog" })
      .querySelector("[data-drawer-chevron]");
    expect(chevron).toHaveAttribute("aria-hidden", "true");
  });

  it("calls onToggle on a click, on Enter and on Space, and keeps focus on the header", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderGroup("Servicios", { onToggle });
    const header = screen.getByRole("button", { name: "Servicios" });
    await user.click(header);
    header.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onToggle).toHaveBeenCalledTimes(3);
    expect(header).toHaveFocus();
  });
});

describe("DrawerGroup header dot (AC 22, 23, 37)", () => {
  it("shows an aria-hidden dot after the label when the group holds the current page", () => {
    renderGroup("Sobre mí", { hasCurrent: true, pathname: "/contacto" });
    const header = screen.getByRole("button", { name: "Sobre mí" });
    const dot = header.querySelector("[data-header-dot]");
    expect(dot).toHaveAttribute("aria-hidden", "true");
  });

  it("keeps the dot while the group is collapsed (S4)", () => {
    renderGroup("Sobre mí", {
      hasCurrent: true,
      expanded: false,
      pathname: "/contacto",
    });
    expect(
      screen
        .getByRole("button", { name: "Sobre mí" })
        .querySelector("[data-header-dot]"),
    ).not.toBeNull();
  });

  it("shows no dot otherwise", () => {
    renderGroup("Sobre mí");
    expect(document.querySelector("[data-header-dot]")).toBeNull();
  });
});

describe("DrawerGroup body (AC 12, 15–18, 21, 36, 37)", () => {
  it.each(NAV.map((g) => g.label))(
    "%s: h3 column headings, then its items as links, in config order",
    (label) => {
      renderGroup(label, { expanded: true });
      const body = document.querySelector("[data-drawer-body]") as HTMLElement;
      const g = group(label);
      expect(
        within(body)
          .getAllByRole("heading", { level: 3 })
          .map((h) => h.textContent),
      ).toEqual(g.columns.map((c) => c.heading));
      expect(
        within(body)
          .getAllByRole("link")
          .map((a) => a.querySelector("[data-row-title]")?.textContent),
      ).toEqual(g.columns.flatMap((c) => c.items.map((i) => i.title)));
      for (const list of within(body).getAllByRole("list")) {
        expect(list.previousElementSibling?.tagName).toBe("H3");
      }
    },
  );

  it("renders each row's title and no blurb", () => {
    for (const g of NAV) {
      const { unmount } = renderGroup(g.label, { expanded: true });
      for (const link of screen.getAllByRole("link")) {
        expect(link.querySelector("[data-row-title]")).not.toBeNull();
      }
      for (const item of g.columns.flatMap((c) => c.items)) {
        expect(screen.queryByText(item.blurb)).toBeNull();
      }
      unmount();
    }
  });

  it("puts the one tag on exactly its row", () => {
    const tagged: Array<[string, string]> = [];
    for (const g of NAV) {
      const { unmount } = renderGroup(g.label, { expanded: true });
      for (const link of screen.getAllByRole("link")) {
        const tag = link.querySelector("[data-row-tag]");
        if (!tag) continue;
        tagged.push([
          link.querySelector("[data-row-title]")?.textContent ?? "",
          tag.textContent ?? "",
        ]);
      }
      unmount();
    }
    expect(tagged).toEqual([["Itinerario personalizado", "El más completo"]]);
  });

  it("shows Services' four prices, pointing at /#services", () => {
    renderGroup("Servicios", { expanded: true });
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(4);
    expect(
      links.map((a) => a.querySelector("[data-row-price]")?.textContent),
    ).toEqual(["USD 150", "Desde USD 160", "Reservá con USD 300", "USD 70"]);
    for (const a of links) {
      expect(a).toHaveAttribute("href", "/#services");
    }
  });

  it("marks only the current row, with aria-current and a static dot after the price", () => {
    renderGroup("Sobre mí", {
      expanded: true,
      hasCurrent: true,
      pathname: "/colaboraciones",
    });
    const current = document.querySelectorAll("[aria-current]");
    expect(current).toHaveLength(1);
    const row = screen.getByRole("link", { name: "Colaboraciones" });
    expect(row).toHaveAttribute("aria-current", "page");
    const dot = row.querySelector("[data-current-dot]");
    expect(dot).toHaveAttribute("aria-hidden", "true");
    expect(row.lastElementChild).toContainElement(dot as HTMLElement);
  });

  it("closes the drawer through onNavigate when a row is tapped", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    renderGroup("Sobre mí", { expanded: true, onNavigate });
    await user.click(screen.getByRole("link", { name: "Contacto" }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});

describe("DrawerGroup body motion hooks (M11–M12; ADR-0009; plan § 7.4)", () => {
  const bodyEl = () =>
    document.querySelector("[data-drawer-body]") as HTMLElement;

  it("paints the body only while expanded by default", () => {
    renderGroup("Guías");
    expect(bodyEl()).toHaveAttribute("hidden");
  });

  it("keeps a collapsing body painted but inert: its links leave the tab order at once", () => {
    renderGroup("Guías", { expanded: false, painted: true });
    expect(bodyEl()).not.toHaveAttribute("hidden");
    expect(bodyEl()).toHaveAttribute("inert");
    expect(screen.getByRole("button", { name: "Guías" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("an expanded body is neither hidden nor inert", () => {
    renderGroup("Guías", { expanded: true, painted: true });
    expect(bodyEl()).not.toHaveAttribute("hidden");
    expect(bodyEl()).not.toHaveAttribute("inert");
  });
});
