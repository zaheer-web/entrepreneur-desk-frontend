import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PenSquare, Plus, Trash2 } from "lucide-react";
import { apiDelete, apiGet, apiPost, apiPut, errorMessage } from "@/libs/api";
import { Field, PageHeader, ghostBtn, goldBtn, inputCls, textareaCls } from "@/components/admin/Field";
import { AdminOnly } from "@/components/admin/AdminLayout";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
const EMPTY = { name: "", slug: "", description: "", seo_title: "", meta_description: "" };
function CategoriesInner() {
    const qc = useQueryClient();
    const cats = useQuery({ queryKey: ["admin-categories"], queryFn: () => apiGet("/admin/categories") });
    const [editing, setEditing] = useState(null);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const refresh = () => {
        qc.invalidateQueries({ queryKey: ["admin-categories"] });
        qc.invalidateQueries({ queryKey: ["categories"] });
        qc.invalidateQueries({ queryKey: ["admin-stats"] });
    };
    const save = useMutation({
        mutationFn: (body) => (editing ? apiPut(`/admin/categories/${editing.id}`, body) : apiPost("/admin/categories", body)),
        onSuccess: () => {
            refresh();
            toast.success(editing ? "Category updated" : "Category created");
            setOpen(false);
        },
        onError: (e) => toast.error(errorMessage(e, "Could not save")),
    });
    const del = useMutation({
        mutationFn: (id) => apiDelete(`/admin/categories/${id}`),
        onSuccess: () => {
            refresh();
            toast.success("Category deleted");
        },
        onError: (e) => toast.error(errorMessage(e, "Could not delete")),
    });
    const startEdit = (c) => {
        setEditing(c);
        setForm(c ? { name: c.name, slug: c.slug, description: c.description, seo_title: c.seo_title, meta_description: c.meta_description } : EMPTY);
        setOpen(true);
    };
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    return (_jsxs("div", { "data-testid": "admin-categories-page", children: [_jsx(PageHeader, { eyebrow: "Taxonomy", title: "Manage Categories", actions: _jsxs("button", { className: goldBtn, onClick: () => startEdit(null), "data-testid": "categories-add-btn", children: [_jsx(Plus, { className: "size-4" }), " New category"] }) }), _jsx("div", { className: "grid gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-3", children: (cats.data ?? []).map((c) => (_jsxs("div", { className: "flex items-start justify-between gap-3 bg-card p-5", "data-testid": `category-card-${c.slug}`, children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "font-heading text-lg text-white", children: c.name }), _jsxs("p", { className: "mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500", children: ["/", c.slug, " \u00B7 ", c.post_count, " posts"] }), c.description && _jsx("p", { className: "mt-2 line-clamp-2 text-sm text-zinc-400", children: c.description })] }), _jsxs("div", { className: "flex shrink-0 gap-1", children: [_jsx("button", { onClick: () => startEdit(c), className: "grid size-8 place-items-center text-zinc-400 hover:text-gold", "aria-label": "Edit", "data-testid": `category-edit-${c.slug}`, children: _jsx(PenSquare, { className: "size-4" }) }), _jsx("button", { onClick: () => {
                                        if (window.confirm(`Delete “${c.name}”?`))
                                            del.mutate(c.id);
                                    }, className: "grid size-8 place-items-center text-zinc-400 hover:text-red-400", "aria-label": "Delete", "data-testid": `category-delete-${c.slug}`, children: _jsx(Trash2, { className: "size-4" }) })] })] }, c.id))) }), _jsx(Dialog, { open: open, onOpenChange: setOpen, children: _jsxs(DialogContent, { className: "max-w-lg rounded-sm border-hairline bg-popover sm:max-w-lg", "data-testid": "category-dialog", children: [_jsx(DialogTitle, { className: "font-heading text-xl text-white", children: editing ? "Edit category" : "New category" }), _jsxs("form", { className: "mt-2 space-y-5", onSubmit: (e) => {
                                e.preventDefault();
                                save.mutate(form);
                            }, children: [_jsx(Field, { label: "Name", required: true, htmlFor: "cat-name", help: "The category name readers see on filters and article labels, e.g. \u201CFinTech\u201D or \u201CWomen Founders\u201D.", children: _jsx("input", { id: "cat-name", required: true, minLength: 2, value: form.name, onChange: (e) => set("name", e.target.value), className: inputCls, "data-testid": "category-name-input" }) }), _jsx(Field, { label: "Slug", htmlFor: "cat-slug", help: "URL-friendly version of the name (lowercase, hyphens). Leave empty to generate it from the name.", children: _jsx("input", { id: "cat-slug", value: form.slug, onChange: (e) => set("slug", e.target.value), className: inputCls, placeholder: "women-founders", "data-testid": "category-slug-input" }) }), _jsx(Field, { label: "Description", htmlFor: "cat-desc", help: "One or two sentences explaining what kind of stories go in this category. Helps your editors stay consistent.", children: _jsx("textarea", { id: "cat-desc", rows: 2, value: form.description, onChange: (e) => set("description", e.target.value), className: textareaCls, "data-testid": "category-description-input" }) }), _jsx(Field, { label: "SEO title", htmlFor: "cat-seo", help: "Search-result title for this category's listing, e.g. \u201CFinTech Founder Stories & Interviews\u201D. Optional.", children: _jsx("input", { id: "cat-seo", value: form.seo_title, onChange: (e) => set("seo_title", e.target.value), className: inputCls, "data-testid": "category-seo-title-input" }) }), _jsx(Field, { label: "Meta description", htmlFor: "cat-meta", help: "Search-result description for this category (120\u2013160 characters). Optional.", children: _jsx("textarea", { id: "cat-meta", rows: 2, value: form.meta_description, onChange: (e) => set("meta_description", e.target.value), className: textareaCls, "data-testid": "category-meta-input" }) }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { type: "button", className: ghostBtn, onClick: () => setOpen(false), "data-testid": "category-cancel-btn", children: "Cancel" }), _jsx("button", { type: "submit", className: goldBtn, disabled: save.isPending, "data-testid": "category-save-btn", children: save.isPending ? "Saving…" : "Save category" })] })] })] }) }), _jsx("p", { className: "mt-6 text-xs text-zinc-500", children: "A category that still has posts can't be deleted \u2014 move those posts to another category first." })] }));
}
export default function Categories() {
    return (_jsx(AdminOnly, { children: _jsx(CategoriesInner, {}) }));
}
