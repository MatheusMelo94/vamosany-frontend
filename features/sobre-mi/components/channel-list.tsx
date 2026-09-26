import type { JSX } from "react";
import type { Channel } from "@/features/sobre-mi/content/contacto";
import { sm } from "@/features/sobre-mi/motion/attributes";
import { ExternalLink } from "@/features/sobre-mi/components/external-link";
import { isHttpsUrl } from "@/features/sobre-mi/content/rich-text";

type Props = { channels: readonly Channel[] };

/*
 * Coarse pointers: the link's tap area is its whole row (the row is ≥ 44px
 * tall there, and the area also covers the row's 1px rule), so every
 * channel owns an exclusive ≥ 44 × 44 px target and rows never overlap
 * (RV-0001, QA-0003). Invisible; fine pointers are untouched.
 */
const ROW_HIT_AREA =
  "pointer-coarse:before:absolute pointer-coarse:before:inset-x-0 pointer-coarse:before:top-0 pointer-coarse:before:-bottom-px pointer-coarse:before:z-1";

/* arbitrary: 15px channel values (mockup .social); between body-sm and body-base */
const VALUE_TEXT = "text-[0.9375rem]";

/**
 * The only break opportunity inside a value: right after an "@" that isn't
 * its first character ("hola@" / "vamosany.com"; spec v1.1 § Page 4).
 */
function withBreakAfterAt(value: string) {
  const at = value.indexOf("@");
  if (at <= 0) return value;
  return (
    <>
      {value.slice(0, at + 1)}
      <wbr />
      {value.slice(at + 1)}
    </>
  );
}

/**
 * "Otras formas de encontrarme" (spec v1.1 § Page 4): channel (mono 13px,
 * muted) and value (mono bold 15px, a link) per row — side by side (88px |
 * value) below the 860px gutter breakpoint, stacked name-over-value in the
 * 200px notes column above it, so "hola@vamosany.com" fits on one line. A
 * value never breaks inside a word (no overflow-wrap: anywhere). On coarse
 * pointers each link takes taps across its whole ≥ 44px row (ROW_HIT_AREA). Email opens the mail client in place;
 * the social profiles open in a new tab and say so. M6 slides the rows in.
 */
export function ChannelList({ channels }: Props): JSX.Element {
  return (
    <ul {...sm("channels")} className="mt-2">
      {channels.map((channel) => (
        <li
          key={channel.label}
          // arbitrary: 88px label column (--spacing(22)), mockup .social
          className="border-hairline @gutter:grid-cols-1 @gutter:gap-0.5 grid grid-cols-[--spacing(22)_minmax(0,1fr)] gap-2.5 border-b py-2.5 font-mono pointer-coarse:relative pointer-coarse:min-h-11"
        >
          <span className="text-label-sm text-ink-muted font-normal">
            {channel.label}
          </span>
          <span className={`text-ink font-bold ${VALUE_TEXT}`}>
            {isHttpsUrl(channel.href) ? (
              <ExternalLink
                href={channel.href}
                className={`${ROW_HIT_AREA} no-underline underline-offset-3 hover:underline`}
              >
                {withBreakAfterAt(channel.value)}
              </ExternalLink>
            ) : (
              <a
                href={channel.href}
                className={`${ROW_HIT_AREA} underline-offset-3 hover:underline`}
              >
                {withBreakAfterAt(channel.value)}
              </a>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
