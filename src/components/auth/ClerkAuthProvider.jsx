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

export default function ClerkAuthProvider({ children }) {
  const navigate = useNavigate();

  const [config, setConfig] = useState(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer;

    const apiUrl = import.meta.env.VITE_API_URL;

    const load = async (attempt = 0) => {
      try {
        const response = await fetch(
          `${apiUrl.replace(/\/+$/, "")}/clerk/config`
        );

        if (!response.ok) {
          throw new Error(`Clerk config failed: ${response.status}`);
        }

        const cfg = await response.json();

        if (cfg.enabled && cfg.publishable_key) {
          if (!cancelled) {
            setConfig(cfg);
            setUnavailable(false);
          }
          return;
        }

        throw new Error("Clerk is not enabled in backend configuration");
      } catch (error) {
        console.error("Clerk configuration error:", error);

        if (cancelled) return;

        if (attempt >= 5) {
          setUnavailable(true);
          return;
        }

        timer = setTimeout(() => {
          load(attempt + 1);
        }, 2000);
      }
    };

    if (!apiUrl) {
      setUnavailable(true);
      console.error("VITE_API_URL is missing");
      return;
    }

    load();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (unavailable) {
    return (
      <p style={{ padding: 24 }}>
        Sign-in is unavailable right now. Refresh the page to try again.
      </p>
    );
  }

  if (!config) return null;

  return (
    <ClerkProvider
      publishableKey={config.publishable_key}
      proxyUrl={config.proxy_url || undefined}
      appearance={appearance}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/admin"
      signUpFallbackRedirectUrl="/admin"
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}