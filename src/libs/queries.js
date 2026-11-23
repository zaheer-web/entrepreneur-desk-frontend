import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/libs/api";

// Categories
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const data = await apiGet("/categories");
      return Array.isArray(data) ? data : [];
    },
  });
}

// Stories
export function useStories(params = {}) {
  const sp = new URLSearchParams();

  if (params.q) {
    sp.set("q", params.q);
  }

  if (params.category && params.category !== "All") {
    sp.set("category", params.category);
  }

  if (params.type) {
    sp.set("type", params.type);
  }

  const qs = sp.toString();

  return useQuery({
    queryKey: [
      "stories",
      params.q || "",
      params.category || "All",
      params.type || "",
    ],
    queryFn: async () => {
      const data = await apiGet("/stories" + (qs ? "?" + qs : ""));
      return Array.isArray(data) ? data : [];
    },
  });
}

// Single Story
export function useStory(slug) {
  return useQuery({
    queryKey: ["story", slug],
    queryFn: () => apiGet("/stories/" + encodeURIComponent(slug)),
    enabled: !!slug,
    retry: false,
  });
}

// All Lists
export function useLists() {
  return useQuery({
    queryKey: ["lists"],
    queryFn: async () => {
      const data = await apiGet("/lists");
      return Array.isArray(data) ? data : [];
    },
  });
}

// Single List
export function useList(slug) {
  return useQuery({
    queryKey: ["list", slug],
    queryFn: () => apiGet("/lists/" + encodeURIComponent(slug)),
    enabled: !!slug,
    retry: false,
  });
}

// News
export function useNews(region) {
  const qs =
    region && region !== "Global"
      ? "?region=" + encodeURIComponent(region)
      : "";

  return useQuery({
    queryKey: ["news", region || "Global"],
    queryFn: async () => {
      const data = await apiGet("/news" + qs);
      return Array.isArray(data) ? data : [];
    },
  });
}