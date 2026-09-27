import { fireEvent, render } from "@testing-library/react";
import { gsap } from "@/lib/gsap";
import { MOTION } from "@/lib/motion";
import { NavMarker } from "@/components/layout/nav-marker";

/**
 * jsdom has no layout: boxes are given through `data-rect="left,top,width,height"`
 * (panel-relative). The marker's own root is panel-sized at the origin.
 */
function mockLayout() {
  return vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockImplementation(function (this: HTMLElement) {
      const [left = 0, top = 0, width = 0, height = 0] = (
        this.dataset.rect ??
        (this.hasAttribute("data-nav-marker") ? "0,0,900,400" : "0,0,0,0")
      )
        .split(",")
        .map(Number);
      return {
        left,
        top,
        width,
        height,
        right: left + width,
        bottom: top + height,
        x: left,
        y: top,
        toJSON: () => ({}),
      } as DOMRect;
    });
}

function Panel({ current }: { current?: number }) {
  const rects = ["32,40,300,70", "32,120,300,70", "372,40,300,70"];
  return (
    <div data-testid="panel">
      <NavMarker />
      <ul>
        {rects.map((rect, i) => (
          <li key={rect}>
            <a
              href={`/item-${i}`}
              data-nav-item
              data-rect={rect}
              aria-current={current === i ? "page" : undefined}
            >
              Item {i}
            </a>
          </li>
        ))}
      </ul>
      <p data-rect="32,300,300,20">Not an item</p>
    </div>
  );
}

const dotOf = (container: HTMLElement) => {
  const dot = container.querySelector<HTMLElement>("[data-marker-dot]");
  if (!dot) throw new Error("no dot");
  return dot;
};

/** Where the dot sits on an item: 24px in from its right edge, 15px down. */
const dotTarget = (left: number, top: number, width: number) => ({
  x: left + width - MOTION.menuMarker.dotOffset.right,
  y: top + MOTION.menuMarker.dotOffset.top,
});

const position = (el: HTMLElement) => ({
  x: Number(gsap.getProperty(el, "x")),
  y: Number(gsap.getProperty(el, "y")),
});

describe("NavMarker", () => {
  let layout: ReturnType<typeof mockLayout>;
  beforeEach(() => {
    layout = mockLayout();
  });
  afterEach(() => {
    layout.mockRestore();
  });

  it("renders a single decorative highlight and dot", () => {
    const { container } = render(<Panel />);
    const root = container.querySelector("[data-nav-marker]");
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll("[data-marker-layer]")).toHaveLength(1);
    expect(container.querySelectorAll("[data-marker-dot]")).toHaveLength(1);
  });

  it("marks its panel ready, and unmarks it on unmount", () => {
    const { getByTestId, unmount } = render(<Panel />);
    expect(getByTestId("panel")).toHaveAttribute("data-marker-ready");
    const panel = getByTestId("panel");
    unmount();
    expect(panel).not.toHaveAttribute("data-marker-ready");
  });

  it("places itself on the aria-current item on open, already visible (AC 5)", () => {
    const { container } = render(<Panel current={1} />);
    const dot = dotOf(container);
    expect(position(dot)).toEqual(dotTarget(32, 120, 300));
    expect(dot.style.opacity).toBe("1");
  });

  it("stays hidden until the first item is hovered when no item is current", () => {
    const { container, getByText } = render(<Panel />);
    const dot = dotOf(container);
    expect(dot.style.opacity).not.toBe("1");
    fireEvent.pointerOver(getByText("Item 2"));
    expect(position(dot)).toEqual(dotTarget(372, 40, 300));
    expect(dot.style.opacity).toBe("1");
  });

  it("follows keyboard focus", () => {
    const { container, getByText } = render(<Panel />);
    fireEvent.focusIn(getByText("Item 0"));
    expect(position(dotOf(container))).toEqual(dotTarget(32, 40, 300));
  });

  it("jumps with no travel when motion is off (AC 8, reduced)", () => {
    const { container, getByText } = render(<Panel current={0} />);
    fireEvent.pointerOver(getByText("Item 2"));
    const dot = dotOf(container);
    expect(position(dot)).toEqual(dotTarget(372, 40, 300));
    expect(gsap.getTweensOf(dot)).toHaveLength(0);
  });

  it("returns to the current item when the pointer leaves the items (AC 6)", () => {
    const { container, getByText } = render(<Panel current={1} />);
    fireEvent.pointerOver(getByText("Item 2"));
    fireEvent.pointerOut(getByText("Item 2"), {
      relatedTarget: getByText("Not an item"),
    });
    expect(position(dotOf(container))).toEqual(dotTarget(32, 120, 300));
  });

  it("stays on the last item when there is no current item", () => {
    const { container, getByText } = render(<Panel />);
    fireEvent.pointerOver(getByText("Item 2"));
    fireEvent.pointerOut(getByText("Item 2"), {
      relatedTarget: getByText("Not an item"),
    });
    expect(position(dotOf(container))).toEqual(dotTarget(372, 40, 300));
  });

  describe("with motion on (.gsap)", () => {
    beforeEach(() => document.documentElement.classList.add("gsap"));
    afterEach(() => document.documentElement.classList.remove("gsap"));

    it("tweens the dot to a new item instead of jumping", () => {
      const { container, getByText } = render(<Panel current={0} />);
      const dot = dotOf(container);
      fireEvent.pointerOver(getByText("Item 2"));
      // Queued tweens (not yet ticked), and no jump.
      expect(gsap.getTweensOf(dot).length).toBeGreaterThan(0);
      expect(position(dot)).toEqual(dotTarget(32, 40, 300));
      gsap.getTweensOf(dot).forEach((t) => t.progress(1));
      expect(position(dot)).toEqual(dotTarget(372, 40, 300));
    });
  });
});
