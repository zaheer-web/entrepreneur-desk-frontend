import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Trash2, Upload } from "lucide-react";
import { apiDelete, apiGet, apiPatch, errorMessage } from "@/libs/api";
import { Field, PageHeader, dangerBtn, ghostBtn, goldBtn, inputCls } from "@/components/admin/Field";
import { useMediaUpload } from "@/components/admin/MediaPicker";
import { useAdmin } from "@/components/admin/AdminLayout";
import { cn } from "@/libs/utils";
const kb = (n) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);
export default function MediaGallery() {
    const { me, isAdmin } = useAdmin();
    const qc = useQueryClient();
    const media = useQuery({ queryKey: ["admin-media"], queryFn: () => apiGet("/admin/media") });
    const upload = useMediaUpload();
    const fileRef = useRef(null);
    const [selected, setSelected] = useState(null);
    const [alt, setAlt] = useState("");
    const [dragging, setDragging] = useState(false);
    const uploadFiles = async (files) => {
        const list = Array.from(files);
        for (const f of list)
            await upload.mutateAsync(f).catch(() => undefined);
        if (list.length)
            toast.success(`${list.length} image${list.length > 1 ? "s" : ""} uploaded`);
        qc.invalidateQueries({ queryKey: ["admin-stats"] });
    };
    const saveAlt = useMutation({
        mutationFn: (m) => apiPatch(`/admin/media/${m.id}`, { alt }),
        onSuccess: (m) => {
            qc.invalidateQueries({ queryKey: ["admin-media"] });
            setSelected(m);
            toast.success("Alt text saved");
        },
        onError: (e) => toast.error(errorMessage(e, "Could not save")),
    });
    const del = useMutation({
        mutationFn: (m) => apiDelete(`/admin/media/${m.id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-media"] });
            qc.invalidateQueries({ queryKey: ["admin-stats"] });
            setSelected(null);
            toast.success("Image removed from gallery");
        },
        onError: (e) => toast.error(errorMessage(e, "Could not delete")),
    });
    const canEdit = (m) => isAdmin || m.uploaded_by === me.user_id;
    return (_jsxs("div", { "data-testid": "admin-media-page", children: [_jsx(PageHeader, { eyebrow: "Media library", title: "Gallery", actions: _jsxs(_Fragment, { children: [_jsx("input", { ref: fileRef, type: "file", accept: "image/*", multiple: true, className: "hidden", "data-testid": "media-file-input", onChange: (e) => { if (e.target.files)
                                void uploadFiles(e.target.files); e.target.value = ""; } }), _jsxs("button", { className: goldBtn, onClick: () => fileRef.current?.click(), disabled: upload.isPending, "data-testid": "media-upload-btn", children: [_jsx(Upload, { className: "size-4" }), " ", upload.isPending ? "Uploading…" : "Upload images"] })] }) }), _jsx("div", { onDragOver: (e) => { e.preventDefault(); setDragging(true); }, onDragLeave: () => setDragging(false), onDrop: (e) => { e.preventDefault(); setDragging(false); void uploadFiles(e.dataTransfer.files); }, className: cn("mb-6 border border-dashed px-6 py-8 text-center text-sm transition-colors duration-200", dragging ? "border-gold bg-gold/5 text-gold" : "border-hairline text-zinc-500"), "data-testid": "media-dropzone", children: "Drag & drop images here \u2014 JPG, PNG, WebP, GIF, SVG or ICO, up to 10 MB each." }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-[1fr_320px]", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-6", "data-testid": "media-grid", children: [media.isLoading && _jsx("p", { className: "col-span-full text-sm text-zinc-500", children: "Loading\u2026" }), (media.data ?? []).map((m) => (_jsx("button", { onClick: () => { setSelected(m); setAlt(m.alt); }, className: cn("aspect-square overflow-hidden border-2 transition-colors duration-150", selected?.id === m.id ? "border-gold" : "border-transparent hover:border-gold/40"), "data-testid": `media-item-${m.id}`, children: _jsx("img", { src: m.url, alt: m.alt, loading: "lazy", className: "h-full w-full object-cover" }) }, m.id)))] }), _jsx("aside", { className: "h-fit border border-hairline bg-card p-5 lg:sticky lg:top-8", "data-testid": "media-details", children: !selected ? (_jsx("p", { className: "text-sm text-zinc-500", children: "Select an image to see its details, copy its link or edit its alt text." })) : (_jsxs("div", { className: "space-y-4", children: [_jsx("img", { src: selected.url, alt: selected.alt, className: "w-full border border-hairline" }), _jsxs("div", { className: "text-xs text-zinc-400", children: [_jsx("p", { className: "truncate text-white", "data-testid": "media-details-filename", children: selected.filename }), _jsxs("p", { className: "mt-1", children: [kb(selected.size), " \u00B7 ", selected.content_type] }), _jsxs("p", { className: "mt-1", children: ["Uploaded by ", selected.uploaded_by_name || "—", " \u00B7 ", new Date(selected.created_at).toLocaleDateString()] })] }), _jsx(Field, { label: "Alt text", htmlFor: "media-alt", help: "Short description of what's in the image. Used for accessibility and Google Images when this picture is inserted in articles.", children: _jsx("input", { id: "media-alt", value: alt, onChange: (e) => setAlt(e.target.value), disabled: !canEdit(selected), className: inputCls, "data-testid": "media-alt-input" }) }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [canEdit(selected) && _jsx("button", { className: ghostBtn, onClick: () => saveAlt.mutate(selected), "data-testid": "media-save-alt-btn", children: "Save alt text" }), _jsxs("button", { className: ghostBtn, onClick: () => void navigator.clipboard?.writeText(window.location.origin + selected.url).then(() => toast.success("Image link copied")), "data-testid": "media-copy-url-btn", children: [_jsx(Copy, { className: "size-3.5" }), " Copy link"] }), canEdit(selected) && (_jsxs("button", { className: dangerBtn, onClick: () => { if (window.confirm("Remove this image from the gallery? Pages already using it will show a placeholder."))
                                                del.mutate(selected); }, "data-testid": "media-delete-btn", children: [_jsx(Trash2, { className: "size-3.5" }), " Delete"] }))] })] })) })] })] }));
}
