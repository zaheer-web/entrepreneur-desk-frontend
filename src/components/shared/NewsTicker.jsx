import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function NewsTicker({ items }) {
    if (items.length === 0)
        return null;
    const loop = [...items, ...items];
    return (_jsxs("div", { className: "flex items-stretch overflow-hidden border-y border-hairline bg-[#111113]", "data-testid": "news-ticker", children: [_jsxs("span", { className: "z-10 flex shrink-0 items-center gap-2 bg-gold px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ink", children: [_jsx("span", { className: "size-1.5 animate-pulse rounded-full bg-ink" }), " Wire"] }), _jsx("div", { className: "relative flex-1 overflow-hidden py-3", children: _jsx("div", { className: "flex w-max animate-marquee gap-16 whitespace-nowrap hover:[animation-play-state:paused]", children: loop.map((n, i) => (_jsxs("span", { className: "text-[13px] text-zinc-300", children: [_jsx("span", { className: "mr-3 font-mono text-[10px] uppercase tracking-[0.2em] text-gold", children: n.region }), n.title] }, `${n.id}-${i}`))) }) })] }));
}
