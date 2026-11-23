import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, CalendarClock, CheckCircle2, Circle, ExternalLink, RefreshCw, Save, Send } from "lucide-react";
import { apiGet, apiPost, apiPut, errorMessage } from "@/libs/api";
import { NEWS_REGIONS } from "@/libs/types";
import { Field, Panel, Switch, ghostBtn, goldBtn, inputCls, textareaCls } from "@/components/admin/Field";
import { ImageInput } from "@/components/admin/MediaPicker";
import RichEditor from "@/components/admin/RichEditor";
import { useAdmin } from "@/components/admin/AdminLayout";
import { cn } from "@/libs/utils";
const EMPTY = {
    title: "", slug: "", type: "story", status: "draft", dek: "", content_html: "", category: "", tags: [],
    person: "", company: "", author: "", region: "", image: "", image_alt: "", featured: false, breaking: false,
    pull_quote: "", published_at: "", scheduled_at: "", seo_title: "", meta_description: "", focus_keyword: "", canonical_url: "",
    og_title: "", og_description: "", og_image: "", noindex: false, schema_type: "Article",
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** Legacy seeded posts store paragraphs / Q&A separately — fold them into editable HTML. */
function toEditable(p = {}) {
    const {
        id: _i,
        author_id: _a,
        read_minutes: _r,
        body = [],
        qa = [],
        indexing: _x,
        created_at: _c,
        updated_at: _u,
        ...rest
    } = p || {};

    const safeBody = Array.isArray(body) ? body : [];
    const safeQa = Array.isArray(qa) ? qa : [];
    let html = typeof rest.content_html === "string" ? rest.content_html : "";

    if (!html && safeBody.length) {
        html = safeBody.map((b) => `<p>${esc(String(b ?? ""))}</p>`).join("");
    }

    if (!html && safeQa.length) {
        html = safeQa
            .map((x) => `<h3>${esc(String(x?.q ?? ""))}</h3><p>${esc(String(x?.a ?? ""))}</p>`)
            .join("");
    }

    const editable = { ...EMPTY, ...rest };

    // Older database records may not contain every field. Keep controlled inputs safe.
    const stringFields = [
        "title", "slug", "type", "status", "dek", "category", "person",
        "company", "author", "region", "image", "image_alt", "pull_quote",
        "published_at", "scheduled_at", "seo_title", "meta_description",
        "focus_keyword", "canonical_url", "og_title", "og_description",
        "og_image", "schema_type",
    ];

    for (const field of stringFields) {
        editable[field] = typeof editable[field] === "string" ? editable[field] : (EMPTY[field] ?? "");
    }

    return {
        ...editable,
        tags: Array.isArray(editable.tags) ? editable.tags : [],
        content_html: html,
        featured: Boolean(editable.featured),
        breaking: Boolean(editable.breaking),
        noindex: Boolean(editable.noindex),
    };
}
/** ISO (UTC) <-> <input type="datetime-local"> value in the user's own timezone. */
const toLocalInput = (iso) => {
    if (!iso)
        return "";
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? "" : new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const fromLocalInput = (v) => (v ? new Date(v).toISOString() : "");
const slugify = (s) => s.normalize("NFKD").replace(/[^\w\s-]/g, "").trim().toLowerCase().replace(/[\s_-]+/g, "-").slice(0, 100);
const plain = (html) => String(html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
export default function PostEditor() {
    const { id } = useParams();
    const isNew = !id;
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { me } = useAdmin();
    const existing = useQuery({ queryKey: ["admin-post", id], queryFn: () => apiGet(`/admin/posts/${id}`), enabled: !isNew, retry: false });
    const cats = useQuery({ queryKey: ["admin-categories"], queryFn: () => apiGet("/admin/categories") });
    const [form, setForm] = useState({ ...EMPTY, author: me.name });
    const [tagInput, setTagInput] = useState("");
    const [slugTouched, setSlugTouched] = useState(false);
    const [loadedId, setLoadedId] = useState(null);
    useEffect(() => {
        if (existing.data && loadedId !== existing.data.id) {
            setForm(toEditable(existing.data));
            setTagInput(Array.isArray(existing.data.tags) ? existing.data.tags.join(", ") : "");
            setSlugTouched(true);
            setLoadedId(existing.data.id);
        }
    }, [existing.data, loadedId]);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const save = useMutation({
        mutationFn: (body) => (isNew ? apiPost("/admin/posts", body) : apiPut(`/admin/posts/${id}`, body)),
        onSuccess: (post) => {
            qc.invalidateQueries({ queryKey: ["admin-posts"] });
            qc.invalidateQueries({ queryKey: ["admin-stats"] });
            qc.invalidateQueries({ queryKey: ["stories"] });
            qc.invalidateQueries({ queryKey: ["news"] });
            qc.setQueryData(["admin-post", post.id], post);
            setLoadedId(null);
            toast.success(post.status === "published"
                ? "Published — search engines are being notified."
                : post.status === "scheduled"
                    ? `Scheduled — goes live ${new Date(post.scheduled_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}.`
                    : "Draft saved.");
            if (isNew)
                navigate(`/admin/posts/${post.id}`, { replace: true });
        },
        onError: (e) => toast.error(errorMessage(e, "Could not save the post")),
    });
    const reindex = useMutation({
        mutationFn: () => apiPost(`/admin/posts/${id}/reindex`),
        onSuccess: (post) => {
            qc.setQueryData(["admin-post", post.id], post);
            toast.success("Search engines notified again.");
        },
        onError: (e) => toast.error(errorMessage(e, "Could not ping search engines")),
    });
    const submit = (status) => {
        if ((form.title || "").trim().length < 3) {
            toast.error("Add a title (at least 3 characters) first.");
            return;
        }
        const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);
        if (status === "scheduled" && (!form.scheduled_at || new Date(form.scheduled_at) <= new Date())) {
            toast.error("Pick a future date and time to schedule this post.");
            return;
        }
        save.mutate({ ...form, status, tags, scheduled_at: status === "scheduled" ? form.scheduled_at : "" });
    };
    const words = plain(form.content_html || "").split(" ").filter(Boolean).length;
    const seoTitle = form.seo_title || form.title || "";
    const metaDesc = form.meta_description || form.dek || "";
    const kw = (form.focus_keyword || "").trim().toLowerCase();
    const checks = useMemo(() => [
        { ok: !!kw && seoTitle.toLowerCase().includes(kw), label: "Focus keyword appears in the SEO title" },
        { ok: !!kw && metaDesc.toLowerCase().includes(kw), label: "Focus keyword appears in the meta description" },
        { ok: !!kw && plain(form.content_html).toLowerCase().slice(0, 600).includes(kw), label: "Focus keyword appears in the opening paragraph" },
        { ok: seoTitle.length >= 30 && seoTitle.length <= 60, label: "SEO title is 30–60 characters" },
        { ok: metaDesc.length >= 120 && metaDesc.length <= 160, label: "Meta description is 120–160 characters" },
        { ok: words >= 300, label: `Article has 300+ words (now ${words})` },
        { ok: /<h2/i.test(form.content_html), label: "Article uses at least one H2 subheading" },
        { ok: !!form.image && !!form.image_alt, label: "Featured image with alt text is set" },
    ], [kw, seoTitle, metaDesc, form.content_html, form.image, form.image_alt, words]);
    const score = checks.filter((c) => c.ok).length;
    if (!isNew && existing.isError) {
        return (_jsxs("div", { "data-testid": "post-editor-not-found", children: [_jsx("p", { className: "text-muted-foreground", children: "This post doesn't exist or you don't have access to it." }), _jsx(Link, { to: "/admin/posts", className: cn(ghostBtn, "mt-4"), children: "Back to posts" })] }));
    }
    if (!isNew && !loadedId)
        return _jsx("p", { className: "font-mono text-xs uppercase tracking-[0.2em] text-zinc-500", children: "Loading post\u2026" });
    const post = existing.data;
    const publicPath = `/story/${form.slug}`;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return (_jsxs("div", { "data-testid": "post-editor", children: [_jsxs("div", { className: "mb-6 flex flex-col justify-between gap-4 border-b border-hairline pb-6 md:flex-row md:items-end", children: [_jsxs("div", { children: [_jsxs(Link, { to: "/admin/posts", className: "inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 hover:text-gold", "data-testid": "post-editor-back-link", children: [_jsx(ArrowLeft, { className: "size-3.5" }), " All posts"] }), _jsx("h1", { className: "mt-3 font-heading text-3xl font-semibold text-white sm:text-4xl", children: isNew ? "Add Post" : "Edit Post" }), post && (_jsxs("p", { className: "mt-2 text-xs text-zinc-500", children: [_jsx("span", { className: cn("mr-2 rounded-full px-2 py-0.5 font-mono uppercase", post.status === "published" ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-700/40 text-zinc-300"), "data-testid": "post-editor-status-badge", children: post.status }), "Last saved ", new Date(post.updated_at).toLocaleString()] }))] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [post?.status === "published" && (_jsxs("a", { href: publicPath, target: "_blank", rel: "noreferrer", className: ghostBtn, "data-testid": "post-editor-view-live-link", children: [_jsx(ExternalLink, { className: "size-3.5" }), " View live"] })), _jsxs("button", { type: "button", className: ghostBtn, onClick: () => submit("draft"), disabled: save.isPending, "data-testid": "post-editor-save-draft-btn", children: [_jsx(Save, { className: "size-3.5" }), " ", post?.status === "published" ? "Unpublish & save draft" : "Save draft"] }), form.scheduled_at && post?.status !== "published" && (_jsxs("button", { type: "button", className: ghostBtn, onClick: () => submit("scheduled"), disabled: save.isPending, "data-testid": "post-editor-schedule-btn", children: [_jsx(CalendarClock, { className: "size-3.5" }), " ", post?.status === "scheduled" ? "Update schedule" : "Schedule"] })), _jsxs("button", { type: "button", className: goldBtn, onClick: () => submit("published"), disabled: save.isPending, "data-testid": "post-editor-publish-btn", children: [_jsx(Send, { className: "size-3.5" }), " ", save.isPending ? "Saving…" : post?.status === "published" ? "Update" : "Publish now"] })] })] }), _jsxs("div", { className: "grid gap-6 xl:grid-cols-[1fr_340px]", children: [_jsxs("div", { className: "min-w-0 space-y-6", children: [_jsxs(Panel, { title: "Article", description: "The content readers see on the story page.", children: [_jsx(Field, { label: "Title", htmlFor: "pe-title", required: true, help: "The headline shown on the article page and in cards. Make it specific and compelling \u2014 e.g. \u201CHow Maya Chen built a $1B AI company at 27\u201D.", counter: { value: (form.title || "").length, ideal: [30, 70] }, children: _jsx("input", { id: "pe-title", value: form.title || "", onChange: (e) => {
                                                set("title", e.target.value);
                                                if (!slugTouched)
                                                    set("slug", slugify(e.target.value));
                                            }, className: cn(inputCls, "h-12 font-heading text-xl"), placeholder: "Headline of the article", "data-testid": "post-title-input" }) }), _jsx(Field, { label: "URL slug", htmlFor: "pe-slug", help: `The web address of this article: ${origin}/story/${form.slug || "your-slug"}. Use short, lowercase words separated by hyphens. Auto-filled from the title.`, children: _jsx("input", { id: "pe-slug", value: form.slug || "", onChange: (e) => {
                                                setSlugTouched(true);
                                                set("slug", slugify(e.target.value));
                                            }, className: cn(inputCls, "font-mono"), placeholder: "how-maya-chen-built-synapse", "data-testid": "post-slug-input" }) }), _jsx(Field, { label: "Summary (standfirst)", htmlFor: "pe-dek", help: "1\u20132 sentences shown under the headline and on story cards. Also used as the meta description if you leave the SEO one empty.", counter: { value: (form.dek || "").length, ideal: [80, 200] }, children: _jsx("textarea", { id: "pe-dek", rows: 3, value: form.dek || "", onChange: (e) => set("dek", e.target.value), className: textareaCls, placeholder: "A short, intriguing summary of the story.", "data-testid": "post-dek-input" }) }), _jsx(Field, { label: "Detailed article", help: "The full article. Use H2 for main sections and H3 for sub-sections, add links and images from the gallery, and quotes for key lines. For interviews, put each question as an H3 followed by the answer.", children: _jsx(RichEditor, { value: form.content_html || "", onChange: (html) => set("content_html", html) }, loadedId ?? "new") }), _jsx(Field, { label: "Pull quote", htmlFor: "pe-quote", help: "Optional. One memorable line from the founder, displayed large inside the article. Leave empty to skip.", children: _jsx("textarea", { id: "pe-quote", rows: 2, value: form.pull_quote || "", onChange: (e) => set("pull_quote", e.target.value), className: textareaCls, placeholder: "\u201CWe never set out to build a unicorn\u2026\u201D", "data-testid": "post-pull-quote-input" }) })] }), _jsxs(Panel, { title: "SEO & indexing", description: "Controls how this article appears in Google, Bing and social shares.", children: [_jsxs("div", { className: "rounded-sm border border-hairline bg-white p-4", "data-testid": "seo-google-preview", children: [_jsxs("p", { className: "truncate text-[12px] text-[#202124]", children: [origin.replace(/^https?:\/\//, ""), " \u203A story \u203A ", form.slug || "slug"] }), _jsx("p", { className: "mt-1 truncate text-[18px] leading-snug text-[#1a0dab]", children: (seoTitle || "Your SEO title") + " | Entrepreneur Desk" }), _jsx("p", { className: "mt-1 line-clamp-2 text-[13px] text-[#4d5156]", children: metaDesc || "Your meta description will appear here." })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsx(Field, { label: "SEO title", htmlFor: "pe-seo-title", help: "The clickable blue headline in Google results (the browser tab title). Keep it 30\u201360 characters and include your focus keyword. Leave empty to use the article title.", counter: { value: (form.seo_title || "").length, ideal: [30, 60] }, children: _jsx("input", { id: "pe-seo-title", value: form.seo_title || "", onChange: (e) => set("seo_title", e.target.value), className: inputCls, placeholder: form.title || "SEO title", "data-testid": "post-seo-title-input" }) }), _jsx(Field, { label: "Focus keyword", htmlFor: "pe-kw", help: "The main search phrase you want this article to rank for, e.g. \u201Cyoung AI founder India\u201D. Used for the SEO checklist below.", children: _jsx("input", { id: "pe-kw", value: form.focus_keyword || "", onChange: (e) => set("focus_keyword", e.target.value), className: inputCls, placeholder: "e.g. fintech founder interview", "data-testid": "post-focus-keyword-input" }) })] }), _jsx(Field, { label: "Meta description", htmlFor: "pe-meta", help: "The grey description under the title in search results. Write 120\u2013160 characters that summarise the article and invite the click. Leave empty to use the summary.", counter: { value: (form.meta_description || "").length, ideal: [120, 160] }, children: _jsx("textarea", { id: "pe-meta", rows: 3, value: form.meta_description || "", onChange: (e) => set("meta_description", e.target.value), className: textareaCls, placeholder: form.dek || "Meta description", "data-testid": "post-meta-description-input" }) }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsx(Field, { label: "Social share title (Open Graph)", htmlFor: "pe-og-title", help: "Headline shown when the link is shared on LinkedIn, Facebook, X or WhatsApp. Leave empty to use the SEO title.", children: _jsx("input", { id: "pe-og-title", value: form.og_title, onChange: (e) => set("og_title", e.target.value), className: inputCls, placeholder: seoTitle || "Share title", "data-testid": "post-og-title-input" }) }), _jsx(Field, { label: "Canonical URL", htmlFor: "pe-canonical", help: "Only fill this if the article was first published on another website \u2014 paste that original URL so Google credits it. Otherwise leave empty.", children: _jsx("input", { id: "pe-canonical", value: form.canonical_url, onChange: (e) => set("canonical_url", e.target.value), className: inputCls, placeholder: "https://\u2026", "data-testid": "post-canonical-input" }) })] }), _jsx(Field, { label: "Social share description", htmlFor: "pe-og-desc", help: "Short text shown under the title on social shares. Leave empty to use the meta description.", children: _jsx("textarea", { id: "pe-og-desc", rows: 2, value: form.og_description, onChange: (e) => set("og_description", e.target.value), className: textareaCls, placeholder: metaDesc || "Share description", "data-testid": "post-og-description-input" }) }), _jsx(Field, { label: "Social share image", help: "Image shown on social shares (ideal 1200\u00D7630 px). Leave empty to use the featured image.", children: _jsx(ImageInput, { value: form.og_image, onChange: (v) => set("og_image", v), testId: "post-og-image" }) }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsx(Field, { label: "Structured data type", help: "Tells Google what kind of page this is (JSON-LD schema). Use NewsArticle for news, Article for stories & interviews, BlogPosting for opinion pieces.", children: _jsxs("select", { value: form.schema_type, onChange: (e) => set("schema_type", e.target.value), className: inputCls, "data-testid": "post-schema-type-select", children: [_jsx("option", { value: "Article", children: "Article" }), _jsx("option", { value: "NewsArticle", children: "NewsArticle" }), _jsx("option", { value: "BlogPosting", children: "BlogPosting" })] }) }), _jsx(Field, { label: "Hide from search engines (noindex)", help: "Turn ON only for pages you don't want in Google (e.g. test posts). When ON, the post is excluded from the sitemap and not sent for indexing.", children: _jsxs("div", { className: "flex h-10 items-center gap-3", children: [_jsx(Switch, { checked: form.noindex, onChange: (v) => set("noindex", v), testId: "post-noindex-switch", label: "noindex" }), _jsx("span", { className: "text-sm text-zinc-400", children: form.noindex ? "Hidden from search" : "Visible to search engines" })] }) })] }), _jsxs("div", { className: "border-t border-hairline pt-5", "data-testid": "seo-checklist", children: [_jsxs("p", { className: "text-[12px] font-semibold uppercase tracking-[0.12em] text-zinc-300", children: ["SEO checklist ", _jsxs("span", { className: cn("ml-2 font-mono", score >= 6 ? "text-emerald-400" : score >= 4 ? "text-amber-400" : "text-red-400"), children: [score, "/", checks.length] })] }), _jsx("ul", { className: "mt-3 grid gap-2 sm:grid-cols-2", children: checks.map((c) => (_jsxs("li", { className: "flex items-start gap-2 text-[13px]", children: [c.ok ? _jsx(CheckCircle2, { className: "mt-0.5 size-4 shrink-0 text-emerald-400" }) : _jsx(Circle, { className: "mt-0.5 size-4 shrink-0 text-zinc-600" }), _jsx("span", { className: c.ok ? "text-zinc-300" : "text-zinc-500", children: c.label })] }, c.label))) })] })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Panel, { title: "Publishing", children: [_jsx(Field, { label: "Post type", help: "Story = long-form profile. Interview = Q&A conversation. News = short global news item (appears on the News page).", children: _jsx("div", { className: "grid grid-cols-3 gap-1 rounded-sm border border-hairline p-1", "data-testid": "post-type-toggle", children: ["story", "interview", "news"].map((t) => (_jsx("button", { type: "button", onClick: () => {
                                                    set("type", t);
                                                    set("schema_type", t === "news" ? "NewsArticle" : "Article");
                                                }, className: cn("rounded-sm py-1.5 text-[12px] capitalize transition-colors duration-150", form.type === t ? "bg-gold text-ink" : "text-zinc-400 hover:text-white"), "data-testid": `post-type-${t}`, children: t }, t))) }) }), _jsx(Field, { label: "Category", help: "The section this post belongs to. Manage the list under Categories (admins).", children: _jsxs("select", { value: form.category, onChange: (e) => set("category", e.target.value), className: inputCls, "data-testid": "post-category-select", children: [_jsx("option", { value: "", children: "\u2014 Select category \u2014" }), (cats.data ?? []).map((c) => (_jsx("option", { value: c.name, children: c.name }, c.id)))] }) }), form.type === "news" && (_jsx(Field, { label: "Region", help: "Where the news happened. Readers filter the News page by region.", children: _jsxs("select", { value: form.region, onChange: (e) => set("region", e.target.value), className: inputCls, "data-testid": "post-region-select", children: [_jsx("option", { value: "", children: "\u2014 Select region \u2014" }), NEWS_REGIONS.map((r) => _jsx("option", { value: r, children: r }, r))] }) })), _jsxs(Field, { label: "Schedule for later", htmlFor: "pe-schedule", help: "Optional. Pick a future date and time (your local time), then click \u201CSchedule\u201D \u2014 the post goes live automatically at that moment and search engines are notified. Leave empty to publish right away.", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("input", { id: "pe-schedule", type: "datetime-local", value: toLocalInput(form.scheduled_at), min: toLocalInput(new Date().toISOString()), onChange: (e) => set("scheduled_at", fromLocalInput(e.target.value)), className: inputCls, "data-testid": "post-schedule-input" }), form.scheduled_at && (_jsx("button", { type: "button", className: ghostBtn, onClick: () => set("scheduled_at", ""), "data-testid": "post-schedule-clear-btn", children: "Clear" }))] }), post?.status === "scheduled" && post.scheduled_at && (_jsxs("p", { className: "text-xs text-gold", "data-testid": "post-scheduled-note", children: ["Goes live ", new Date(post.scheduled_at).toLocaleString([], { dateStyle: "full", timeStyle: "short" })] }))] }), _jsx(Field, { label: "Publish date", htmlFor: "pe-date", help: "Date shown on the article. Leave empty to use today's date when you publish.", children: _jsx("input", { id: "pe-date", type: "date", value: form.published_at, onChange: (e) => set("published_at", e.target.value), className: inputCls, "data-testid": "post-date-input" }) }), _jsx(Field, { label: "Tags", htmlFor: "pe-tags", help: "Comma-separated keywords readers might search for, e.g. \u201CAI, Series A, India\u201D. Helps on-site search.", children: _jsx("input", { id: "pe-tags", value: tagInput, onChange: (e) => setTagInput(e.target.value), className: inputCls, placeholder: "AI, bootstrapped, India", "data-testid": "post-tags-input" }) }), _jsxs("div", { className: "space-y-4", children: [_jsx(Field, { label: "Cover story", help: "Turn ON to show this as the big hero story on the homepage.", children: _jsx(Switch, { checked: form.featured, onChange: (v) => set("featured", v), testId: "post-featured-switch", label: "Cover story" }) }), form.type === "news" && (_jsx(Field, { label: "Breaking news", help: "Turn ON to show this headline in the gold news ticker.", children: _jsx(Switch, { checked: form.breaking, onChange: (v) => set("breaking", v), testId: "post-breaking-switch", label: "Breaking" }) }))] })] }), _jsxs(Panel, { title: "Featured image", children: [_jsx(Field, { label: "Image", help: "Main photo shown at the top of the article and on cards. Use a high-quality landscape or portrait image (min 1200 px wide).", children: _jsx(ImageInput, { value: form.image, onChange: (v) => set("image", v), onAlt: (a) => !form.image_alt && set("image_alt", a), testId: "post-image" }) }), _jsx(Field, { label: "Image alt text", htmlFor: "pe-alt", help: "Describe the image in a few words for visually-impaired readers and Google Images, e.g. \u201CMaya Chen in her Bengaluru office\u201D.", children: _jsx("input", { id: "pe-alt", value: form.image_alt, onChange: (e) => set("image_alt", e.target.value), className: inputCls, "data-testid": "post-image-alt-input" }) })] }), _jsxs(Panel, { title: "People", children: [_jsx(Field, { label: "Featured entrepreneur", htmlFor: "pe-person", help: "Full name of the founder this story is about. Shown in the founder dossier and searchable.", children: _jsx("input", { id: "pe-person", value: form.person, onChange: (e) => set("person", e.target.value), className: inputCls, placeholder: "e.g. Sofia Alvarez", "data-testid": "post-person-input" }) }), _jsx(Field, { label: "Company", htmlFor: "pe-company", help: "The entrepreneur's company or brand.", children: _jsx("input", { id: "pe-company", value: form.company, onChange: (e) => set("company", e.target.value), className: inputCls, placeholder: "e.g. Lumen Pay", "data-testid": "post-company-input" }) }), _jsx(Field, { label: "Byline (author name)", htmlFor: "pe-author", help: "The writer's name shown as \u201CBy \u2026\u201D. For news, you can enter the source desk, e.g. \u201CED Wire\u201D.", children: _jsx("input", { id: "pe-author", value: form.author, onChange: (e) => set("author", e.target.value), className: inputCls, "data-testid": "post-author-input" }) })] }), post && (_jsxs(Panel, { title: "Search engine indexing", description: "Sent automatically every time you publish or update.", children: [_jsxs("ul", { className: "space-y-3", "data-testid": "post-indexing-status", children: [(Array.isArray(post.indexing) ? post.indexing : []).length === 0 && _jsx("li", { className: "text-sm text-zinc-500", children: "Not sent yet \u2014 publish to notify search engines." }), (Array.isArray(post.indexing) ? post.indexing : []).map((r) => (_jsxs("li", { className: "text-[13px]", children: [_jsx("span", { className: "font-semibold capitalize text-white", children: r.provider === "indexnow" ? "IndexNow (Bing, Yandex…)" : "Google Indexing API" }), _jsx("span", { className: cn("ml-2 font-mono text-[11px]", r.ok ? "text-emerald-400" : r.enabled ? "text-red-400" : "text-zinc-500"), children: r.ok ? `sent (${r.status})` : r.enabled ? `failed ${r.status ?? ""}` : "not configured" }), r.message && _jsx("p", { className: "mt-0.5 text-[11px] text-zinc-500", children: r.message })] }, r.provider)))] }), post.status === "published" && (_jsxs("button", { type: "button", className: ghostBtn, onClick: () => reindex.mutate(), disabled: reindex.isPending, "data-testid": "post-reindex-btn", children: [_jsx(RefreshCw, { className: cn("size-3.5", reindex.isPending && "animate-spin") }), " Notify search engines again"] }))] }))] })] })] }));
}
