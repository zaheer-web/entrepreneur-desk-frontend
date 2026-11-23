import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/react";
import { dark } from "@clerk/ui/themes";
const appearance = {
    theme: dark,
    variables: {
        colorPrimary: "#D4AF37",
        colorPrimaryForeground: "#0D0D0E",
        colorBackground: "#141416",
        colorInput: "#101012",
        colorForeground: "#F5F5F7",
        borderRadius: "0.25rem",
        fontFamily: "'DM Sans Variable', sans-serif",
    },
    captcha: { theme: "dark" },
};
// Starts Clerk from the backend's runtime config, so deploy's live keys need no rebuild.
export default function ClerkAuthProvider({ children }) {
    const navigate = useNavigate();
    const [config, setConfig] = useState(null);
    const [unavailable, setUnavailable] = useState(false);
    useEffect(() => {
        let cancelled = false;
        const load = async (attempt = 0) => {
            try {
                const cfg = (await (await fetch(`/api/clerk/config`)).json());
                if (cfg.enabled) {
                    if (!cancelled)
                        setConfig(cfg);
                    return;
                }
            }
            catch {
                /* retry below */
            }
            if (cancelled)
                return;
            if (attempt >= 20) {
                setUnavailable(true);
                return;
            }
            setTimeout(() => load(attempt + 1), 1500);
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);
    if (unavailable)
        return _jsx("p", { style: { padding: 24 }, children: "Sign-in is unavailable right now. Refresh the page to try again." });
    if (!config)
        return null;
    return (_jsx(ClerkProvider, { publishableKey: config.publishable_key, proxyUrl: config.proxy_url || undefined, appearance: appearance, routerPush: (to) => navigate(to), routerReplace: (to) => navigate(to, { replace: true }), signInUrl: "/sign-in", signUpUrl: "/sign-up", signInFallbackRedirectUrl: "/admin", signUpFallbackRedirectUrl: "/admin", afterSignOutUrl: "/", children: children }));
}
