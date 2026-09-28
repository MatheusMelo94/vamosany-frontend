/**
 * A width-driven matchMedia for jsdom (whose own is the always-false stub in
 * tests/setup.ts). `(min-width: Npx)` and `(max-width: Npx)` follow the fake
 * width; any other query never matches. `resize()` notifies the listeners
 * of every list whose result changed, as a browser does.
 */
export function fakeViewport(initialWidth: number) {
  let width = initialWidth;
  const lists: Array<{
    query: string;
    last: boolean;
    listeners: Set<(e: MediaQueryListEvent) => void>;
  }> = [];

  const evaluate = (query: string): boolean => {
    const min = /\(min-width:\s*([\d.]+)px\)/.exec(query);
    const max = /\(max-width:\s*([\d.]+)px\)/.exec(query);
    if (!min && !max) return false;
    return (
      (!min || width >= Number(min[1])) && (!max || width <= Number(max[1]))
    );
  };

  const spy = vi
    .spyOn(window, "matchMedia")
    .mockImplementation((query: string): MediaQueryList => {
      const entry = {
        query,
        last: evaluate(query),
        listeners: new Set<(e: MediaQueryListEvent) => void>(),
      };
      lists.push(entry);
      const add = (_: string, fn: EventListenerOrEventListenerObject) =>
        entry.listeners.add(fn as (e: MediaQueryListEvent) => void);
      const remove = (_: string, fn: EventListenerOrEventListenerObject) =>
        entry.listeners.delete(fn as (e: MediaQueryListEvent) => void);
      return {
        get matches() {
          return evaluate(query);
        },
        media: query,
        onchange: null,
        addListener: (fn) => fn && add("change", fn as EventListener),
        removeListener: (fn) => fn && remove("change", fn as EventListener),
        addEventListener: add,
        removeEventListener: remove,
        dispatchEvent: () => false,
      } as MediaQueryList;
    });

  return {
    resize(next: number) {
      width = next;
      for (const entry of lists) {
        const now = evaluate(entry.query);
        if (now === entry.last) continue;
        entry.last = now;
        const event = {
          matches: now,
          media: entry.query,
        } as MediaQueryListEvent;
        for (const fn of entry.listeners) fn(event);
      }
    },
    restore: () => spy.mockRestore(),
  };
}
