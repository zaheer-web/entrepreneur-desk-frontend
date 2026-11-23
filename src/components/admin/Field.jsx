import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/libs/utils";
/** Every admin input: a label, the control, and a plain-language note on what to enter. */
export function Field({ label, help, children, htmlFor, required, counter, className, }) {
    const state = counter
        ? counter.value === 0
            ? "text-zinc-500"
            : counter.value < counter.ideal[0] || counter.value > counter.ideal[1]
                ? "text-amber-400"
                : "text-emerald-400"
        : "";
    return (_jsxs("div", { className: cn("space-y-1.5", className), children: [_jsxs("div", { className: "flex items-baseline justify-between gap-3", children: [_jsxs("label", { htmlFor: htmlFor, className: "text-[12px] font-semibold uppercase tracking-[0.12em] text-zinc-300", children: [label, required && _jsx("span", { className: "ml-1 text-gold", children: "*" })] }), counter && (_jsxs("span", { className: cn("font-mono text-[10px]", state), children: [counter.value, " / ", counter.ideal[0], "\u2013", counter.ideal[1]] }))] }), children, _jsx("p", { className: "text-[12px] leading-relaxed text-zinc-500", children: help })] }));
}
export const inputCls = "h-10 w-full rounded-sm border border-input bg-[#101012] px-3 text-sm text-white placeholder:text-zinc-600 transition-[border-color,box-shadow] duration-200 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";
export const textareaCls = "w-full rounded-sm border border-input bg-[#101012] px-3 py-2 text-sm text-white placeholder:text-zinc-600 transition-[border-color,box-shadow] duration-200 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";
export function Panel({ title, description, children, className }) {
    return (_jsxs("section", { className: cn("border border-hairline bg-card p-6", className), children: [_jsx("h2", { className: "font-heading text-xl font-semibold text-white", children: title }), description && _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: description }), _jsx("div", { className: "mt-6 space-y-6", children: children })] }));
}
export function PageHeader({ eyebrow, title, actions }) {
    return (_jsxs("div", { className: "mb-8 flex flex-col justify-between gap-4 border-b border-hairline pb-6 sm:flex-row sm:items-end", children: [_jsxs("div", { children: [_jsx("p", { className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold", children: eyebrow }), _jsx("h1", { className: "mt-2 font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl", children: title })] }), actions && _jsx("div", { className: "flex flex-wrap gap-2", children: actions })] }));
}
export const goldBtn = "inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink transition-[background-color,transform] duration-200 hover:bg-gold-hover active:scale-[0.98] disabled:opacity-50";
export const ghostBtn = "inline-flex items-center justify-center gap-2 rounded-full border border-hairline px-4 py-2 text-[12px] font-medium text-zinc-300 transition-[border-color,color] duration-200 hover:border-gold/60 hover:text-white disabled:opacity-50";
export const dangerBtn = "inline-flex items-center justify-center gap-2 rounded-full border border-red-500/30 px-4 py-2 text-[12px] font-medium text-red-400 transition-colors duration-200 hover:bg-red-500/10";
export function Switch({ checked, onChange, testId, label }) {
    return (_jsx("button", { type: "button", role: "switch", "aria-checked": checked, "aria-label": label, onClick: () => onChange(!checked), "data-testid": testId, className: cn("relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200", checked ? "border-gold bg-gold" : "border-hairline bg-[#101012]"), children: _jsx("span", { className: cn("absolute top-0.5 size-4.5 rounded-full transition-[left,background-color] duration-200", checked ? "left-[22px] bg-ink" : "left-0.5 bg-zinc-500") }) }));
}
