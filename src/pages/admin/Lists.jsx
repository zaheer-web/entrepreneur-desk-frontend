import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDown, ArrowLeft, ArrowUp, ChevronDown, ExternalLink, FileText, PenSquare, Plus, Save, Trash2 } from "lucide-react";
import { apiDelete, apiGet, apiPost, apiPut, errorMessage } from "@/libs/api";
import { Field, PageHeader, Panel, ghostBtn, goldBtn, inputCls, textareaCls } from "@/components/admin/Field";
import { ImageInput } from "@/components/admin/MediaPicker";
import { AdminOnly } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/pages/admin/Posts";
import { cn } from "@/libs/utils";
function ListsIndexInner() {
    const qc = useQueryClient();
    const lists = useQuery({ queryKey: ["admin-lists"], queryFn: () => apiGet("/admin/lists") });
    const del = useMutation({
        mutationFn: (id) => apiDelete(`/admin/lists/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-lists"] });
            qc.invalidateQueries({ queryKey: ["lists"] });
            toast.success("List deleted");
        },
        onError: (e) => toast.error(errorMessage(e, "Could not delete")),
    });
    return (_jsxs("div", { "data-testid": "admin-lists-page", children: [_jsx(PageHeader, { eyebrow: "Rankings", title: "Manage Lists", actions: _jsxs(Link, { to: "/admin/lists/new", className: goldBtn, "data-testid": "lists-add-btn", children: [_jsx(Plus, { className: "size-4" }), " New list"] }) }), _jsx("p", { className: "mb-6 max-w-2xl text-sm text-zinc-400", children: "Create ranked lists like \u201C30 Under 30\u201D, \u201C40 Under 40\u201D or \u201CTop 10 Manufacturing Entrepreneurs\u201D. Each entry can link to a published post." }), _jsxs("div", { className: "divide-y divide-hairline border border-hairline", children: [(lists.data ?? []).map((l) => (_jsxs("div", { className: "flex items-center justify-between gap-4 bg-card px-5 py-4", "data-testid": `lists-row-${l.slug}`, children: [_jsxs("div", { className: "min-w-0", children: [_jsxs(Link, { to: `/admin/lists/${l.id}`, className: "font-heading text-lg text-white hover:text-gold", children: [l.title, " ", _jsx("span", { className: "font-mono text-xs text-zinc-500", children: l.year })] }), _jsxs("p", { className: "text-xs text-zinc-500", children: [l.count, " entries \u00B7 /lists?list=", l.slug] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(StatusBadge, { status: l.status }), l.status === "published" && _jsx("a", { href: `/lists?list=${l.slug}`, target: "_blank", rel: "noreferrer", className: "grid size-8 place-items-center text-zinc-400 hover:text-gold", "aria-label": "View", "data-testid": `lists-view-${l.slug}`, children: _jsx(ExternalLink, { className: "size-4" }) }), _jsx(Link, { to: `/admin/lists/${l.id}`, className: "grid size-8 place-items-center text-zinc-400 hover:text-gold", "aria-label": "Edit", "data-testid": `lists-edit-${l.slug}`, children: _jsx(PenSquare, { className: "size-4" }) }), _jsx("button", { onClick: () => { if (window.confirm(`Delete “${l.title}”?`))
                                            del.mutate(l.id); }, className: "grid size-8 place-items-center text-zinc-400 hover:text-red-400", "aria-label": "Delete", "data-testid": `lists-delete-${l.slug}`, children: _jsx(Trash2, { className: "size-4" }) })] })] }, l.id))), lists.data?.length === 0 && _jsx("p", { className: "bg-card px-5 py-6 text-sm text-zinc-500", children: "No lists yet." })] })] }));
}
const EMPTY_LIST = { title: "", slug: "", year: new Date().getFullYear(), description: "", status: "draft", cover_image: "", seo_title: "", meta_description: "", entries: [] };
const EMPTY_ENTRY = { rank: 0, name: "", age: null, company: "", industry: "", country: "", image: "", highlight: "", metric: "", post_slug: "" };
function EntryEditor({ entry, index, total, posts, onChange, onMove, onRemove, open, onToggle }) {
    const set = (k, v) => onChange({ ...entry, [k]: v });
    return (_jsxs("div", { className: "border border-hairline bg-[#101012]", "data-testid": `list-entry-editor-${index}`, children: [_jsxs("div", { className: "flex items-center gap-3 px-4 py-3", children: [_jsx("span", { className: "w-8 font-heading text-xl italic text-gold", children: String(index + 1).padStart(2, "0") }), entry.image ? _jsx("img", { src: entry.image, alt: "", className: "size-9 object-cover" }) : _jsx("span", { className: "size-9 bg-card" }), _jsxs("button", { type: "button", onClick: onToggle, className: "flex min-w-0 flex-1 items-center gap-2 text-left", "data-testid": `list-entry-toggle-${index}`, children: [_jsx("span", { className: "truncate text-white", children: entry.name || "New entry" }), _jsx("span", { className: "truncate text-xs text-zinc-500", children: entry.company }), _jsx(ChevronDown, { className: cn("ml-auto size-4 shrink-0 text-zinc-500 transition-transform duration-200", open && "rotate-180") })] }), _jsx("button", { type: "button", disabled: index === 0, onClick: () => onMove(-1), className: "grid size-7 place-items-center text-zinc-400 hover:text-white disabled:opacity-30", "aria-label": "Move up", "data-testid": `list-entry-up-${index}`, children: _jsx(ArrowUp, { className: "size-4" }) }), _jsx("button", { type: "button", disabled: index === total - 1, onClick: () => onMove(1), className: "grid size-7 place-items-center text-zinc-400 hover:text-white disabled:opacity-30", "aria-label": "Move down", "data-testid": `list-entry-down-${index}`, children: _jsx(ArrowDown, { className: "size-4" }) }), _jsx("button", { type: "button", onClick: onRemove, className: "grid size-7 place-items-center text-zinc-400 hover:text-red-400", "aria-label": "Remove", "data-testid": `list-entry-remove-${index}`, children: _jsx(Trash2, { className: "size-4" }) })] }), open && (_jsxs("div", { className: "grid gap-5 border-t border-hairline p-4 md:grid-cols-2", children: [_jsx(Field, { label: "Name", required: true, help: "Full name of the entrepreneur as it should appear on the list.", children: _jsx("input", { value: entry.name, onChange: (e) => set("name", e.target.value), className: inputCls, "data-testid": `list-entry-name-${index}` }) }), _jsx(Field, { label: "Age", help: "Their age this year (numbers only). Leave empty for lists that aren't age-based.", children: _jsx("input", { type: "number", min: 0, max: 120, value: entry.age ?? "", onChange: (e) => set("age", e.target.value === "" ? null : Number(e.target.value)), className: inputCls, "data-testid": `list-entry-age-${index}` }) }), _jsx(Field, { label: "Company", help: "The company they founded or lead.", children: _jsx("input", { value: entry.company, onChange: (e) => set("company", e.target.value), className: inputCls, "data-testid": `list-entry-company-${index}` }) }), _jsx(Field, { label: "Industry", help: "Sector used for the filter pills on the list page, e.g. \u201CClimate\u201D, \u201CFinTech\u201D, \u201CManufacturing\u201D.", children: _jsx("input", { value: entry.industry, onChange: (e) => set("industry", e.target.value), className: inputCls, "data-testid": `list-entry-industry-${index}` }) }), _jsx(Field, { label: "Country", help: "Where they're based, e.g. \u201CIndia\u201D or \u201CUnited Kingdom\u201D.", children: _jsx("input", { value: entry.country, onChange: (e) => set("country", e.target.value), className: inputCls, "data-testid": `list-entry-country-${index}` }) }), _jsx(Field, { label: "Headline metric", help: "One standout number that proves their impact, e.g. \u201C$420M ARR\u201D or \u201C2 GWh deployed\u201D.", children: _jsx("input", { value: entry.metric, onChange: (e) => set("metric", e.target.value), className: inputCls, "data-testid": `list-entry-metric-${index}` }) }), _jsx(Field, { label: "Why they made the list", className: "md:col-span-2", help: "One sentence on what makes them remarkable. Shown when readers open the profile.", children: _jsx("textarea", { rows: 2, value: entry.highlight, onChange: (e) => set("highlight", e.target.value), className: textareaCls, "data-testid": `list-entry-highlight-${index}` }) }), _jsx(Field, { label: "Portrait", help: "A square or portrait photo of the person. Pick from the gallery or paste a link.", children: _jsx(ImageInput, { value: entry.image, onChange: (v) => set("image", v), testId: `list-entry-image-${index}` }) }), _jsx(Field, { label: "Linked post", help: "Optional. Connect a published story or interview about this person \u2014 readers get a \u201CRead the story\u201D button.", children: _jsxs("select", { value: entry.post_slug, onChange: (e) => set("post_slug", e.target.value), className: inputCls, "data-testid": `list-entry-post-${index}`, children: [_jsx("option", { value: "", children: "\u2014 No linked post \u2014" }), posts.map((p) => _jsx("option", { value: p.slug, children: p.title }, p.id))] }) })] }))] }));
}
function ListEditorInner() {
    const { id } = useParams();
    const isNew = !id || id === "new";
    const navigate = useNavigate();
    const qc = useQueryClient();
    const existing = useQuery({ queryKey: ["admin-list", id], queryFn: () => apiGet(`/admin/lists/${id}`), enabled: !isNew, retry: false });
    const posts = useQuery({ queryKey: ["admin-posts", "", "published", ""], queryFn: () => apiGet("/admin/posts?status=published") });
    const [form, setForm] = useState(EMPTY_LIST);
    const [openIdx, setOpenIdx] = useState(null);
    const [fromPost, setFromPost] = useState("");
    useEffect(() => {
        if (existing.data) {
            const { id: _i, updated_at: _u, ...rest } = existing.data;
            setForm(rest);
        }
    }, [existing.data]);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const setEntries = (fn) => setForm((f) => ({ ...f, entries: fn(f.entries) }));
    const save = useMutation({
        mutationFn: (body) => (isNew ? apiPost("/admin/lists", body) : apiPut(`/admin/lists/${id}`, body)),
        onSuccess: (l) => {
            qc.invalidateQueries({ queryKey: ["admin-lists"] });
            qc.invalidateQueries({ queryKey: ["lists"] });
            qc.invalidateQueries({ queryKey: ["list"] });
            qc.setQueryData(["admin-list", l.id], l);
            toast.success(l.status === "published" ? "List published" : "List saved as draft");
            if (isNew)
                navigate(`/admin/lists/${l.id}`, { replace: true });
        },
        onError: (e) => toast.error(errorMessage(e, "Could not save list")),
    });
    const submit = (status) => {
        if (form.title.trim().length < 2)
            return toast.error("Give the list a title first.");
        const bad = form.entries.findIndex((e) => !e.name.trim());
        if (bad >= 0) {
            setOpenIdx(bad);
            return toast.error(`Entry ${bad + 1} needs a name.`);
        }
        save.mutate({ ...form, status });
    };
    const addFromPost = () => {
        const p = (posts.data ?? []).find((x) => x.slug === fromPost);
        if (!p)
            return;
        setEntries((es) => [...es, { ...EMPTY_ENTRY, name: p.person || p.title, company: p.company, image: p.image, highlight: p.dek, industry: p.category, post_slug: p.slug }]);
        setOpenIdx(form.entries.length);
        setFromPost("");
    };
    if (!isNew && existing.isError)
        return _jsx("p", { className: "text-muted-foreground", "data-testid": "list-editor-not-found", children: "List not found." });
    return (_jsxs("div", { "data-testid": "list-editor", children: [_jsxs(Link, { to: "/admin/lists", className: "inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 hover:text-gold", "data-testid": "list-editor-back-link", children: [_jsx(ArrowLeft, { className: "size-3.5" }), " All lists"] }), _jsx(PageHeader, { eyebrow: isNew ? "New list" : `Editing · ${existing.data?.status ?? ""}`, title: form.title || "Untitled list", actions: _jsxs(_Fragment, { children: [_jsxs("button", { className: ghostBtn, onClick: () => submit("draft"), disabled: save.isPending, "data-testid": "list-save-draft-btn", children: [_jsx(Save, { className: "size-3.5" }), " Save draft"] }), _jsx("button", { className: goldBtn, onClick: () => submit("published"), disabled: save.isPending, "data-testid": "list-publish-btn", children: save.isPending ? "Saving…" : "Publish list" })] }) }), _jsxs("div", { className: "grid gap-6 xl:grid-cols-[1fr_360px]", children: [_jsxs(Panel, { title: `Entries (${form.entries.length})`, description: "Order matters \u2014 the first entry is #01. Use the arrows to re-rank.", children: [_jsx("div", { className: "space-y-2", children: form.entries.map((e, i) => (_jsx(EntryEditor, { entry: e, index: i, total: form.entries.length, posts: posts.data ?? [], open: openIdx === i, onToggle: () => setOpenIdx(openIdx === i ? null : i), onChange: (ne) => setEntries((es) => es.map((x, j) => (j === i ? ne : x))), onMove: (dir) => {
                                        setEntries((es) => {
                                            const c = [...es];
                                            [c[i], c[i + dir]] = [c[i + dir], c[i]];
                                            return c;
                                        });
                                        setOpenIdx(null);
                                    }, onRemove: () => {
                                        setEntries((es) => es.filter((_, j) => j !== i));
                                        setOpenIdx(null);
                                    } }, i))) }), _jsxs("div", { className: "flex flex-col gap-3 border-t border-hairline pt-5 md:flex-row md:items-center", children: [_jsxs("button", { type: "button", className: ghostBtn, onClick: () => { setEntries((es) => [...es, { ...EMPTY_ENTRY }]); setOpenIdx(form.entries.length); }, "data-testid": "list-add-entry-btn", children: [_jsx(Plus, { className: "size-3.5" }), " Add entry"] }), _jsx("span", { className: "text-xs text-zinc-500", children: "or" }), _jsxs("select", { value: fromPost, onChange: (e) => setFromPost(e.target.value), className: cn(inputCls, "md:max-w-xs"), "data-testid": "list-add-from-post-select", children: [_jsx("option", { value: "", children: "Add from a published post\u2026" }), (posts.data ?? []).map((p) => _jsx("option", { value: p.slug, children: p.title }, p.id))] }), _jsxs("button", { type: "button", className: ghostBtn, disabled: !fromPost, onClick: addFromPost, "data-testid": "list-add-from-post-btn", children: [_jsx(FileText, { className: "size-3.5" }), " Add post"] })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Panel, { title: "List details", children: [_jsx(Field, { label: "Title", required: true, help: "The list name, e.g. \u201C40 Under 40\u201D or \u201CTop 10 Manufacturing Entrepreneurs\u201D. The first word is set in white, the rest in gold.", children: _jsx("input", { value: form.title, onChange: (e) => set("title", e.target.value), className: inputCls, "data-testid": "list-title-input" }) }), _jsx(Field, { label: "Slug", help: "Web address of the list: /lists?list=your-slug. Leave empty to generate from the title.", children: _jsx("input", { value: form.slug, onChange: (e) => set("slug", e.target.value), className: cn(inputCls, "font-mono"), placeholder: "40-under-40", "data-testid": "list-slug-input" }) }), _jsx(Field, { label: "Year", help: "The edition year shown next to the title, e.g. 2026.", children: _jsx("input", { type: "number", value: form.year, onChange: (e) => set("year", Number(e.target.value) || new Date().getFullYear()), className: inputCls, "data-testid": "list-year-input" }) }), _jsx(Field, { label: "Description", help: "One or two sentences introducing the list and its selection criteria. Shown at the top of the list page.", children: _jsx("textarea", { rows: 3, value: form.description, onChange: (e) => set("description", e.target.value), className: textareaCls, "data-testid": "list-description-input" }) }), _jsx(Field, { label: "Cover image", help: "Optional banner image used when the list is shared on social media.", children: _jsx(ImageInput, { value: form.cover_image, onChange: (v) => set("cover_image", v), testId: "list-cover" }) })] }), _jsxs(Panel, { title: "SEO", children: [_jsx(Field, { label: "SEO title", help: "Search-result title, e.g. \u201C30 Under 30 2026: The Founders Reshaping Business\u201D. Leave empty to use the list title.", counter: { value: form.seo_title.length, ideal: [30, 60] }, children: _jsx("input", { value: form.seo_title, onChange: (e) => set("seo_title", e.target.value), className: inputCls, "data-testid": "list-seo-title-input" }) }), _jsx(Field, { label: "Meta description", help: "Search-result description (120\u2013160 characters). Leave empty to use the description.", counter: { value: form.meta_description.length, ideal: [120, 160] }, children: _jsx("textarea", { rows: 3, value: form.meta_description, onChange: (e) => set("meta_description", e.target.value), className: textareaCls, "data-testid": "list-meta-input" }) })] })] })] })] }));
}
export function ListsIndex() {
    return _jsx(AdminOnly, { children: _jsx(ListsIndexInner, {}) });
}
export function ListEditor() {
    return _jsx(AdminOnly, { children: _jsx(ListEditorInner, {}) });
}
