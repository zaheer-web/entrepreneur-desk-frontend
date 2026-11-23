"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { useSyncExternalStore } from "react";
import { Toaster as Sonner } from "sonner";
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react";
// The app's theme is the `dark` class on <html> (index.html or a toggle), never the viewer's OS setting.
const subscribeToDocumentTheme = (onChange) => {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
};
const getDocumentTheme = () => document.documentElement.classList.contains("dark") ? "dark" : "light";
const getServerTheme = () => "light";
const Toaster = ({ ...props }) => {
    const theme = useSyncExternalStore(subscribeToDocumentTheme, getDocumentTheme, getServerTheme);
    return (_jsx(Sonner, { theme: theme, 
        // bottom-right: top positions sit on the header nav and swallow clicks; bottom-left is the preview bug button
        position: "bottom-right", className: "toaster group", icons: {
            success: (_jsx(CircleCheckIcon, { className: "size-4" })),
            info: (_jsx(InfoIcon, { className: "size-4" })),
            warning: (_jsx(TriangleAlertIcon, { className: "size-4" })),
            error: (_jsx(OctagonXIcon, { className: "size-4" })),
            loading: (_jsx(Loader2Icon, { className: "size-4 animate-spin" })),
        }, style: {
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
            "--border-radius": "var(--radius)",
        }, toastOptions: {
            classNames: {
                toast: "cn-toast",
            },
        }, ...props }));
};
export { Toaster };
