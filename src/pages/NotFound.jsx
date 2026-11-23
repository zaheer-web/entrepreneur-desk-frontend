import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
export default function NotFound() {
    return (_jsxs("div", { className: "mx-auto max-w-3xl px-4 py-32 text-center", children: [_jsx("p", { className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold", children: "404" }), _jsx("h1", { className: "mt-4 font-heading text-5xl font-semibold text-white", children: "This page went to press without us." }), _jsx(Link, { to: "/", className: "mt-10 inline-flex rounded-full bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink", "data-testid": "not-found-home-link", children: "Back to the front page" })] }));
}
