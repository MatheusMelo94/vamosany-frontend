import type { JSX } from "react";
import Image from "next/image";
import { ArrowRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

const FEATURED = {
  img: "/img/post-dumbo.webp",
  alt: "The Brooklyn Bridge seen from the Dumbo waterfront",
  category: "Neighbourhood diaries",
  title: "Dumbo at seven in the morning, before the photo queue",
  excerpt:
    "The famous shot down Washington Street has a forty-minute wait by nine. Here is the hour we go instead, what the light does, and the three blocks nobody walks afterwards.",
  meta: "12 min read · March 2026",
};

const POSTS = [
  {
    img: "/img/post-night.webp",
    alt: "A Chinatown street lit up at night",
    category: "Food crawls",
    title: "Nine blocks, five plates: the Chinatown route we rebuilt this year",
    meta: "8 min read",
  },
  {
    img: "/img/post-autumn.webp",
    alt: "Central Park lake with the Midtown skyline behind",
    category: "Seasonal guides",
    title: "When the parks actually turn, and where to stand when they do",
    meta: "6 min read",
  },
  {
    img: "/img/quote-street.webp",
    alt: "Looking up at Manhattan office towers in black and white",
    category: "Photo spots",
    title:
      "Eleven places to point a camera up, ranked by how little you'll be in the way",
    meta: "9 min read",
  },
];

export function Blog(): JSX.Element {
  return (
    <section id="blog" className="border-ink border-y-2 py-16 sm:py-20">
      <div className="container-ds">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="The blog"
            title="Notes from the pavement"
            description="Everything we learn between itinerary updates — free, and usually the first place a new route shows up."
          />
          <Button href="#blog" variant="secondary" className="w-fit shrink-0">
            All posts
          </Button>
        </div>

        {/* Featured */}
        <article
          data-reveal
          className="group border-ink mt-14 grid gap-8 border-b-2 pb-14 lg:grid-cols-2 lg:items-center lg:gap-12"
        >
          <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
            <Image
              src={FEATURED.img}
              alt={FEATURED.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-(--duration-slow) ease-(--ease-default) group-hover:scale-[1.04]"
            />
          </div>
          <div>
            <p className="eyebrow">{FEATURED.category}</p>
            <h3 className="headline text-ink mt-4 text-balance">
              {FEATURED.title}
            </h3>
            <p className="body-base text-ink-subtle mt-4">{FEATURED.excerpt}</p>
            <div className="mt-6 flex items-center gap-4">
              <a
                href="#blog"
                className="label-button text-ink inline-flex items-center gap-2 underline-offset-4 hover:underline"
              >
                Read the post
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <span className="caption text-ink-tertiary">{FEATURED.meta}</span>
            </div>
          </div>
        </article>

        {/* Recent */}
        <ul data-reveal-group className="mt-14 grid gap-8 md:grid-cols-3">
          {POSTS.map((post) => (
            <li key={post.title}>
              <article className="group flex h-full flex-col">
                <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
                  <Image
                    src={post.img}
                    alt={post.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-(--duration-slow) ease-(--ease-default) group-hover:scale-[1.04]"
                  />
                </div>
                <p className="eyebrow mt-5">{post.category}</p>
                <h3 className="card-title text-ink mt-3 flex-1 text-balance">
                  <a
                    href="#blog"
                    className="underline-offset-4 hover:underline"
                  >
                    {post.title}
                  </a>
                </h3>
                <p className="caption text-ink-tertiary mt-4">{post.meta}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
