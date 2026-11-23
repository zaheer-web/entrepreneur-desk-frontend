import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { formatDate } from "@/libs/types";
import { cn } from "@/libs/utils";
export function Eyebrow({ children, className }) {
    return _jsx("p", { className: cn("font-mono text-[11px] uppercase tracking-[0.2em] text-gold", className), children: children });
}
export function TypeTag({ story }) {
    return (_jsxs("span", { className: "inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-gold", children: [_jsx("span", { className: "h-px w-5 bg-gold" }), story.type === "interview" ? "Interview" : story.category] }));
}
export function StoryCard({ story, size = "md" }) {
    return (_jsxs(Link, { to: `/story/${story.slug}`, className: "group block", "data-testid": `story-card-${story.slug}`, children: [_jsxs("div", { className: cn("relative overflow-hidden bg-card", size === "lg" ? "aspect-[4/3]" : "aspect-[4/5]"), children: [_jsx("img", { src: story.image, alt: story.person, loading: "lazy", className: "h-full w-full object-cover grayscale-[60%] transition-[transform,filter] duration-700 ease-out group-hover:scale-[1.03] group-hover:grayscale-0" }), story.type === "interview" && (_jsx("span", { className: "absolute left-4 top-4 rounded-full bg-ink/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-gold backdrop-blur", children: "Q&A" }))] }), _jsxs("div", { className: "mt-5", children: [_jsx(TypeTag, { story: story }), _jsx("h3", { className: cn("mt-3 font-heading font-semibold leading-tight tracking-tight text-white transition-colors duration-200 group-hover:text-gold-soft", size === "lg" ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"), children: story.title }), _jsx("p", { className: "mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground", children: story.dek }), _jsxs("p", { className: "mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500", children: [story.person, " \u00B7 ", formatDate(story.published_at), " \u00B7 ", story.read_minutes, " min"] })] })] }));
}
export function SkeletonBlock({ className }) {
    return _jsx("div", { className: cn("animate-pulse bg-white/[0.04]", className) });
}
export function EmptyNote({ children, testId }) {
    return (_jsx("p", { className: "border border-dashed border-hairline px-6 py-12 text-center font-serif italic text-muted-foreground", "data-testid": testId, children: children }));
}
