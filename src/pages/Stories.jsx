import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useCategories, useStories } from "@/libs/queries";
import { useSeo } from "@/libs/seo";
import { EmptyNote, Eyebrow, SkeletonBlock, StoryCard } from "@/components/shared/StoryCard";
import { cn } from "@/libs/utils";
const TYPES = [
    { value: "", label: "All formats" },
    { value: "story", label: "Stories" },
    { value: "interview", label: "Interviews" },
];
export default function Stories() {
    const [params, setParams] = useSearchParams();
    const q = params.get("q") ?? "";
    const category = params.get("category") ?? "All";
    const type = params.get("type") ?? "";
    const [input, setInput] = useState(q);
    // keep input in sync when the URL changes from elsewhere (e.g. header search)
    useEffect(() => setInput(q), [q]);
    // debounce typing into the URL
    useEffect(() => {
        if (input === q)
            return;
        const t = setTimeout(() => update("q", input.trim()), 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input]);
    function update(key, value) {
        const next = new URLSearchParams(params);
        if (value && value !== "All")
            next.set(key, value);
        else
            next.delete(key);
        setParams(next, { replace: true });
    }
    const { data, isLoading, isError } = useStories({ q, category, type });
    const cats = useCategories();
    const categoryPills = ["All", ...(cats.isError ? [] : (cats.data ?? [])).filter((c) => c.post_count > 0).map((c) => c.name)];
    useSeo({ title: "Stories & Interviews", description: "Long-form profiles and candid conversations with the entrepreneurs building what comes next." });
    const results = isError ? [] : (data ?? []);
    return (_jsxs("div", { className: "mx-auto max-w-7xl px-4 pb-24 pt-14 sm:px-6 lg:px-8", children: [_jsxs("header", { className: "grid gap-8 border-b border-hairline pb-10 lg:grid-cols-12 lg:items-end", children: [_jsxs("div", { className: "lg:col-span-7", children: [_jsx(Eyebrow, { children: "The Archive" }), _jsxs("h1", { className: "mt-4 font-heading text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-7xl", children: ["Stories ", _jsx("span", { className: "italic text-gold", children: "&" }), " Interviews"] }), _jsx("p", { className: "mt-5 max-w-xl font-serif text-lg italic text-muted-foreground", children: "Long-form profiles and candid conversations with the people building what comes next." })] }), _jsx("div", { className: "lg:col-span-5", children: _jsxs("label", { className: "flex items-center gap-3 border-b border-white/20 pb-3 transition-colors duration-300 focus-within:border-gold", children: [_jsx(Search, { className: "size-4 text-gold" }), _jsx("input", { value: input, onChange: (e) => setInput(e.target.value), placeholder: "Search founders, companies, topics", className: "w-full bg-transparent text-base text-white placeholder:text-zinc-500 focus:outline-none", "data-testid": "story-search-input" }), input && (_jsx("button", { onClick: () => setInput(""), "aria-label": "Clear search", "data-testid": "story-search-clear", children: _jsx(X, { className: "size-4 text-muted-foreground hover:text-white" }) }))] }) })] }), _jsxs("div", { className: "flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between", children: [_jsx("div", { className: "flex flex-wrap gap-2", "data-testid": "story-category-filters", children: categoryPills.map((c) => (_jsx("button", { onClick: () => update("category", c), "data-testid": `story-category-${c.toLowerCase().replace(/[^a-z]+/g, "-")}`, className: cn("rounded-full border px-4 py-1.5 text-[12px] font-medium transition-[background-color,border-color,color] duration-200", category === c ? "border-gold bg-gold text-ink" : "border-hairline text-muted-foreground hover:border-gold/50 hover:text-white"), children: c }, c))) }), _jsx("div", { className: "flex gap-5", "data-testid": "story-type-filters", children: TYPES.map((t) => (_jsx("button", { onClick: () => update("type", t.value), "data-testid": `story-type-${t.value || "all"}`, className: cn("font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-200", type === t.value ? "text-gold" : "text-zinc-500 hover:text-white"), children: t.label }, t.label))) })] }), _jsx("p", { className: "mb-10 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500", "data-testid": "story-results-count", children: isLoading ? "Loading…" : `${results.length} ${results.length === 1 ? "feature" : "features"}${q ? ` for “${q}”` : ""}` }), isLoading ? (_jsx("div", { className: "grid gap-12 md:grid-cols-3", children: Array.from({ length: 6 }).map((_, i) => (_jsx(SkeletonBlock, { className: "aspect-[4/5]" }, i))) })) : results.length === 0 ? (_jsx(EmptyNote, { testId: "story-empty-state", children: "No features match your search. Try another name, company or topic." })) : (_jsx("div", { className: "grid gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3", "data-testid": "story-results-grid", children: results.map((s, i) => (_jsx("div", { className: cn(i === 0 && results.length > 2 && "md:col-span-2 lg:col-span-2"), children: _jsx(StoryCard, { story: s, size: i === 0 && results.length > 2 ? "lg" : "md" }) }, s.id))) }))] }));
}
