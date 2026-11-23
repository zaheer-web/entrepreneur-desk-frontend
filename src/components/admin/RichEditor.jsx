import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Minus, Quote, Redo2, Strikethrough, Undo2, Unlink } from "lucide-react";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { cn } from "@/libs/utils";
function Tool({ onClick, active, label, children, testId }) {
    return (_jsx("button", { type: "button", title: label, "aria-label": label, onMouseDown: (e) => e.preventDefault(), onClick: onClick, "data-testid": testId, className: cn("grid size-8 place-items-center rounded-sm transition-colors duration-150", active ? "bg-gold/15 text-gold" : "text-zinc-400 hover:bg-white/5 hover:text-white"), children: children }));
}
function Toolbar({ editor, onImage }) {
    const setLink = () => {
        const prev = editor.getAttributes("link").href;
        const url = window.prompt("Link URL (https://…)", prev ?? "https://");
        if (url === null)
            return;
        if (url === "")
            editor.chain().focus().unsetLink().run();
        else
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };
    return (_jsxs("div", { className: "sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-hairline bg-[#121214] px-2 py-1.5", "data-testid": "editor-toolbar", children: [_jsx(Tool, { label: "Heading 2", testId: "editor-h2", active: editor.isActive("heading", { level: 2 }), onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), children: _jsx(Heading2, { className: "size-4" }) }), _jsx(Tool, { label: "Heading 3", testId: "editor-h3", active: editor.isActive("heading", { level: 3 }), onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), children: _jsx(Heading3, { className: "size-4" }) }), _jsx("span", { className: "mx-1 h-5 w-px bg-hairline" }), _jsx(Tool, { label: "Bold", testId: "editor-bold", active: editor.isActive("bold"), onClick: () => editor.chain().focus().toggleBold().run(), children: _jsx(Bold, { className: "size-4" }) }), _jsx(Tool, { label: "Italic", testId: "editor-italic", active: editor.isActive("italic"), onClick: () => editor.chain().focus().toggleItalic().run(), children: _jsx(Italic, { className: "size-4" }) }), _jsx(Tool, { label: "Strikethrough", testId: "editor-strike", active: editor.isActive("strike"), onClick: () => editor.chain().focus().toggleStrike().run(), children: _jsx(Strikethrough, { className: "size-4" }) }), _jsx("span", { className: "mx-1 h-5 w-px bg-hairline" }), _jsx(Tool, { label: "Bullet list", testId: "editor-bullets", active: editor.isActive("bulletList"), onClick: () => editor.chain().focus().toggleBulletList().run(), children: _jsx(List, { className: "size-4" }) }), _jsx(Tool, { label: "Numbered list", testId: "editor-numbers", active: editor.isActive("orderedList"), onClick: () => editor.chain().focus().toggleOrderedList().run(), children: _jsx(ListOrdered, { className: "size-4" }) }), _jsx(Tool, { label: "Quote", testId: "editor-quote", active: editor.isActive("blockquote"), onClick: () => editor.chain().focus().toggleBlockquote().run(), children: _jsx(Quote, { className: "size-4" }) }), _jsx(Tool, { label: "Divider", testId: "editor-divider", onClick: () => editor.chain().focus().setHorizontalRule().run(), children: _jsx(Minus, { className: "size-4" }) }), _jsx("span", { className: "mx-1 h-5 w-px bg-hairline" }), _jsx(Tool, { label: "Add link", testId: "editor-link", active: editor.isActive("link"), onClick: setLink, children: _jsx(Link2, { className: "size-4" }) }), _jsx(Tool, { label: "Remove link", testId: "editor-unlink", onClick: () => editor.chain().focus().unsetLink().run(), children: _jsx(Unlink, { className: "size-4" }) }), _jsx(Tool, { label: "Insert image", testId: "editor-image", onClick: onImage, children: _jsx(ImagePlus, { className: "size-4" }) }), _jsx("span", { className: "ml-auto" }), _jsx(Tool, { label: "Undo", testId: "editor-undo", onClick: () => editor.chain().focus().undo().run(), children: _jsx(Undo2, { className: "size-4" }) }), _jsx(Tool, { label: "Redo", testId: "editor-redo", onClick: () => editor.chain().focus().redo().run(), children: _jsx(Redo2, { className: "size-4" }) })] }));
}
export default function RichEditor({ value, onChange }) {
    const [picker, setPicker] = useState(false);
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [2, 3] } }),
            Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } }),
            Image,
            Placeholder.configure({ placeholder: "Start writing the article… Use H2/H3 for sections — search engines read them as the outline." }),
        ],
        content: value,
        onUpdate: ({ editor: e }) => onChange(e.isEmpty ? "" : e.getHTML()),
        editorProps: {
            attributes: {
                class: "ed-prose min-h-[420px] px-5 py-4 focus:outline-none",
                "data-testid": "editor-content",
            },
        },
    });
    if (!editor)
        return null;
    return (_jsxs("div", { className: "overflow-hidden rounded-sm border border-input bg-[#101012] focus-within:border-gold", children: [_jsx(Toolbar, { editor: editor, onImage: () => setPicker(true) }), _jsx(EditorContent, { editor: editor }), _jsx(MediaPicker, { open: picker, onClose: () => setPicker(false), onSelect: (m) => editor.chain().focus().setImage({ src: m.url, alt: m.alt }).run() })] }));
}
