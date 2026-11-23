import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import {
  useLists,
  useList,
  useNews,
  useStories,
} from "@/libs/queries";

import { formatDate } from "@/libs/types";

import {
  Eyebrow,
  SkeletonBlock,
  StoryCard,
  TypeTag,
} from "@/components/shared/StoryCard";

import NewsTicker from "@/components/shared/NewsTicker";
import { useSeo } from "@/libs/seo";

function SectionHead({ eyebrow, title, to, linkLabel, testId }) {
  return (
    <div className="mb-10 flex items-end justify-between gap-6 border-b border-hairline pb-5">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>

        <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
      </div>

      <Link
        to={to}
        className="group hidden shrink-0 items-center gap-2 text-[12px] font-medium uppercase tracking-[0.15em] text-muted-foreground transition-colors duration-200 hover:text-gold sm:inline-flex"
        data-testid={testId}
      >
        {linkLabel}

        <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

export default function Home() {
  // Fetch Stories
  const stories = useStories();

  // Fetch News
  const news = useNews();

  // Fetch all published Lists
  const lists = useLists();

  // Get latest available published list
  const publishedLists = Array.isArray(lists.data)
    ? lists.data
    : [];

  const selectedList = publishedLists[0] || null;

  // Fetch selected List details and entries
  const listQuery = useList(selectedList?.slug);

  // Use detail response, with list response as fallback
  const list = listQuery.data || selectedList;

  useSeo({});

  // Stories data
  const all = Array.isArray(stories.data)
    ? stories.data
    : [];

  // Featured Story
  const featured =
    all.find((s) => s.featured) || all[0] || null;

  // Briefing
  const rest = all.filter(
    (s) => s.id !== featured?.id
  );

  const briefing = rest.slice(0, 5);

  // Interviews
  const interviews = all
    .filter((s) => s.type === "interview")
    .slice(0, 3);

  // Founder Stories
  // Featured story is also included here
  const latest = all
    .filter((s) => s.type === "story")
    .slice(0, 3);

  // News
  const newsItems = Array.isArray(news.data)
    ? news.data
    : [];

  // List Entries
  const entries = Array.isArray(list?.entries)
    ? list.entries
    : [];

  // Dynamic list information
  const listTitle = list?.title || "Featured List";

  const listYear =
    list?.year || new Date().getFullYear();

  const listDescription =
    list?.description ||
    "Discover the entrepreneurs and founders shaping the future.";

  return (
    <div>
      {/* HERO SECTION */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <div className="mb-8 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span data-testid="home-edition-label">
            The Founders' Edition
          </span>

          <span className="hidden sm:inline">
            Stories · Interviews · Lists · News
          </span>
        </div>

        <div className="grid gap-10 lg:grid-cols-12">
          {/* FEATURED STORY */}
          <div className="lg:col-span-8">
            {stories.isLoading ? (
              <SkeletonBlock className="aspect-[16/11] w-full" />
            ) : featured ? (
              <Link
                to={`/story/${featured.slug}`}
                className="group relative block overflow-hidden"
                data-testid="home-featured-story"
              >
                <div className="relative aspect-[4/5] sm:aspect-[16/11]">
                  {featured.image && (
                    <img
                      src={featured.image}
                      alt={featured.person || featured.title}
                      className="h-full w-full object-cover object-top grayscale-[35%] transition-[transform,filter] duration-1000 ease-out group-hover:scale-[1.02] group-hover:grayscale-0"
                    />
                  )}

                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(13,13,14,0.95)_0%,rgba(13,13,14,0.6)_45%,rgba(13,13,14,0.1)_100%)]" />

                  <div className="absolute inset-x-0 bottom-0 animate-fade-up p-6 sm:p-10">
                    <span className="inline-flex rounded-full border border-gold/50 bg-ink/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-gold backdrop-blur">
                      Cover Story · {featured.category}
                    </span>

                    <h1 className="mt-5 max-w-3xl font-heading text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl">
                      {featured.title}
                    </h1>

                    <p className="mt-5 max-w-2xl font-serif text-base italic leading-relaxed text-zinc-300 sm:text-lg">
                      {featured.dek || featured.summary}
                    </p>

                    <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                      By {featured.author || featured.person}
                      {" · "}
                      {featured.read_minutes || 0} min read
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex aspect-[16/11] items-center justify-center border border-hairline text-muted-foreground">
                No featured story available.
              </div>
            )}
          </div>

          {/* BRIEFING */}
          <aside
            className="lg:col-span-4"
            data-testid="home-briefing"
          >
            <div className="flex items-center justify-between border-b border-gold/40 pb-3">
              <Eyebrow>The Briefing</Eyebrow>

              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Latest
              </span>
            </div>

            <ol>
              {stories.isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonBlock
                    key={i}
                    className="my-5 h-16 w-full"
                  />
                ))}

              {!stories.isLoading &&
                briefing.map((s, i) => (
                  <li
                    key={s.id || s.slug}
                    className="border-b border-hairline"
                  >
                    <Link
                      to={`/story/${s.slug}`}
                      className="group flex gap-5 py-5"
                      data-testid={`home-briefing-item-${i}`}
                    >
                      <span className="font-heading text-3xl italic leading-none text-gold/70">
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <div>
                        <TypeTag story={s} />

                        <p className="mt-2 font-heading text-lg leading-snug text-white transition-colors duration-200 group-hover:text-gold-soft">
                          {s.title}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}

              {!stories.isLoading &&
                briefing.length === 0 && (
                  <p className="py-6 text-sm text-muted-foreground">
                    No recent stories available.
                  </p>
                )}
            </ol>

            <Link
              to="/get-featured"
              className="group mt-8 block border border-gold/30 bg-[linear-gradient(135deg,rgba(212,175,55,0.10),transparent_60%)] p-6 transition-colors duration-300 hover:border-gold"
              data-testid="home-get-featured-card"
            >
              <Eyebrow>For Founders</Eyebrow>

              <p className="mt-3 font-heading text-2xl leading-tight text-white">
                Building something remarkable?
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                Tell us your story. Our editors read every submission.
              </p>

              <span className="mt-5 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.15em] text-gold">
                Get Featured

                <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </aside>
        </div>
      </section>

      {/* NEWS TICKER */}
      <NewsTicker items={newsItems} />

      {/* INTERVIEWS SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHead
          eyebrow="In Conversation"
          title="Interviews"
          to="/stories?type=interview"
          linkLabel="All interviews"
          testId="home-all-interviews-link"
        />

        <div className="grid gap-10 md:grid-cols-3">
          {stories.isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBlock
                key={i}
                className="aspect-[4/5]"
              />
            ))}

          {interviews.map((s, i) => (
            <div
              key={s.id || s.slug}
              className={i === 1 ? "md:mt-16" : ""}
            >
              <StoryCard story={s} />
            </div>
          ))}

          {!stories.isLoading &&
            interviews.length === 0 && (
              <p className="text-muted-foreground">
                No interviews published yet.
              </p>
            )}
        </div>
      </section>

      {/* DYNAMIC LIST SECTION */}
      <section
        className="bg-cream text-[#121214]"
        data-testid="home-30u30-section"
      >
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          {listQuery.isLoading || lists.isLoading ? (
            <div className="grid gap-10 lg:grid-cols-12">
              <SkeletonBlock className="h-72 lg:col-span-4" />

              <SkeletonBlock className="h-96 lg:col-span-8" />
            </div>
          ) : list ? (
            <div className="grid gap-10 lg:grid-cols-12">
              {/* LIST INFORMATION */}
              <div className="lg:col-span-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8A6B1A]">
                  The List · {listYear}
                </p>

                <h2 className="mt-4 font-heading text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl">
                  {listTitle}
                </h2>

                <p className="mt-6 max-w-sm font-serif text-lg italic leading-relaxed text-[#52525B]">
                  {listDescription}
                </p>

                <Link
                  to="/lists"
                  className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[#121214] px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-cream transition-[background-color] duration-200 hover:bg-black"
                  data-testid="home-view-list-btn"
                >
                  View the full list

                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>

              {/* LIST ENTRIES */}
              <div className="grid grid-cols-2 gap-px bg-[#E4E2DC] sm:grid-cols-3 lg:col-span-8">
                {entries.slice(0, 6).map((e, i) => (
                  <Link
                    key={e.id || e.rank || i}
                    to="/lists"
                    className="group relative bg-cream p-4"
                    data-testid={`home-list-entry-${e.rank || i}`}
                  >
                    <div className="aspect-square overflow-hidden">
                      {e.image ? (
                        <img
                          src={e.image}
                          alt={e.name || e.title}
                          loading="lazy"
                          className="h-full w-full object-cover grayscale transition-[filter,transform] duration-700 group-hover:scale-105 group-hover:grayscale-0"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#EFEDE7] text-sm text-[#8A6B1A]">
                          {e.name || e.title}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-baseline justify-between gap-2">
                      <p className="font-heading text-lg leading-tight">
                        {e.name || e.title}
                      </p>

                      <span className="font-mono text-[11px] text-[#8A6B1A]">
                        #{String(e.rank || i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[#52525B]">
                      {e.age ? `${e.age} · ` : ""}
                      {e.company || ""}
                    </p>
                  </Link>
                ))}

                {entries.length === 0 && (
                  <div className="col-span-full flex min-h-64 items-center justify-center bg-[#EFEDE7] p-6 text-center text-sm text-[#52525B]">
                    This list has no entries yet. Add entries from Manage Lists.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="font-heading text-3xl">
                No published lists available
              </p>

              <p className="mt-3 text-sm text-[#52525B]">
                Publish a list from your Admin Panel to display it here.
              </p>

              <Link
                to="/lists"
                className="mt-6 inline-flex rounded-full bg-[#121214] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white"
              >
                Explore Lists
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FOUNDER STORIES */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHead
          eyebrow="Long Reads"
          title="Founder Stories"
          to="/stories"
          linkLabel="All stories"
          testId="home-all-stories-link"
        />

        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {stories.isLoading ? (
              <SkeletonBlock className="aspect-[4/5] w-full" />
            ) : latest[0] ? (
              <StoryCard
                story={latest[0]}
                size="lg"
              />
            ) : (
              <p className="text-muted-foreground">
                No founder stories published yet.
              </p>
            )}
          </div>

          <div className="grid gap-12 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            {latest.slice(1).map((s) => (
              <Link
                key={s.id || s.slug}
                to={`/story/${s.slug}`}
                className="group grid grid-cols-5 gap-5"
                data-testid={`home-latest-story-${s.slug}`}
              >
                <div className="col-span-2 aspect-square overflow-hidden">
                  {s.image && (
                    <img
                      src={s.image}
                      alt={s.person || s.title}
                      loading="lazy"
                      className="h-full w-full object-cover grayscale-[60%] transition-[filter,transform] duration-700 group-hover:scale-105 group-hover:grayscale-0"
                    />
                  )}
                </div>

                <div className="col-span-3">
                  <TypeTag story={s} />

                  <p className="mt-3 font-heading text-xl leading-snug text-white transition-colors duration-200 group-hover:text-gold-soft">
                    {s.title}
                  </p>

                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    {s.read_minutes} min read
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS SECTION */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHead
            eyebrow="Global Wire"
            title="News"
            to="/news"
            linkLabel="All news"
            testId="home-all-news-link"
          />

          <div className="grid gap-px bg-hairline md:grid-cols-2 lg:grid-cols-4">
            {newsItems.slice(0, 4).map((n) => (
              <Link
                key={n.id}
                to="/news"
                className="group bg-background p-6 transition-colors duration-300 hover:bg-card"
                data-testid={`home-news-item-${n.id}`}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
                  {n.region}
                </p>

                <p className="mt-4 font-heading text-xl leading-snug text-white">
                  {n.title}
                </p>

                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                  {formatDate(n.published_at)}
                </p>
              </Link>
            ))}

            {!news.isLoading &&
              newsItems.length === 0 && (
                <p className="col-span-full py-8 text-muted-foreground">
                  No news available.
                </p>
              )}
          </div>
        </div>
      </section>
    </div>
  );
}