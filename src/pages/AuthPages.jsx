import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/react";
function AuthShell({ children, mode }) {
    return (_jsxs("div", { className: "grid min-h-screen bg-ink lg:grid-cols-2", children: [_jsxs("div", { className: "relative hidden flex-col justify-between overflow-hidden border-r border-hairline p-12 lg:flex", children: [_jsx("div", { className: "pointer-events-none absolute -left-40 top-0 h-full w-full bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.10),transparent_65%)]" }), _jsxs(Link, { to: "/", className: "relative font-heading text-2xl font-semibold text-white", "data-testid": "auth-logo-link", children: ["Entrepreneur ", _jsx("span", { className: "italic text-gold", children: "Desk" })] }), _jsxs("div", { className: "relative", children: [_jsx("p", { className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold", children: "Newsroom" }), _jsxs("p", { className: "mt-4 max-w-md font-heading text-5xl font-semibold leading-[1.05] text-white", children: ["The desk where ", _jsx("span", { className: "italic text-gold", children: "stories" }), " get made."] }), _jsx("p", { className: "mt-6 max-w-sm font-serif italic text-muted-foreground", children: mode === "in" ? "Sign in to write, edit and publish." : "Create your account. An admin will grant you author access." })] }), _jsx("p", { className: "relative font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600", children: "Admin & author access only" })] }), _jsx("div", { className: "flex items-center justify-center px-4 py-12", children: children })] }));
}
export function SignInPage() {
    return (_jsx(AuthShell, { mode: "in", children: _jsx(SignIn, { routing: "path", path: "/sign-in", signUpUrl: "/sign-up", withSignUp: true }) }));
}
export function SignUpPage() {
    return (_jsx(AuthShell, { mode: "up", children: _jsx(SignUp, { routing: "path", path: "/sign-up", signInUrl: "/sign-in" }) }));
}
