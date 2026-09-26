import type { JSX } from "react";
import type {
  HttpsUrl,
  RichText as RichTextContent,
} from "@/features/sobre-mi/types";
import { ExternalLink } from "@/features/sobre-mi/components/external-link";

type Props = { text: RichTextContent };

const isHttps = (href: string): href is HttpsUrl => href.startsWith("https://");

/** Renders inline copy with its links: https in a new tab, mailto in place. */
export function RichText({ text }: Props): JSX.Element {
  return (
    <>
      {text.map((segment, i) => {
        if (typeof segment === "string") return segment;
        if (isHttps(segment.href)) {
          return (
            <ExternalLink key={i} href={segment.href} className="text-ink">
              {segment.text}
            </ExternalLink>
          );
        }
        return (
          <a
            key={i}
            href={segment.href}
            className="text-ink underline underline-offset-3"
          >
            {segment.text}
          </a>
        );
      })}
    </>
  );
}
