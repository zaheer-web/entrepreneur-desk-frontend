import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Link2 } from "lucide-react";
import { toast } from "sonner";
import { useStories, useStory } from "@/libs/queries";
import { formatDate } from "@/libs/types";
import DOMPurify from "dompurify";
import { EmptyNote, Eyebrow, SkeletonBlock, StoryCard } from "@/components/shared/StoryCard";
import { useSeo } from "@/libs/seo";
export default function StoryDetail() {
    const { slug = "" } = useParams();
    const { data: story, isLoading, isError } = useStory(slug);
    const related = useStories({ category: story?.category });
    useSeo({
        ready: !!story,
        type: "article",
        title: story ? story.seo_title || story.title : "",
        description: story ? story.meta_description || story.dek : "",
        image: story ? story.og_image || story.image : "",
        canonical: story?.canonical_url || undefined,
        noindex: story?.noindex,
        publishedAt: story?.published_at,
        modifiedAt: story?.updated_at,
        author: story?.author,
        schemaType: story?.schema_type,
        keywords: story?.tags.join(", "),
    });
    const back = (_jsxs(Link, { to: "/stories", className: "group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-200 hover:text-gold", "data-testid": "story-back-link", children: [_jsx(ArrowLeft, { className: "size-3.5 transition-transform duration-200 group-hover:-translate-x-1" }), " All stories"] }));
    if (isLoading) {
        return (_jsxs("div", { className: "mx-auto max-w-4xl px-4 py-16 sm:px-6", children: [back, _jsx(SkeletonBlock, { className: "mt-10 h-16 w-3/4" }), _jsx(SkeletonBlock, { className: "mt-10 aspect-[16/9] w-full" })] }));
    }
    if (isError || !story) {
        return (_jsxs("div", { className: "mx-auto max-w-4xl px-4 py-16 sm:px-6", children: [back, _jsx("div", { className: "mt-10", children: _jsx(EmptyNote, { testId: "story-not-found", children: "This story could not be found." }) })] }));
    }
    const more = (related.data ?? []).filter((s) => s.id !== story.id).slice(0, 3);
    return (_jsxs("article", { "data-testid": "story-detail", children: [_jsxs("header", { className: "mx-auto max-w-4xl px-4 pt-14 text-center sm:px-6", children: [_jsx("div", { className: "text-left", children: back }), _jsxs("div", { className: "mt-12 animate-fade-up", children: [_jsxs(Eyebrow, { children: [story.type === "interview" ? "Interview" : story.type === "news" ? `News · ${story.region}` : "Feature", " \u00B7 ", story.category] }), _jsx("h1", { className: "mx-auto mt-6 max-w-3xl font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl", "data-testid": "story-title", children: story.title }), _jsx("p", { className: "mx-auto mt-6 max-w-2xl font-serif text-lg italic leading-relaxed text-muted-foreground sm:text-xl", children: story.dek }), _jsxs("div", { className: "mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500", children: [_jsxs("span", { children: ["By ", _jsx("span", { className: "text-white", children: story.author })] }), _jsx("span", { children: formatDate(story.published_at) }), _jsxs("span", { className: "rounded-full border border-gold/40 px-3 py-1 text-gold", children: [story.read_minutes, " min read"] })] })] })] }), story.image && _jsxs("figure", { className: "mx-auto mt-14 max-w-6xl px-4 sm:px-6 lg:px-8", children: [_jsx("div", { className: "aspect-[16/9] overflow-hidden", children: _jsx("img", { src: story.image, alt: story.image_alt || story.person, className: "h-full w-full object-cover object-top" }) }), _jsxs("figcaption", { className: "mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500", children: [story.person, ", ", story.company] })] }), _jsxs("div", { className: "mx-auto grid max-w-6xl gap-14 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8", children: [_jsx("aside", { className: "order-2 lg:order-1 lg:col-span-3", children: _jsxs("div", { className: "sticky top-24 border-t border-gold/50 pt-5", "data-testid": "story-dossier", children: [_jsx(Eyebrow, { children: "Founder Dossier" }), _jsxs("dl", { className: "mt-5 space-y-4 text-sm", children: [_jsxs("div", { children: [_jsx("dt", { className: "font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500", children: "Founder" }), _jsx("dd", { className: "mt-1 font-heading text-lg text-white", children: story.person })] }), _jsxs("div", { children: [_jsx("dt", { className: "font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500", children: "Company" }), _jsx("dd", { className: "mt-1 text-white", children: story.company })] }), _jsxs("div", { children: [_jsx("dt", { className: "font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500", children: "Sector" }), _jsx("dd", { className: "mt-1 text-white", children: story.category })] })] }), _jsxs("button", { onClick: () => {
                                        void navigator.clipboard?.writeText(window.location.href).then(() => toast.success("Link copied"), () => toast.error("Could not copy link"));
                                    }, className: "mt-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-200 hover:text-gold", "data-testid": "story-copy-link-btn", children: [_jsx(Link2, { className: "size-3.5" }), " Copy link"] })] }) }), _jsx("div", { className: "order-1 lg:order-2 lg:col-span-8 lg:col-start-5", children: story.content_html ? (_jsxs("div", { className: "ed-prose ed-article", "data-testid": "story-rich-body", children: [story.pull_quote && _jsx(PullQuote, { text: story.pull_quote, person: story.person || story.author, first: true }), _jsx("div", { dangerouslySetInnerHTML: { __html: DOMPurify.sanitize(story.content_html, { ADD_ATTR: ["target"] }) } })] })) : story.type === "story" ? (_jsx("div", { className: "space-y-7 text-[17px] leading-[1.85] text-zinc-300", "data-testid": "story-body", children: story.body.map((p, i) => (_jsxs("div", { children: [_jsx("p", { className: i === 0
                                            ? "first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-heading first-letter:text-7xl first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-gold"
                                            : "", children: p }), i === 1 && story.pull_quote && _jsx(PullQuote, { text: story.pull_quote, person: story.person })] }, i))) })) : (_jsxs("div", { "data-testid": "story-qa", children: [story.pull_quote && _jsx(PullQuote, { text: story.pull_quote, person: story.person, first: true }), _jsx("div", { className: "space-y-12", children: story.qa.map((item, i) => (_jsxs("div", { className: "grid grid-cols-[auto_1fr] gap-x-5 gap-y-4", "data-testid": `story-qa-item-${i}`, children: [_jsx("span", { className: "grid size-8 place-items-center rounded-full bg-gold font-mono text-xs font-bold text-ink", children: "Q" }), _jsx("p", { className: "font-heading text-xl font-semibold leading-snug text-white sm:text-2xl", children: item.q }), _jsx("span", { className: "grid size-8 place-items-center rounded-full border border-hairline font-mono text-xs text-muted-foreground", children: "A" }), _jsx("p", { className: "text-[17px] leading-[1.85] text-zinc-300", children: item.a })] }, i))) })] })) })] }), more.length > 0 && (_jsx("section", { className: "border-t border-hairline", children: _jsxs("div", { className: "mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8", children: [_jsx(Eyebrow, { children: "Continue Reading" }), _jsxs("h2", { className: "mb-10 mt-3 font-heading text-3xl font-semibold tracking-tight text-white", children: ["More in ", story.category] }), _jsx("div", { className: "grid gap-10 md:grid-cols-3", "data-testid": "story-related", children: more.map((s) => (_jsx(StoryCard, { story: s }, s.id))) })] }) }))] }));
}
function PullQuote({ text, person, first }) {
    return (_jsxs("blockquote", { className: `${first ? "mb-14" : "my-12"} bg-cream px-8 py-10 text-[#121214] sm:px-12`, "data-testid": "story-pull-quote", children: [_jsx("span", { className: "font-heading text-6xl leading-none text-[#8A6B1A]", children: "\u201C" }), _jsx("p", { className: "-mt-4 font-serif text-2xl italic leading-snug sm:text-3xl", children: text }), _jsxs("footer", { className: "mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-[#52525B]", children: ["\u2014 ", person] })] }));
}
