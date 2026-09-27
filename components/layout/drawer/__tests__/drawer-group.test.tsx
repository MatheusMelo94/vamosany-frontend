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
      hasCurrent={o.hasCurrent ?? false}
      pathname={o.pathname ?? "/"}
      onToggle={o.onToggle ?? (() => undefined)}
      onNavigate={o.onNavigate ?? (() => undefined)}
    />,
  );
}

describe("DrawerGroup header (AC 6, 7, 35, 36, 37)", () => {
  it("is a button inside an h2, named by the label and described by the scent line", () => {
    renderGroup("Itineraries");
    const header = screen.getByRole("button", { name: "Itineraries" });
    expect(header.parentElement?.tagName).toBe("H2");
    expect(header).toHaveAccessibleDescription(
      "By length · By season · By appetite",
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Itineraries" }),
    ).toContainElement(header);
  });

  it("points aria-controls at its body and reflects the expanded state", () => {
    const { rerender } = renderGroup("Guides");
    const header = screen.getByRole("button", { name: "Guides" });
    expect(header).toHaveAttribute("aria-expanded", "false");
    const body = document.getElementById(
      header.getAttribute("aria-controls") ?? "",
    );
    expect(body).toHaveAttribute("data-drawer-body");
    expect(body).not.toBeVisible();
    rerender(
      <DrawerGroup
        group={group("Guides")}
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

  it("uses the desktop menu's fonts: the label body-lg bold, the scent eyebrow ink-muted", () => {
    renderGroup("Blog");
    const header = screen.getByRole("button", { name: "Blog" });
    expect(within(header).getByText("Blog")).toHaveClass(
      "body-lg",
      "font-bold",
      "text-ink",
    );
    expect(within(header).getByText("Latest · Readers")).toHaveClass(
      "eyebrow",
      "text-ink-muted",
    );
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
    renderGroup("Services", { onToggle });
    const header = screen.getByRole("button", { name: "Services" });
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
    expect(dot).toHaveClass("bg-brand", "size-1.5", "rounded-full");
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
      for (const h of within(body).getAllByRole("heading", { level: 3 })) {
        expect(h).toHaveClass("eyebrow", "text-ink-muted");
      }
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

  it("renders rows ≥44px with the title in body-sm semibold ink and no blurb", () => {
    for (const g of NAV) {
      const { unmount } = renderGroup(g.label, { expanded: true });
      for (const link of screen.getAllByRole("link")) {
        expect(link).toHaveClass("min-h-11", "border-b", "border-surface-1");
        expect(link.querySelector("[data-row-title]")).toHaveClass(
          "body-sm",
          "font-semibold",
          "text-ink",
        );
      }
      for (const item of g.columns.flatMap((c) => c.items)) {
        expect(screen.queryByText(item.blurb)).toBeNull();
      }
      unmount();
    }
  });

  it("puts the three tags on exactly their rows, as yellow pills", () => {
    const tagged: Array<[string, string]> = [];
    for (const g of NAV) {
      const { unmount } = renderGroup(g.label, { expanded: true });
      for (const link of screen.getAllByRole("link")) {
        const tag = link.querySelector("[data-row-tag]");
        if (!tag) continue;
        expect(tag).toHaveClass("caption", "bg-brand", "rounded-full");
        tagged.push([
          link.querySelector("[data-row-title]")?.textContent ?? "",
          tag.textContent ?? "",
        ]);
      }
      unmount();
    }
    expect(tagged).toEqual([
      ["5 Days — The Classic", "Best seller"],
      ["Christmas in New York", "New"],
      ["Custom itinerary with Belén", "Most popular"],
    ]);
  });

  it("shows Services' three prices in Courier bold, pointing at /#services", () => {
    renderGroup("Services", { expanded: true });
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(
      links.map((a) => a.querySelector("[data-row-price]")?.textContent),
    ).toEqual(["from €25", "€149", "€290"]);
    for (const a of links) {
      expect(a).toHaveAttribute("href", "/#services");
      expect(a.querySelector("[data-row-price]")).toHaveClass(
        "body-sm",
        "font-mono",
        "font-bold",
      );
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
