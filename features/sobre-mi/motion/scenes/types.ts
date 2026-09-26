import type { gsap } from "@/lib/gsap";

/** What every scene gets: its page root and the brand eases. */
export type SceneContext = {
  /** The page root carrying `data-sm-scene`; scenes select inside it only. */
  root: HTMLElement;
  eases: { ds: gsap.EaseFunction; arrive: gsap.EaseFunction };
  /** Wraps a deferred callback so its tweens revert with the controller. */
  contextSafe: <T extends (...args: never[]) => unknown>(fn: T) => T;
};

/** A scene may return a cleanup for anything GSAP doesn't revert (DOM it added, listeners). */
export type Scene = (context: SceneContext) => void | (() => void);
