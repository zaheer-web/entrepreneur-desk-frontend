export const STORY_CATEGORIES = ["All", "AI & DeepTech", "FinTech", "SaaS", "Climate", "Consumer", "Bootstrapped"];
export const NEWS_REGIONS = ["Global", "North America", "Europe", "Asia-Pacific", "Middle East & Africa"];
export function formatDate(iso) {
    if (!iso)
        return "";
    const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
