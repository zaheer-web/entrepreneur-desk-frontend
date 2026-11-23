import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Mail } from "lucide-react";
import { apiDownload, apiGet } from "@/libs/api";
import { PageHeader, ghostBtn, goldBtn } from "@/components/admin/Field";
import { AdminOnly } from "@/components/admin/AdminLayout";
import { cn } from "@/libs/utils";
const fmt = (d) => (d ? new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—");
function InboxInner() {
    const [params, setParams] = useSearchParams();
    const tab = params.get("tab") === "subscribers" ? "subscribers" : "submissions";
    const noms = useQuery({ queryKey: ["admin-nominations"], queryFn: () => apiGet("/admin/nominations") });
    const subs = useQuery({ queryKey: ["admin-subscribers"], queryFn: () => apiGet("/admin/subscribers") });
    const [open, setOpen] = useState(null);
    const [busy, setBusy] = useState(false);
    const download = async () => {
        setBusy(true);
        try {
            if (tab === "submissions")
                await apiDownload("/admin/nominations.csv", "get-featured-submissions.csv");
            else
                await apiDownload("/admin/subscribers.csv", "newsletter-subscribers.csv");
        }
        catch {
            toast.error("Export failed — try again.");
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsxs("div", { "data-testid": "admin-inbox-page", children: [_jsx(PageHeader, { eyebrow: "Reader inbox", title: "Inbox", actions: _jsxs("button", { className: goldBtn, onClick: download, disabled: busy, "data-testid": "inbox-export-btn", children: [_jsx(Download, { className: "size-4" }), " ", busy ? "Exporting…" : "Export to spreadsheet (CSV)"] }) }), _jsx("div", { className: "mb-6 flex gap-2", "data-testid": "inbox-tabs", children: [
                    { id: "submissions", label: `Get Featured submissions (${noms.data?.length ?? 0})` },
                    { id: "subscribers", label: `Newsletter subscribers (${subs.data?.length ?? 0})` },
                ].map((t) => (_jsx("button", { onClick: () => setParams(t.id === "subscribers" ? { tab: "subscribers" } : {}), className: cn("rounded-full border px-4 py-1.5 text-[12px]", tab === t.id ? "border-gold bg-gold text-ink" : "border-hairline text-zinc-400 hover:text-white"), "data-testid": `inbox-tab-${t.id}`, children: t.label }, t.id))) }), _jsx("p", { className: "mb-4 text-xs text-zinc-500", children: "The CSV opens in Excel, Google Sheets or Numbers." }), tab === "submissions" ? (_jsxs("div", { className: "divide-y divide-hairline border border-hairline", "data-testid": "inbox-submissions", children: [(noms.data ?? []).map((n) => (_jsxs("div", { className: "bg-card", "data-testid": `inbox-submission-${n.id}`, children: [_jsxs("button", { onClick: () => setOpen(open === n.id ? null : n.id), className: "flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[#18181B]", children: [_jsxs("div", { className: "min-w-0", children: [_jsxs("p", { className: "truncate text-white", children: [n.full_name, " ", _jsxs("span", { className: "text-zinc-500", children: ["\u00B7 ", n.company] })] }), _jsxs("p", { className: "truncate text-xs text-zinc-500", children: [n.email, " \u00B7 ", n.industry || "No industry", " \u00B7 ", fmt(n.created_at)] })] }), _jsx("span", { className: "shrink-0 text-xs text-gold", children: open === n.id ? "Hide" : "Read pitch" })] }), open === n.id && (_jsxs("div", { className: "space-y-3 border-t border-hairline px-5 py-4 text-sm", children: [_jsx("p", { className: "whitespace-pre-wrap leading-relaxed text-zinc-300", "data-testid": `inbox-pitch-${n.id}`, children: n.pitch }), _jsxs("p", { className: "text-xs text-zinc-500", children: ["Role: ", n.role || "—", " \u00B7 Website: ", n.website ? _jsx("a", { href: n.website, target: "_blank", rel: "noreferrer", className: "text-gold hover:underline", children: n.website }) : "—"] }), _jsxs("a", { href: `mailto:${n.email}?subject=${encodeURIComponent("Your Entrepreneur Desk submission")}`, className: ghostBtn, "data-testid": `inbox-reply-${n.id}`, children: [_jsx(Mail, { className: "size-3.5" }), " Reply by email"] })] }))] }, n.id))), noms.data?.length === 0 && _jsx("p", { className: "bg-card px-5 py-6 text-sm text-zinc-500", children: "No submissions yet." })] })) : (_jsxs("div", { className: "divide-y divide-hairline border border-hairline", "data-testid": "inbox-subscribers", children: [(subs.data ?? []).map((s) => (_jsxs("div", { className: "flex items-center justify-between bg-card px-5 py-3 text-sm", "data-testid": `inbox-subscriber-${s.email}`, children: [_jsx("span", { className: "text-white", children: s.email }), _jsx("span", { className: "text-xs text-zinc-500", children: fmt(s.created_at) })] }, s.email))), subs.data?.length === 0 && _jsx("p", { className: "bg-card px-5 py-6 text-sm text-zinc-500", children: "No subscribers yet." })] }))] }));
}
export default function InboxPage() {
    return _jsx(AdminOnly, { children: _jsx(InboxInner, {}) });
}
