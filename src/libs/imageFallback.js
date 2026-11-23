// Branded fallback for any <img> that fails to load: never show a broken/empty box.
const PLACEHOLDER = "data:image/svg+xml;utf8," +
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice"><rect width="400" height="500" fill="#141416"/><rect x="0.5" y="0.5" width="399" height="499" fill="none" stroke="#27272A"/><text x="200" y="255" text-anchor="middle" font-family="Georgia,serif" font-size="34" font-style="italic" fill="#D4AF37">ED</text></svg>`);
export function installImageFallback() {
    const onError = (e) => {
        const el = e.target;
        if (el instanceof HTMLImageElement && el.dataset.fallback !== "1") {
            el.dataset.fallback = "1";
            el.src = PLACEHOLDER;
        }
    };
    document.addEventListener("error", onError, true); // image errors don't bubble; capture them
    return () => document.removeEventListener("error", onError, true);
}
