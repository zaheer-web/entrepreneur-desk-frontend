import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from "react-router-dom";
import SiteLayout from "@/components/layout/SiteLayout";
import ClerkAuthProvider from "@/components/auth/ClerkAuthProvider";
import AdminLayout from "@/components/admin/AdminLayout";
import Home from "@/pages/Home";
import Stories from "@/pages/Stories";
import StoryDetail from "@/pages/StoryDetail";
import Lists from "@/pages/Lists";
import News from "@/pages/News";
import GetFeatured from "@/pages/GetFeatured";
import NotFound from "@/pages/NotFound";
import { SignInPage, SignUpPage } from "@/pages/AuthPages";
import { Dashboard, PostsList } from "@/pages/admin/Posts";
import PostEditor from "@/pages/admin/PostEditor";
import Categories from "@/pages/admin/Categories";
import { ListEditor, ListsIndex } from "@/pages/admin/Lists";
import MediaGallery from "@/pages/admin/MediaGallery";
import SettingsPage from "@/pages/admin/Settings";
import UsersPage from "@/pages/admin/Users";
import InboxPage from "@/pages/admin/Inbox";
// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
// The public site renders without Clerk; only auth + admin routes load it.
export default function App() {
    return (_jsxs(Routes, { children: [_jsxs(Route, { element: _jsx(SiteLayout, {}), children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/stories", element: _jsx(Stories, {}) }), _jsx(Route, { path: "/story/:slug", element: _jsx(StoryDetail, {}) }), _jsx(Route, { path: "/lists", element: _jsx(Lists, {}) }), _jsx(Route, { path: "/news", element: _jsx(News, {}) }), _jsx(Route, { path: "/get-featured", element: _jsx(GetFeatured, {}) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }), _jsx(Route, { path: "/sign-in/*", element: _jsx(ClerkAuthProvider, { children: _jsx(SignInPage, {}) }) }), _jsx(Route, { path: "/sign-up/*", element: _jsx(ClerkAuthProvider, { children: _jsx(SignUpPage, {}) }) }), _jsxs(Route, { path: "/admin", element: _jsx(ClerkAuthProvider, { children: _jsx(AdminLayout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "posts", element: _jsx(PostsList, {}) }), _jsx(Route, { path: "posts/new", element: _jsx(PostEditor, {}) }), _jsx(Route, { path: "posts/:id", element: _jsx(PostEditor, {}) }), _jsx(Route, { path: "categories", element: _jsx(Categories, {}) }), _jsx(Route, { path: "lists", element: _jsx(ListsIndex, {}) }), _jsx(Route, { path: "lists/new", element: _jsx(ListEditor, {}) }), _jsx(Route, { path: "lists/:id", element: _jsx(ListEditor, {}) }), _jsx(Route, { path: "media", element: _jsx(MediaGallery, {}) }), _jsx(Route, { path: "settings", element: _jsx(SettingsPage, {}) }), _jsx(Route, { path: "users", element: _jsx(UsersPage, {}) }), _jsx(Route, { path: "inbox", element: _jsx(InboxPage, {}) })] })] }));
}
