import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/libs/api";
export function useSettings() {
    return useQuery({ queryKey: ["settings"], queryFn: () => apiGet("/settings"), staleTime: 60_000 });
}
const abs = (origin, url) => (!url ? "" : url.startsWith("http") ? url : `${origin}${url.startsWith("/") ? "" : "/"}${url}`);
function setMeta(attr, key, content) {
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!content) {
        el?.remove();
        return;
    }
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute("content", content);
}
function setLink(rel, href) {
    let el = document.head.querySelector(`link[rel="${rel}"][data-seo]`);
    if (!href) {
        el?.remove();
        return;
    }
    if (!el) {
        el = document.createElement("link");
        el.rel = rel;
        el.dataset.seo = "1";
        document.head.appendChild(el);
    }
    el.href = href;
}
/** Per-page head tags: title, description, canonical, robots, Open Graph, Twitter, JSON-LD. */
export function useSeo(input = {}) {
    const { data: s } = useSettings();
   const ready = input?.ready !== false;
    useEffect(() => {
        if (!ready)
            return;
        const site = s?.site_title || "Entrepreneur Desk";
        const origin = (s?.site_url || window.location.origin).replace(/\/$/, "");
        const url = `${origin}${window.location.pathname}${window.location.search}`;
        const title = input.title ? `${input.title} | ${site}` : `${site}${s?.tagline ? ` — ${s.tagline}` : ""}`;
        const description = input.description || s?.site_description || "";
        const image = abs(origin, input.image || s?.default_og_image || "");
        document.title = title;
        setMeta("name", "description", description);
        setMeta("name", "keywords", input.keywords || s?.meta_keywords || "");
        setMeta("name", "robots", input.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
        setLink("canonical", input.canonical || url);
        setMeta("property", "og:site_name", site);
        setMeta("property", "og:type", input.type || "website");
        setMeta("property", "og:title", input.title || title);
        setMeta("property", "og:description", description);
        setMeta("property", "og:url", input.canonical || url);
        setMeta("property", "og:image", image);
        setMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
        setMeta("name", "twitter:site", s?.twitter_handle || "");
        setMeta("name", "twitter:title", input.title || title);
        setMeta("name", "twitter:description", description);
        setMeta("name", "twitter:image", image);
        setMeta("property", "article:published_time", input.publishedAt || "");
        setMeta("property", "article:modified_time", input.modifiedAt || "");
        const org = { "@type": "Organization", name: s?.organization_name || site, url: origin, ...(s?.logo_url ? { logo: { "@type": "ImageObject", url: abs(origin, s.logo_url) } } : {}) };
        const ld = input.type === "article"
            ? {
                "@context": "https://schema.org",
                "@type": input.schemaType || "Article",
                headline: input.title,
                description,
                image: image ? [image] : undefined,
                datePublished: input.publishedAt,
                dateModified: input.modifiedAt || input.publishedAt,
                author: input.author ? { "@type": "Person", name: input.author } : undefined,
                publisher: org,
                mainEntityOfPage: { "@type": "WebPage", "@id": input.canonical || url },
            }
            : { "@context": "https://schema.org", "@type": "WebSite", name: site, url: origin, publisher: org };
        let script = document.head.querySelector("script[data-seo-jsonld]");
        if (!script) {
            script = document.createElement("script");
            script.type = "application/ld+json";
            script.dataset.seoJsonld = "1";
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(ld);
    }, [ready, s, input.title, input.description, input.image, input.type, input.canonical, input.noindex, input.publishedAt, input.modifiedAt, input.author, input.schemaType, input.keywords]);
}
/** Site-wide head: favicon, search-console verification, analytics. */
export function useSiteHead() {
    const { data: s } = useSettings();

    useEffect(() => {
        if (!s) return;

        if (s.favicon_url) {
            document
                .head
                .querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]')
                .forEach((l) => {
                    l.href = s.favicon_url;
                });
        }

        setMeta("name", "google-site-verification", s.google_site_verification);
        setMeta("name", "msvalidate.01", s.bing_site_verification);

        const id = (s.google_analytics_id || "").trim();

        if (/^G-[A-Z0-9]+$/i.test(id) && !document.getElementById("ga-loader")) {
            const tag = document.createElement("script");

            tag.id = "ga-loader";
            tag.async = true;
            tag.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;

            document.head.appendChild(tag);

            const init = document.createElement("script");

            init.textContent = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${id}');
            `;

            document.head.appendChild(init);
        }
    }, [s]);
}
