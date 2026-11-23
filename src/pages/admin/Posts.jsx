import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, PenSquare, Plus, Search, Trash2 } from "lucide-react";
import { apiDelete, apiGet, errorMessage } from "@/libs/api";
import { PageHeader, dangerBtn, ghostBtn, goldBtn, inputCls } from "@/components/admin/Field";
import { useAdmin } from "@/components/admin/AdminLayout";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/libs/utils";
export function Dashboard() {
    const { me, isAdmin } = useAdmin();
    const stats = useQuery({ queryKey: ["admin-stats"], queryFn: () => apiGet("/admin/stats") });
    const recent = useQuery({ queryKey: ["admin-posts", "", "", ""], queryFn: () => apiGet("/admin/posts") });
    const s = stats.data;
    const tiles = [
        { label: isAdmin ? "All posts" : "My posts", value: s?.posts, to: "/admin/posts" },
        { label: "Published", value: s?.published, to: "/admin/posts?status=published" },
        { label: "Drafts", value: s?.drafts, to: "/admin/posts?status=draft" },
        { label: "Scheduled", value: s?.scheduled, to: "/admin/posts?status=scheduled" },
        { label: "Gallery images", value: s?.media, to: "/admin/media" },
        ...(isAdmin
            ? [
                { label: "Lists", value: s?.lists, to: "/admin/lists" },
                { label: "Categories", value: s?.categories, to: "/admin/categories" },
                { label: "Newsletter subscribers", value: s?.subscribers, to: "/admin/inbox?tab=subscribers" },
                { label: "Get Featured submissions", value: s?.nominations, to: "/admin/inbox" },
            ]
            : []),
    ];
    return (_jsxs("div", { "data-testid": "admin-dashboard", children: [_jsx(PageHeader, { eyebrow: "Dashboard", title: `Good to see you${me.name ? `, ${me.name.split(" ")[0]}` : ""}.`, actions: _jsxs(Link, { to: "/admin/posts/new", className: goldBtn, "data-testid": "dashboard-add-post-btn", children: [_jsx(Plus, { className: "size-4" }), " Add Post"] }) }), _jsx("div", { className: "grid grid-cols-2 gap-px bg-hairline md:grid-cols-4", children: tiles.map((t) => {
                    const inner = (_jsxs(_Fragment, { children: [_jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500", children: t.label }), _jsx("p", { className: "mt-3 font-heading text-4xl text-white", children: t.value ?? "—" })] }));
                    const id = `dashboard-stat-${t.label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
                    return t.to ? (_jsx(Link, { to: t.to, className: "bg-card p-5 transition-colors duration-200 hover:bg-[#18181B]", "data-testid": id, children: inner }, t.label)) : (_jsx("div", { className: "bg-card p-5", "data-testid": id, children: inner }, t.label));
                }) }), _jsx("h2", { className: "mb-4 mt-12 font-heading text-2xl text-white", children: "Recently edited" }), _jsxs("div", { className: "divide-y divide-hairline border border-hairline", children: [(recent.data ?? []).slice(0, 6).map((p) => (_jsxs(Link, { to: `/admin/posts/${p.id}`, className: "flex items-center justify-between gap-4 bg-card px-5 py-4 hover:bg-[#18181B]", "data-testid": `dashboard-recent-${p.id}`, children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "truncate text-white", children: p.title }), _jsxs("p", { className: "text-xs text-zinc-500", children: [p.type, " \u00B7 ", p.category || "Uncategorised"] })] }), _jsx(StatusBadge, { status: p.status })] }, p.id))), recent.data?.length === 0 && _jsx("p", { className: "bg-card px-5 py-6 text-sm text-zinc-500", children: "No posts yet \u2014 write your first one." })] })] }));
}
export function StatusBadge({ status }) {
    return (_jsx("span", { className: cn("shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]", status === "published" ? "bg-emerald-500/15 text-emerald-400" : status === "scheduled" ? "bg-gold/15 text-gold" : "bg-zinc-700/40 text-zinc-300"), children: status }));
}
export function PostsList() {
    const { isAdmin } = useAdmin();
    const qc = useQueryClient();
    const initialStatus = new URLSearchParams(window.location.search).get("status") ?? "";
    const [q, setQ] = useState("");
    const [status, setStatus] = useState(initialStatus);
    const [type, setType] = useState("");
    const [toDelete, setToDelete] = useState(null);
    const sp = new URLSearchParams();
    if (q)
        sp.set("q", q);
    if (status)
        sp.set("status", status);
    if (type)
        sp.set("type", type);
    const posts = useQuery({ queryKey: ["admin-posts", q, status, type], queryFn: () => apiGet(`/admin/posts?${sp.toString()}`) });
    const del = useMutation({
        mutationFn: (id) => apiDelete(`/admin/posts/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-posts"] });
            qc.invalidateQueries({ queryKey: ["admin-stats"] });
            qc.invalidateQueries({ queryKey: ["stories"] });
            qc.invalidateQueries({ queryKey: ["news"] });
            toast.success("Post deleted");
            setToDelete(null);
        },
        onError: (e) => toast.error(errorMessage(e, "Could not delete")),
    });
    return (_jsxs("div", { "data-testid": "admin-posts-page", children: [_jsx(PageHeader, { eyebrow: isAdmin ? "All authors" : "Your posts only", title: "Manage Posts", actions: _jsxs(Link, { to: "/admin/posts/new", className: goldBtn, "data-testid": "posts-add-btn", children: [_jsx(Plus, { className: "size-4" }), " Add Post"] }) }), _jsxs("div", { className: "mb-5 flex flex-col gap-3 md:flex-row md:items-center", children: [_jsxs("label", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" }), _jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search by title, founder, company or author", className: cn(inputCls, "pl-9"), "data-testid": "posts-search-input" })] }), _jsxs("select", { value: status, onChange: (e) => setStatus(e.target.value), className: cn(inputCls, "md:w-40"), "data-testid": "posts-status-filter", children: [_jsx("option", { value: "", children: "All statuses" }), _jsx("option", { value: "published", children: "Published" }), _jsx("option", { value: "draft", children: "Drafts" }), _jsx("option", { value: "scheduled", children: "Scheduled" })] }), _jsxs("select", { value: type, onChange: (e) => setType(e.target.value), className: cn(inputCls, "md:w-40"), "data-testid": "posts-type-filter", children: [_jsx("option", { value: "", children: "All types" }), _jsx("option", { value: "story", children: "Stories" }), _jsx("option", { value: "interview", children: "Interviews" }), _jsx("option", { value: "news", children: "News" })] })] }), _jsx("div", { className: "overflow-x-auto border border-hairline", children: _jsxs("table", { className: "w-full min-w-[720px] text-sm", "data-testid": "posts-table", children: [_jsx("thead", { className: "bg-[#101012] text-left font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3", children: "Title" }), _jsx("th", { className: "px-4 py-3", children: "Type" }), _jsx("th", { className: "px-4 py-3", children: "Category" }), _jsx("th", { className: "px-4 py-3", children: "Author" }), _jsx("th", { className: "px-4 py-3", children: "Status" }), _jsx("th", { className: "px-4 py-3", children: "Date" }), _jsx("th", { className: "px-4 py-3 text-right", children: "Actions" })] }) }), _jsxs("tbody", { className: "divide-y divide-hairline bg-card", children: [posts.isLoading && _jsx("tr", { children: _jsx("td", { colSpan: 7, className: "px-4 py-6 text-zinc-500", children: "Loading\u2026" }) }), posts.data?.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 7, className: "px-4 py-6 text-zinc-500", "data-testid": "posts-empty", children: "No posts match." }) }), (posts.data ?? []).map((p) => (_jsxs("tr", { className: "hover:bg-[#18181B]", "data-testid": `posts-row-${p.id}`, children: [_jsx("td", { className: "max-w-xs px-4 py-3", children: _jsx(Link, { to: `/admin/posts/${p.id}`, className: "line-clamp-2 text-white hover:text-gold", children: p.title }) }), _jsx("td", { className: "px-4 py-3 capitalize text-zinc-400", children: p.type }), _jsx("td", { className: "px-4 py-3 text-zinc-400", children: p.category || "—" }), _jsx("td", { className: "px-4 py-3 text-zinc-400", children: p.author || "—" }), _jsx("td", { className: "px-4 py-3", children: _jsx(StatusBadge, { status: p.status }) }), _jsx("td", { className: "px-4 py-3 font-mono text-xs text-zinc-500", children: p.status === "scheduled" && p.scheduled_at ? new Date(p.scheduled_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : p.published_at || "—" }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex justify-end gap-1", children: [p.status === "published" && (_jsx("a", { href: `/story/${p.slug}`, target: "_blank", rel: "noreferrer", className: "grid size-8 place-items-center text-zinc-400 hover:text-gold", "aria-label": "View live", "data-testid": `posts-view-${p.id}`, children: _jsx(ExternalLink, { className: "size-4" }) })), _jsx(Link, { to: `/admin/posts/${p.id}`, className: "grid size-8 place-items-center text-zinc-400 hover:text-gold", "aria-label": "Edit", "data-testid": `posts-edit-${p.id}`, children: _jsx(PenSquare, { className: "size-4" }) }), _jsx("button", { onClick: () => setToDelete(p), className: "grid size-8 place-items-center text-zinc-400 hover:text-red-400", "aria-label": "Delete", "data-testid": `posts-delete-${p.id}`, children: _jsx(Trash2, { className: "size-4" }) })] }) })] }, p.id)))] })] }) }), _jsx(Dialog, { open: !!toDelete, onOpenChange: (o) => !o && setToDelete(null), children: _jsxs(DialogContent, { className: "rounded-sm border-hairline bg-popover", "data-testid": "posts-delete-dialog", children: [_jsx(DialogTitle, { className: "font-heading text-xl text-white", children: "Delete this post?" }), _jsxs(DialogDescription, { children: ["\u201C", toDelete?.title, "\u201D will be removed from the website and search engines will be told it's gone."] }), _jsxs("div", { className: "mt-4 flex justify-end gap-2", children: [_jsx("button", { className: ghostBtn, onClick: () => setToDelete(null), "data-testid": "posts-delete-cancel", children: "Cancel" }), _jsxs("button", { className: dangerBtn, onClick: () => toDelete && del.mutate(toDelete.id), disabled: del.isPending, "data-testid": "posts-delete-confirm", children: [_jsx(Trash2, { className: "size-3.5" }), " Delete"] })] })] }) })] }));
}
