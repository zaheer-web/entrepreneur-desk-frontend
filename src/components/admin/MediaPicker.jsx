import { useRef, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { toast } from "sonner";

import {
  Check,
  ImagePlus,
  Upload,
  X,
} from "lucide-react";

import {
  apiGet,
  apiUpload,
  errorMessage,
} from "@/libs/api";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  ghostBtn,
  goldBtn,
  inputCls,
} from "@/components/admin/Field";

import { cn } from "@/libs/utils";

// ==========================================
// API IMAGE URL HANDLER
// ==========================================

const API_BASE = (
  import.meta.env.VITE_API_URL || "https://api.entrepreneurdesk.co/api"
).replace(/\/+$/, "");

const API_ORIGIN = API_BASE.replace(/\/api$/, "");

const getMediaUrl = (url) => {
  if (!url || typeof url !== "string") {
    return "";
  }

  // Already absolute URL
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  // Relative backend image URL
  return `${API_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
};

// ==========================================
// MEDIA UPLOAD HOOK
// ==========================================

export function useMediaUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file) => {
      return apiUpload("/admin/media", file);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-media"],
      });

      toast.success("Image uploaded successfully");
    },

    onError: (error) => {
      toast.error(
        errorMessage(error, "Image upload failed")
      );
    },
  });
}

// ==========================================
// MEDIA PICKER
// ==========================================

export function MediaPicker({
  open,
  onClose,
  onSelect,
}) {
  const media = useQuery({
    queryKey: ["admin-media"],
    queryFn: () => apiGet("/admin/media"),
    enabled: open,
  });

  const upload = useMediaUpload();

  const fileRef = useRef(null);

  const [picked, setPicked] = useState(null);

  // Upload image
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate image
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      event.target.value = "";
      return;
    }

    // Upload image
    upload.mutate(file, {
      onSuccess: (response) => {
        if (!response?.url) {
          toast.error("Image uploaded but URL was not returned");
          return;
        }

        setPicked(response);

        // Refresh gallery
        media.refetch();
      },
    });

    event.target.value = "";
  };

  // Select image
  const handleSelect = () => {
    if (!picked?.url) return;

    onSelect({
      url: picked.url,
      alt: picked.alt || picked.filename || "",
    });

    setPicked(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          onClose();
          setPicked(null);
        }
      }}
    >
      <DialogContent
        className="max-h-[85vh] max-w-4xl overflow-hidden rounded-sm border-hairline bg-popover p-0 sm:max-w-4xl"
        data-testid="media-picker-dialog"
      >
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <DialogTitle className="font-heading text-xl text-white">
            Choose from gallery
          </DialogTitle>

          <div className="flex gap-2 pr-8">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              data-testid="media-picker-file-input"
              onChange={handleFileChange}
            />

            <button
              type="button"
              className={ghostBtn}
              onClick={() => fileRef.current?.click()}
              disabled={upload.isPending}
              data-testid="media-picker-upload-btn"
            >
              <Upload className="size-3.5" />

              {upload.isPending
                ? "Uploading..."
                : "Upload new"}
            </button>
          </div>
        </div>

        {/* GALLERY */}

        <div className="max-h-[55vh] overflow-y-auto p-6">
          {media.isLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading gallery...
            </p>
          ) : media.isError ? (
            <div className="space-y-2">
              <p className="text-sm text-red-400">
                Unable to load gallery.
              </p>

              <button
                type="button"
                className={ghostBtn}
                onClick={() => media.refetch()}
              >
                Retry
              </button>
            </div>
          ) : (media.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No images yet. Upload one to get started.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {(media.data ?? []).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPicked(item)}
                  className={cn(
                    "group relative aspect-square overflow-hidden border-2 transition-colors duration-150",
                    picked?.id === item.id
                      ? "border-gold"
                      : "border-transparent hover:border-gold/40"
                  )}
                  data-testid={`media-picker-item-${item.id}`}
                >
                  <img
                    src={getMediaUrl(item.url)}
                    alt={item.alt || ""}
                    loading="lazy"
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.opacity = "0.3";
                    }}
                  />

                  {picked?.id === item.id && (
                    <span className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-gold text-ink">
                      <Check className="size-3.5" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}

        <div className="flex items-center justify-between gap-4 border-t border-hairline px-6 py-4">
          <p className="truncate text-xs text-zinc-500">
            {picked
              ? picked.filename || "Selected image"
              : "Select an image"}
          </p>

          <button
            type="button"
            className={goldBtn}
            disabled={!picked?.url}
            onClick={handleSelect}
            data-testid="media-picker-insert-btn"
          >
            Use image
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// IMAGE INPUT COMPONENT
// ==========================================

export function ImageInput({
  value,
  onChange,
  testId,
  onAlt,
}) {
  const [open, setOpen] = useState(false);

  const imageValue = value || "";

  // Handle image selection
  const handleImageSelect = (image) => {
    onChange(image.url);

    if (image.alt) {
      onAlt?.(image.alt);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">

        {/* IMAGE PREVIEW */}

        <div className="grid size-20 shrink-0 place-items-center overflow-hidden border border-hairline bg-[#101012]">
          {imageValue ? (
            <img
              src={getMediaUrl(imageValue)}
              alt=""
              className="h-full w-full object-cover"
              data-testid={`${testId}-preview`}
              onError={(event) => {
                event.currentTarget.style.opacity = "0.3";
              }}
            />
          ) : (
            <ImagePlus className="size-5 text-zinc-600" />
          )}
        </div>

        {/* IMAGE CONTROLS */}

        <div className="flex flex-1 flex-col gap-2">

          <div className="flex flex-wrap gap-2">

            {/* GALLERY BUTTON */}

            <button
              type="button"
              className={ghostBtn}
              onClick={() => setOpen(true)}
              data-testid={`${testId}-choose-btn`}
            >
              <ImagePlus className="size-3.5" />
              Choose from gallery
            </button>

            {/* REMOVE BUTTON */}

            {imageValue && (
              <button
                type="button"
                className={ghostBtn}
                onClick={() => onChange("")}
                data-testid={`${testId}-clear-btn`}
              >
                <X className="size-3.5" />
                Remove
              </button>
            )}

          </div>

          {/* IMAGE URL INPUT */}

          <input
            type="text"
            value={imageValue}
            onChange={(event) => {
              onChange(event.target.value);
            }}
            placeholder="...or paste an image URL"
            className={inputCls}
            data-testid={`${testId}-url-input`}
          />

        </div>
      </div>

      {/* MEDIA PICKER DIALOG */}

      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={handleImageSelect}
      />
    </div>
  );
}