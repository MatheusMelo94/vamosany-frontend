import type { JSX } from "react";
import { Blocks } from "@/features/guias/components/blocks";
import { Breadcrumb } from "@/features/guias/components/breadcrumb";
import { CtaBand } from "@/features/guias/components/cta-band";
import { GuideHeading } from "@/features/guias/components/guide-heading";
import { GuideHero } from "@/features/guias/components/guide-hero";
import { GuideToc } from "@/features/guias/components/guide-toc";
import { GuideTocDetails } from "@/features/guias/components/guide-toc-details";
import { KeyFacts } from "@/features/guias/components/key-facts";
import { MoreInGroup } from "@/features/guias/components/more-in-group";
import { Pager } from "@/features/guias/components/pager";
import { GROUPS } from "@/features/guias/content/groups";
import { tocItems } from "@/features/guias/content/toc";
import { GuiasMotion } from "@/features/guias/motion/guias-motion";
import type { Guide } from "@/features/guias/types";
import { sm } from "@/features/sobre-mi/motion/attributes";

/**
 * One guide (spec § Page Structure › Guide page): breadcrumb, head, hero, a 2px
 * rule, then the reading column and the aside. The aside follows the article
 * in the DOM (a keyboard user reaches the text first) and the grid places it on
 * the right from the aside container width. Static: no data, no state.
 */
export function GuidePage({ guide }: { guide: Guide }): JSX.Element {
  const group = GROUPS.find((g) => g.id === guide.group);
  if (!group) throw new Error(`Unknown group "${guide.group}"`);
  const toc = tocItems(guide);

  return (
    <div {...sm("scene", "guias")} className="container-ds pb-16">
      <GuiasMotion />
      <div className="pt-9 md:pt-14">
        <Breadcrumb group={group} />
      </div>
      <GuideHeading
        eyebrow={group.title}
        title={guide.title}
        dek={guide.bajada}
        align="start"
        className="pt-5 pb-7 md:pb-11"
      />
      <GuideHero slug={guide.slug} />
      <hr className="border-ink mt-10 border-t-2" />
      {/* arbitrary: 18.75rem (300px) aside in rem so it scales with text size (spec § Page Structure G4) */}
      <div className="@guide-aside:grid-cols-[minmax(0,1fr)_18.75rem] @guide-aside:gap-14 grid items-start gap-8 pt-10">
        <article className="max-w-[68ch] text-[1.05rem] leading-[1.6]">
          <GuideTocDetails items={toc} />
          <Blocks blocks={guide.intro} />
          <KeyFacts facts={guide.keyFacts} label={guide.keyFactsLabel} />
          {guide.sections.map((section) => (
            <section key={section.id}>
              <h2
                id={section.id}
                tabIndex={-1}
                className="headline mt-11 mb-3.5 scroll-mt-28"
              >
                {section.title}
              </h2>
              <Blocks blocks={section.blocks} />
            </section>
          ))}
          <CtaBand cta={guide.cta} />
          {guide.afterCta ? (
            <div className="mt-6">
              <Blocks blocks={guide.afterCta} />
            </div>
          ) : null}
          <Pager slug={guide.slug} />
        </article>
        {/* arbitrary: the sticky aside never exceeds the viewport (100svh minus the 7rem top and 1rem breathing room); it scrolls inside, so its last link stays reachable on short or text-enlarged screens */}
        <aside
          aria-label="Más sobre esta guía"
          className="@guide-aside:tall:sticky @guide-aside:tall:top-28 @guide-aside:tall:max-h-[calc(100svh-8rem)] @guide-aside:tall:overflow-y-auto @guide-aside:tall:p-2 flex flex-col gap-4.5"
        >
          <GuideToc items={toc} />
          <MoreInGroup slug={guide.slug} />
        </aside>
      </div>
    </div>
  );
}
