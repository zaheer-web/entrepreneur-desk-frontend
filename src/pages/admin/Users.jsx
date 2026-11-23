import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MailPlus, X } from "lucide-react";
import { apiDelete, apiGet, apiPatch, apiPost, errorMessage } from "@/libs/api";
import { Field, PageHeader, Panel, goldBtn, inputCls } from "@/components/admin/Field";
import { AdminOnly, useAdmin } from "@/components/admin/AdminLayout";
const ROLE_HELP = {
    admin: "Admin — full access: all posts, categories, lists, gallery, users and settings.",
    author: "Author — can write, publish and manage only their own posts, and use the gallery.",
    pending: "Pending — signed up but has no access until you approve them.",
};
function UsersInner() {
    const { me } = useAdmin();
    const qc = useQueryClient();
    const users = useQuery({ queryKey: ["admin-users"], queryFn: () => apiGet("/users") });
    const invites = useQuery({ queryKey: ["admin-invites"], queryFn: () => apiGet("/admin/invites") });
    const [email, setEmail] = useState("");
    const setRole = useMutation({
        mutationFn: ({ id, role }) => apiPatch(`/users/${id}/role`, { role }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-users"] });
            toast.success("Role updated");
        },
        onError: (e) => toast.error(errorMessage(e, "Could not change role")),
    });
    const invite = useMutation({
        mutationFn: (e) => apiPost("/admin/invites", { email: e }),
        onSuccess: (i) => {
            qc.invalidateQueries({ queryKey: ["admin-invites"] });
            qc.invalidateQueries({ queryKey: ["admin-users"] });
            setEmail("");
            toast.success(`${i.email} will become an author when they sign up.`);
        },
        onError: (e) => toast.error(errorMessage(e, "Enter a valid email address")),
    });
    const revoke = useMutation({
        mutationFn: (e) => apiDelete(`/admin/invites/${encodeURIComponent(e)}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-invites"] }),
    });
    return (_jsxs("div", { "data-testid": "admin-users-page", children: [_jsx(PageHeader, { eyebrow: "Access", title: "Users & Authors" }), _jsxs("div", { className: "grid gap-6 xl:grid-cols-[1fr_380px]", children: [_jsxs(Panel, { title: "Team", description: "Everyone who has signed in to the newsroom. Change a role to grant or remove access.", children: [_jsxs("div", { className: "divide-y divide-hairline border border-hairline", children: [(users.data?.users ?? []).map((u) => (_jsxs("div", { className: "flex flex-col gap-3 bg-[#101012] px-4 py-3 sm:flex-row sm:items-center sm:justify-between", "data-testid": `users-row-${u.email || u.user_id}`, children: [_jsxs("div", { className: "min-w-0", children: [_jsxs("p", { className: "truncate text-white", children: [u.name || u.email, " ", u.user_id === me.user_id && _jsx("span", { className: "text-xs text-gold", children: "(you)" })] }), _jsx("p", { className: "truncate text-xs text-zinc-500", children: u.email })] }), _jsx("select", { value: u.role, onChange: (e) => setRole.mutate({ id: u.user_id, role: e.target.value }), className: `${inputCls} sm:w-36`, "data-testid": `users-role-select-${u.email || u.user_id}`, children: (users.data?.roles ?? []).map((r) => _jsx("option", { value: r, className: "capitalize", children: r }, r)) })] }, u.user_id))), users.data?.users.length === 0 && _jsx("p", { className: "px-4 py-5 text-sm text-zinc-500", children: "No users yet." })] }), _jsx("ul", { className: "space-y-1 text-xs text-zinc-500", children: Object.keys(ROLE_HELP).map((r) => _jsx("li", { children: ROLE_HELP[r] }, r)) })] }), _jsxs(Panel, { title: "Invite an author", description: "Pre-approve someone by email. When they sign up at /sign-up with that email (and verify it), they become an Author automatically.", children: [_jsxs("form", { onSubmit: (e) => {
                                    e.preventDefault();
                                    if (email.trim())
                                        invite.mutate(email.trim());
                                }, className: "space-y-3", children: [_jsx(Field, { label: "Author email", htmlFor: "invite-email", help: "The exact email address the writer will sign up with. Share the sign-up link with them: /sign-up", children: _jsx("input", { id: "invite-email", type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "writer@example.com", className: inputCls, "data-testid": "invite-email-input" }) }), _jsxs("button", { type: "submit", className: goldBtn, disabled: invite.isPending, "data-testid": "invite-submit-btn", children: [_jsx(MailPlus, { className: "size-4" }), " Add author"] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-[12px] font-semibold uppercase tracking-[0.12em] text-zinc-300", children: "Pre-approved emails" }), _jsxs("ul", { className: "mt-3 space-y-2", "data-testid": "invite-list", children: [(invites.data ?? []).map((i) => (_jsxs("li", { className: "flex items-center justify-between border border-hairline bg-[#101012] px-3 py-2 text-sm text-zinc-300", children: [i.email, _jsx("button", { onClick: () => revoke.mutate(i.email), className: "text-zinc-500 hover:text-red-400", "aria-label": "Remove invite", "data-testid": `invite-remove-${i.email}`, children: _jsx(X, { className: "size-4" }) })] }, i.email))), invites.data?.length === 0 && _jsx("li", { className: "text-sm text-zinc-500", children: "None yet." })] })] })] })] })] }));
}
export default function UsersPage() {
    return _jsx(AdminOnly, { children: _jsx(UsersInner, {}) });
}
