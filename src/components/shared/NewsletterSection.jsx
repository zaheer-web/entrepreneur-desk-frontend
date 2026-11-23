import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Check } from "lucide-react";
import { apiPost, ApiError } from "@/libs/api";
export default function NewsletterSection() {
    const [email, setEmail] = useState("");
    const [done, setDone] = useState(false);
    const mutation = useMutation({
        mutationFn: (body) => apiPost("/newsletter", body),
        onSuccess: (res) => {
            setDone(true);
            setEmail("");
            toast.success(res.already_subscribed ? "You're already on the list." : "Welcome to The Desk Brief.");
        },
        onError: (err) => {
            toast.error(err instanceof ApiError && err.status === 422 ? "Please enter a valid email address." : "Could not subscribe right now. Try again shortly.");
        },
    });
    return (_jsxs("section", { className: "relative overflow-hidden border-t border-hairline bg-[#111113]", "data-testid": "newsletter-section", children: [_jsx("div", { className: "pointer-events-none absolute -right-32 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_70%)]" }), _jsxs("div", { className: "relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-12 lg:px-8", children: [_jsxs("div", { className: "md:col-span-6", children: [_jsx("p", { className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold", children: "The Desk Brief \u00B7 Weekly" }), _jsxs("h2", { className: "mt-4 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl", children: ["The founders worth knowing, ", _jsx("span", { className: "italic text-gold-soft", children: "every Sunday." })] })] }), _jsxs("div", { className: "md:col-span-5 md:col-start-8 md:self-end", children: [_jsx("p", { className: "text-sm leading-relaxed text-muted-foreground", children: "One considered email. The week's best stories, a new interview, and the global news that matters to builders. No noise." }), _jsxs("form", { onSubmit: (e) => {
                                    e.preventDefault();
                                    if (!email.trim())
                                        return;
                                    mutation.mutate({ email: email.trim() });
                                }, className: "mt-6 flex items-center gap-2 border-b border-white/20 pb-2 transition-colors duration-300 focus-within:border-gold", "data-testid": "newsletter-form", children: [_jsx("input", { type: "email", required: true, value: email, onChange: (e) => {
                                            setEmail(e.target.value);
                                            setDone(false);
                                        }, placeholder: "your@email.com", className: "w-full bg-transparent py-2 text-base text-white placeholder:text-zinc-500 focus:outline-none", "data-testid": "newsletter-email-input", "aria-label": "Email address" }), _jsxs("button", { type: "submit", disabled: mutation.isPending, className: "inline-flex shrink-0 items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink transition-[background-color,transform] duration-200 hover:bg-gold-hover active:scale-95 disabled:opacity-60", "data-testid": "newsletter-submit-btn", children: [done ? _jsx(Check, { className: "size-4" }) : _jsx(ArrowRight, { className: "size-4" }), mutation.isPending ? "Joining" : done ? "Subscribed" : "Subscribe"] })] }), done && (_jsx("p", { className: "mt-3 font-serif text-sm italic text-gold-soft", "data-testid": "newsletter-success-message", children: "You're in. Look out for Sunday's edition." }))] })] })] }));
}
