import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from "react";
import { Navigate, NavLink, Outlet, useOutletContext } from "react-router-dom";
import { Show, UserButton, useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { Inbox, FileText, FolderTree, Image, LayoutDashboard, ListOrdered, Settings, Users, PenSquare, ExternalLink, Clock } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { apiGet, setTokenGetter } from "@/libs/api";
import { cn } from "@/libs/utils";
export const useAdmin = () => useOutletContext();
const NAV = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true, admin: false, id: "dashboard" },
    { to: "/admin/posts/new", label: "Add Post", icon: PenSquare, end: true, admin: false, id: "add-post" },
    { to: "/admin/posts", label: "Manage Posts", icon: FileText, end: true, admin: false, id: "posts" },
    { to: "/admin/inbox", label: "Inbox", icon: Inbox, end: false, admin: true, id: "inbox" },
    { to: "/admin/categories", label: "Categories", icon: FolderTree, end: false, admin: true, id: "categories" },
    { to: "/admin/lists", label: "Manage Lists", icon: ListOrdered, end: false, admin: true, id: "lists" },
    { to: "/admin/media", label: "Gallery", icon: Image, end: false, admin: false, id: "media" },
    { to: "/admin/users", label: "Users & Authors", icon: Users, end: false, admin: true, id: "users" },
    { to: "/admin/settings", label: "Settings & SEO", icon: Settings, end: false, admin: true, id: "settings" },
];
function Console() {
    const { getToken } = useAuth();
    // Register synchronously so the first child query already carries the token.
    setTokenGetter(() => getToken());
    useEffect(() => () => setTokenGetter(null), []);
    const me = useQuery({ queryKey: ["me"], queryFn: () => apiGet("/me"), retry: 1 });
    if (me.isLoading) {
        return _jsx("div", { className: "grid min-h-screen place-items-center bg-ink font-mono text-xs uppercase tracking-[0.2em] text-zinc-500", children: "Loading newsroom\u2026" });
    }
    if (me.isError || !me.data) {
        return (_jsx("div", { className: "grid min-h-screen place-items-center bg-ink px-4 text-center", "data-testid": "admin-error", children: _jsxs("div", { children: [_jsx("p", { className: "font-heading text-3xl text-white", children: "We couldn't load your account." }), _jsx("button", { onClick: () => me.refetch(), className: "mt-6 rounded-full bg-gold px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-ink", children: "Try again" })] }) }));
    }
    if (me.data.role === "pending") {
        return (_jsx("div", { className: "grid min-h-screen place-items-center bg-ink px-4", "data-testid": "admin-pending", children: _jsxs("div", { className: "max-w-md text-center", children: [_jsx(Clock, { className: "mx-auto size-10 text-gold" }), _jsx("h1", { className: "mt-6 font-heading text-4xl font-semibold text-white", children: "Awaiting access" }), _jsxs("p", { className: "mt-4 text-muted-foreground", children: ["You're signed in as ", _jsx("span", { className: "text-white", children: me.data.email }), ". An admin needs to grant you author access before you can write."] }), _jsx("div", { className: "mt-8 flex justify-center", children: _jsx(UserButton, {}) })] }) }));
    }
    const isAdmin = me.data.role === "admin";
    return (_jsxs("div", { className: "min-h-screen bg-ink lg:grid lg:grid-cols-[248px_1fr]", children: [_jsxs("aside", { className: "sticky top-0 z-30 border-b border-hairline bg-[#0A0A0B] lg:h-screen lg:border-b-0 lg:border-r", children: [_jsxs("div", { className: "flex items-center justify-between px-5 py-5 lg:block", children: [_jsxs(NavLink, { to: "/admin", className: "font-heading text-xl font-semibold text-white", "data-testid": "admin-logo-link", children: ["Entrepreneur ", _jsx("span", { className: "italic text-gold", children: "Desk" })] }), _jsxs("p", { className: "mt-1 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 lg:block", children: ["Newsroom \u00B7 ", me.data.role] })] }), _jsx("nav", { className: "flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0", "data-testid": "admin-nav", children: NAV.filter((n) => isAdmin || !n.admin).map((n) => (_jsxs(NavLink, { to: n.to, end: n.end, "data-testid": `admin-nav-${n.id}`, className: ({ isActive }) => cn("flex shrink-0 items-center gap-3 rounded-sm px-3 py-2 text-[13px] transition-[background-color,color] duration-200", isActive ? "bg-gold/10 text-gold" : "text-zinc-400 hover:bg-white/[0.03] hover:text-white"), children: [_jsx(n.icon, { className: "size-4" }), " ", n.label] }, n.to))) }), _jsxs("div", { className: "hidden px-5 lg:absolute lg:bottom-5 lg:block lg:w-full", children: [_jsxs("a", { href: "/", target: "_blank", rel: "noreferrer", className: "mb-4 flex items-center gap-2 text-[12px] text-zinc-500 hover:text-gold", "data-testid": "admin-view-site-link", children: [_jsx(ExternalLink, { className: "size-3.5" }), " View website"] }), _jsxs("div", { className: "flex items-center gap-3 border-t border-hairline pt-4", children: [_jsx(UserButton, {}), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "truncate text-[13px] text-white", "data-testid": "admin-user-name", children: me.data.name || me.data.email }), _jsx("p", { className: "truncate text-[11px] text-zinc-500", children: me.data.email })] })] })] })] }), _jsx("main", { className: "min-w-0 px-4 py-8 sm:px-8 lg:px-10", children: _jsx(Outlet, { context: { me: me.data, isAdmin } }) }), _jsx(Toaster, { richColors: true })] }));
}
export default function AdminLayout() {
    return (_jsxs(_Fragment, { children: [_jsx(Show, { when: "signed-in", children: _jsx(Console, {}) }), _jsx(Show, { when: "signed-out", children: _jsx(Navigate, { to: "/sign-in", replace: true }) })] }));
}
export function AdminOnly({ children }) {
    const { isAdmin } = useAdmin();
    if (!isAdmin)
        return _jsx("p", { className: "text-muted-foreground", "data-testid": "admin-forbidden", children: "Only admins can open this section." });
    return _jsx(_Fragment, { children: children });
}
