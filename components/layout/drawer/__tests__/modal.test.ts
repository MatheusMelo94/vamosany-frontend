import { inertOutside } from "../modal";

/** The navbar's shape: the burger in the capsule; veil and panel beside it. */
function page(): Record<string, HTMLElement> {
  document.body.innerHTML = `
    <header id="header">
      <nav id="capsule">
        <a id="logo" href="/">logo</a>
        <div id="desktop"><button>Itineraries</button></div>
        <button id="burger">menu</button>
      </nav>
      <div id="veil"></div>
      <nav id="panel"><a href="/sobre-mi">Sobre mí</a></nav>
    </header>
    <main id="main"><a href="/x">x</a></main>
    <footer id="footer"></footer>
    <div id="dialog" inert></div>
  `;
  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>("[id]")].map((el) => [
      el.id,
      el,
    ]),
  );
}

describe("inertOutside (plan § 8, AC 34)", () => {
  it("makes every sibling that holds no kept element inert, up to <body>", () => {
    const el = page();
    inertOutside([el.burger!, el.veil!, el.panel!]);
    for (const id of ["logo", "desktop", "main", "footer"]) {
      expect(el[id], id).toHaveAttribute("inert");
    }
    for (const id of ["header", "capsule", "burger", "veil", "panel"]) {
      expect(el[id], id).not.toHaveAttribute("inert");
    }
  });

  it("restores only what it set: an element that was already inert stays inert", () => {
    const el = page();
    const restore = inertOutside([el.burger!, el.veil!, el.panel!]);
    restore();
    expect(document.querySelectorAll("[inert]")).toHaveLength(1);
    expect(el.dialog).toHaveAttribute("inert");
  });

  it("does not touch <html>'s other children (head)", () => {
    const el = page();
    const restore = inertOutside([el.burger!, el.veil!, el.panel!]);
    expect(document.head).not.toHaveAttribute("inert");
    expect(document.body).not.toHaveAttribute("inert");
    restore();
  });
});
