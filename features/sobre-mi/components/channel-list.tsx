import type { JSX } from "react";
import type { Channel } from "@/features/sobre-mi/content/contacto";
import { sm } from "@/features/sobre-mi/motion/attributes";
import { ExternalLink } from "@/features/sobre-mi/components/external-link";
import { isHttpsUrl } from "@/features/sobre-mi/content/rich-text";

type Props = { channels: readonly Channel[] };

/* arbitrary: 15px channel rows (mockup .social); between body-sm and body-base */
const ROW_TEXT = "text-[0.9375rem]";

/**
 * "Otras formas de encontrarme" (spec § Page 4): channel (mono, muted) and
 * value (mono, bold, a link) per row. Email opens the mail client in place;
 * the social profiles open in a new tab and say so. M6 slides the rows in.
 */
export function ChannelList({ channels }: Props): JSX.Element {
  return (
    <ul {...sm("channels")} className="mt-2">
      {channels.map((channel) => (
        <li
          key={channel.label}
          // arbitrary: 88px label column (--spacing(22)), mockup .social
          className={`border-hairline grid grid-cols-[--spacing(22)_minmax(0,1fr)] gap-2.5 border-b py-2.5 font-mono ${ROW_TEXT}`}
        >
          <span className="text-ink-muted font-normal">{channel.label}</span>
          <span className="text-ink font-bold wrap-anywhere">
            {isHttpsUrl(channel.href) ? (
              <ExternalLink
                href={channel.href}
                className="no-underline underline-offset-3 hover:underline"
              >
                {channel.value}
              </ExternalLink>
            ) : (
              <a
                href={channel.href}
                className="underline-offset-3 hover:underline"
              >
                {channel.value}
              </a>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
