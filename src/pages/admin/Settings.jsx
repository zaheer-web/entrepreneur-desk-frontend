import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { apiGet, apiPut, errorMessage } from "@/libs/api";
import { Field, PageHeader, Panel, goldBtn, inputCls, textareaCls } from "@/components/admin/Field";
import { ImageInput } from "@/components/admin/MediaPicker";
import { AdminOnly } from "@/components/admin/AdminLayout";

const DEFAULT_SETTINGS = {
    site_title: "",
    tagline: "",
    site_description: "",
    organization_name: "",
    footer_text: "",
    logo_url: "",
    favicon_url: "",
    default_og_image: "",
    site_url: "",
    meta_keywords: "",
    google_site_verification: "",
    bing_site_verification: "",
    google_analytics_id: "",
    robots_extra: "",
    twitter_handle: "",
    linkedin_url: "",
    instagram_url: "",
};

function normalizeSettings(data = {}) {
    const normalized = { ...DEFAULT_SETTINGS, ...(data || {}) };

    for (const key of Object.keys(DEFAULT_SETTINGS)) {
        if (typeof normalized[key] !== "string") {
            normalized[key] = normalized[key] == null ? "" : String(normalized[key]);
        }
    }

    return normalized;
}

function SettingsInner() {
    const qc = useQueryClient();

    const settings = useQuery({
        queryKey: ["settings"],
        queryFn: () => apiGet("/settings"),
    });

    const [form, setForm] = useState(null);

    useEffect(() => {
        if (settings.data && !form) {
            setForm(normalizeSettings(settings.data));
        }
    }, [settings.data, form]);

    const save = useMutation({
        mutationFn: (body) => apiPut("/admin/settings", body),
        onSuccess: (s) => {
            const normalized = normalizeSettings(s);
            qc.setQueryData(["settings"], normalized);
            setForm(normalized);
            toast.success("Settings saved — live on the website now.");
        },
        onError: (e) => toast.error(errorMessage(e, "Could not save settings")),
    });

    if (settings.isLoading || !form) {
        return _jsx("p", {
            className: "font-mono text-xs uppercase tracking-[0.2em] text-zinc-500",
            children: "Loading settings…",
        });
    }

    if (settings.isError) {
        return _jsx("p", {
            className: "text-sm text-red-400",
            children: "Could not load settings. Please refresh the page and try again.",
        });
    }

    const set = (key, value) => {
        setForm((current) => current ? { ...current, [key]: value } : current);
    };

    const origin = typeof window !== "undefined" ? window.location.origin : "";

    const txt = (key, label, help, placeholder = "", counter) => {
        const value = typeof form[key] === "string" ? form[key] : "";

        return _jsx(Field, {
            label,
            htmlFor: `set-${key}`,
            help,
            counter: counter
                ? { value: value.length, ideal: counter }
                : undefined,
            children: _jsx("input", {
                id: `set-${key}`,
                value,
                onChange: (e) => set(key, e.target.value),
                placeholder,
                className: inputCls,
                "data-testid": `settings-${key.replace(/_/g, "-")}-input`,
            }),
        });
    };

    const siteDescription = form.site_description || "";
    const footerText = form.footer_text || "";
    const robotsExtra = form.robots_extra || "";
    const siteUrl = form.site_url || "";

    return _jsxs("form", {
        onSubmit: (e) => {
            e.preventDefault();
            save.mutate(normalizeSettings(form));
        },
        "data-testid": "admin-settings-page",
        children: [
            _jsx(PageHeader, {
                eyebrow: "Website",
                title: "Settings & SEO",
                actions: _jsxs("button", {
                    type: "submit",
                    className: goldBtn,
                    disabled: save.isPending,
                    "data-testid": "settings-save-btn",
                    children: [
                        _jsx(Save, { className: "size-4" }),
                        " ",
                        save.isPending ? "Saving…" : "Save settings",
                    ],
                }),
            }),
            _jsxs("div", {
                className: "grid gap-6 xl:grid-cols-2",
                children: [
                    _jsxs(Panel, {
                        title: "Identity",
                        description: "How the website names and describes itself.",
                        children: [
                            txt(
                                "site_title",
                                "Website title",
                                "The name of the website. Appears in the browser tab after every page title, e.g. “Founder story | Entrepreneur Desk”.",
                                "Entrepreneur Desk",
                                [5, 40]
                            ),
                            txt(
                                "tagline",
                                "Tagline",
                                "A short phrase describing the publication. Used in the homepage title, e.g. “Entrepreneur Desk — Stories of the world's boldest founders”."
                            ),
                            _jsx(Field, {
                                label: "Homepage meta description",
                                htmlFor: "set-desc",
                                help: "The description Google shows for your homepage. 120–160 characters summarising what the site offers.",
                                counter: { value: siteDescription.length, ideal: [120, 160] },
                                children: _jsx("textarea", {
                                    id: "set-desc",
                                    rows: 3,
                                    value: siteDescription,
                                    onChange: (e) => set("site_description", e.target.value),
                                    className: textareaCls,
                                    "data-testid": "settings-site-description-input",
                                }),
                            }),
                            txt(
                                "organization_name",
                                "Organisation name",
                                "The publisher's legal or brand name. Used in Google's structured data as the publisher of every article."
                            ),
                            _jsx(Field, {
                                label: "Footer text",
                                htmlFor: "set-footer",
                                help: "A short line shown under the logo in the footer. Leave empty for the default.",
                                children: _jsx("textarea", {
                                    id: "set-footer",
                                    rows: 2,
                                    value: footerText,
                                    onChange: (e) => set("footer_text", e.target.value),
                                    className: textareaCls,
                                    "data-testid": "settings-footer-text-input",
                                }),
                            }),
                        ],
                    }),
                    _jsxs(Panel, {
                        title: "Brand assets",
                        description: "Logo, favicon and the fallback share image.",
                        children: [
                            _jsx(Field, {
                                label: "Logo",
                                help: "Replaces the text logo in the header and footer. Use a transparent PNG or SVG, light-coloured for the dark header, about 400×80 px. Leave empty to use the typeset wordmark.",
                                children: _jsx(ImageInput, {
                                    value: form.logo_url || "",
                                    onChange: (v) => set("logo_url", v),
                                    testId: "settings-logo",
                                }),
                            }),
                            _jsx(Field, {
                                label: "Favicon",
                                help: "The small icon in the browser tab. Upload a square PNG or ICO, at least 48×48 px.",
                                children: _jsx(ImageInput, {
                                    value: form.favicon_url || "",
                                    onChange: (v) => set("favicon_url", v),
                                    testId: "settings-favicon",
                                }),
                            }),
                            _jsx(Field, {
                                label: "Default social share image",
                                help: "Shown when a page without its own image is shared on social media. Ideal size 1200×630 px.",
                                children: _jsx(ImageInput, {
                                    value: form.default_og_image || "",
                                    onChange: (v) => set("default_og_image", v),
                                    testId: "settings-og-image",
                                }),
                            }),
                        ],
                    }),
                    _jsxs(Panel, {
                        title: "Search engines",
                        description: "Verification, indexing and analytics.",
                        children: [
                            txt(
                                "site_url",
                                "Public website URL",
                                `Your live domain with https and no trailing slash, e.g. https://entrepreneurdesk.co. Used for canonical links, the sitemap and instant indexing. Leave empty to use the current address (${origin}).`,
                                "https://entrepreneurdesk.co"
                            ),
                            txt(
                                "meta_keywords",
                                "Site keywords",
                                "Comma-separated topics the site covers, e.g. “entrepreneurs, startups, founder interviews”. Minor ranking value, but helps some search engines."
                            ),
                            txt(
                                "google_site_verification",
                                "Google Search Console verification code",
                                "In Search Console choose “HTML tag” verification and paste only the content value, e.g. “abc123XYZ…”, not the whole <meta> tag."
                            ),
                            txt(
                                "bing_site_verification",
                                "Bing Webmaster verification code",
                                "From Bing Webmaster Tools → “Meta tag” option. Paste only the content value."
                            ),
                            txt(
                                "google_analytics_id",
                                "Google Analytics measurement ID",
                                "Your GA4 ID starting with “G-”, e.g. G-ABC123XYZ. Leave empty to disable analytics.",
                                "G-XXXXXXXXXX"
                            ),
                            _jsx(Field, {
                                label: "Extra robots.txt rules",
                                htmlFor: "set-robots",
                                help: "Advanced. Lines added to robots.txt, e.g. “Disallow: /private”. The admin area is already blocked and the sitemap is linked automatically.",
                                children: _jsx("textarea", {
                                    id: "set-robots",
                                    rows: 3,
                                    value: robotsExtra,
                                    onChange: (e) => set("robots_extra", e.target.value),
                                    className: `${textareaCls} font-mono`,
                                    "data-testid": "settings-robots-extra-input",
                                }),
                            }),
                            _jsxs("div", {
                                className: "rounded-sm border border-hairline bg-[#101012] p-4 text-[13px] text-zinc-400",
                                "data-testid": "settings-seo-links",
                                children: [
                                    _jsx("p", {
                                        children: "Submit this sitemap in Google Search Console and Bing Webmaster Tools:",
                                    }),
                                    _jsx("a", {
                                        href: "/api/sitemap.xml",
                                        target: "_blank",
                                        rel: "noreferrer",
                                        className: "mt-1 block font-mono text-gold hover:underline",
                                        children: `${(siteUrl || origin).replace(/\/$/, "")}/api/sitemap.xml`,
                                    }),
                                    _jsxs("p", {
                                        className: "mt-3",
                                        children: [
                                            "robots.txt: ",
                                            _jsx("a", {
                                                href: "/api/robots.txt",
                                                target: "_blank",
                                                rel: "noreferrer",
                                                className: "font-mono text-gold hover:underline",
                                                children: "/api/robots.txt",
                                            }),
                                        ],
                                    }),
                                    _jsx("p", {
                                        className: "mt-3 text-xs text-zinc-500",
                                        children: "Every publish or update automatically pings IndexNow (Bing, Yandex, Seznam, Naver) and, once a Google service-account key is added, the Google Indexing API.",
                                    }),
                                ],
                            }),
                        ],
                    }),
                    _jsxs(Panel, {
                        title: "Social profiles",
                        description: "Linked from the footer and used in structured data.",
                        children: [
                            txt(
                                "twitter_handle",
                                "X (Twitter) handle",
                                "Your handle with @, e.g. @entrepreneurdesk. Used for Twitter/X share cards.",
                                "@entrepreneurdesk"
                            ),
                            txt(
                                "linkedin_url",
                                "LinkedIn page URL",
                                "Full link to your LinkedIn company page.",
                                "https://linkedin.com/company/…"
                            ),
                            txt(
                                "instagram_url",
                                "Instagram URL",
                                "Full link to your Instagram profile.",
                                "https://instagram.com/…"
                            ),
                        ],
                    }),
                ],
            }),
        ],
    });
}

export default function SettingsPage() {
    return _jsx(AdminOnly, {
        children: _jsx(SettingsInner, {}),
    });
}
