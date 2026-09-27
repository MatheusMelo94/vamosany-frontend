import type { JSX } from "react";
import Link from "next/link";
import { GlobeIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { Lang } from "@/components/layout/nav-config";
import { FOCUS_RING } from "./drawer-group";

/** The drawer's segment order (spec § Content & Copy); the desktop keeps EN · ES · PT. */
const DRAWER_LANGS: readonly Lang[] = ["ES", "PT", "EN"];

type Props = {
  /** The drawer-scoped language (default ES), not the desktop one (plan § 5). */
  lang: Lang;
  onLang: (lang: Lang) => void;
  /** Log in or Sign up was tapped: the drawer closes and navigation proceeds. */
  onNavigate: () => void;
};

const PILL = cn(
  "body-sm flex min-h-12 items-center justify-center rounded-full px-4 font-semibold transition-colors",
  FOCUS_RING,
);

/**
 * The footer pinned inside the panel (spec § Responsive Behavior › Footer):
 * the "Idioma" segmented control, then Log in and Sign up side by side.
 */
export function DrawerFooter({ lang, onLang, onNavigate }: Props): JSX.Element {
  return (
    <div
      data-drawer-footer
      className="border-hairline bg-canvas flex flex-col gap-3 border-t px-4 pt-3 pb-4"
    >
      <div className="flex items-center gap-3">
        <GlobeIcon className="text-ink size-4 shrink-0" />
        {/* Toggle buttons, not a radio group: ES, PT and EN are each a Tab
            stop (AC 33). Each segment fills the 48px track's height (AC 39). */}
        <div
          role="group"
          aria-label="Idioma"
          className="border-hairline grid min-h-12 flex-1 grid-cols-3 rounded-full border-2"
        >
          {DRAWER_LANGS.map((code) => (
            <button
              key={code}
              type="button"
              aria-pressed={lang === code}
              onClick={() => onLang(code)}
              className={cn(
                "body-sm rounded-full font-semibold transition-colors",
                FOCUS_RING,
                lang === code ? "bg-ink text-inverse-ink" : "text-ink",
              )}
            >
              {code}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="#login"
          onClick={onNavigate}
          className={cn(PILL, "bg-ink/5 text-ink hover:bg-ink/10")}
        >
          Log in
        </Link>
        <Link
          href="#signup"
          onClick={onNavigate}
          className={cn(PILL, "bg-ink text-inverse-ink hover:bg-ink/90")}
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
