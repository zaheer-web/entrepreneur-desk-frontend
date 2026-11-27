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
// MEDIA URL HANDLER
// ==========================================

// Use frontend domain so Nginx proxies /api/media
// to the backend media endpoint.

const API_MEDIA_PREFIX = "/api/media/";

const getMediaUrl = (item) => {
  if (!item) return "";

  const value =
    typeof item === "string"
      ? item
      : item.url || "";

  const id =
    typeof item === "object"
      ? item.id || item._id
      : null;

  // If URL is missing but media ID exists
  if (!value && id) {
    return `${API_MEDIA_PREFIX}${id}`;
  }

  if (!value) return "";

  // Keep data and blob URLs unchanged
  if (/^(data:|blob:)/i.test(value)) {
    return value;
  }

  // Convert backend absolute media URL to same-origin URL
  try {
    const parsed = new URL(value, window.location.origin);

    if (
      parsed.pathname.startsWith("/api/media/") &&
      (
        parsed.hostname === "api.entrepreneurdesk.co" ||
        parsed.hostname === "entrepreneurdesk.co" ||
        parsed.hostname === "www.entrepreneurdesk.co"
      )
    ) {
      return `${parsed.pathname}${parsed.search}`;
    }

    // Preserve other absolute external URLs
    if (/^https?:\/\//i.test(value)) {
      return value;
    }
  } catch {
    // Continue with relative URL handling
  }

  // Relative media URL
  if (value.startsWith("/")) {
    return value;
  }

  return `/${value}`;
};

// Normalize media object returned by backend
const normalizeMedia = (item) => {
  if (!item || typeof item !== "object") {
    return null;
  }

  const id = item.id || item._id || "";

  const url = getMediaUrl({
    ...item,
    id,
  });

  if (!url) return null;

  return {
    ...item,
    id: id || url,
    url,
    filename:
      item.filename ||
      item.originalname ||
      item.name ||
      "Uploaded image",
    alt: item.alt || "",
  };
};

// Handle different API response formats
const normalizeMediaList = (response) => {
  let items = [];

  if (Array.isArray(response)) {
    items = response;
  } else if (Array.isArray(response?.items)) {
    items = response.items;
  } else if (Array.isArray(response?.data)) {
    items = response.data;
  } else if (Array.isArray(response?.media)) {
    items = response.media;
  }

  return items
    .map(normalizeMedia)
    .filter(Boolean);
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

    onSuccess: (response) => {
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
  const [picked, setPicked] = useState(null);

  const fileRef = useRef(null);

  // Fetch gallery images
  const media = useQuery({
    queryKey: ["admin-media"],

    queryFn: async () => {
      const response = await apiGet("/admin/media");

      return normalizeMediaList(response);
    },

    enabled: open,

    staleTime: 0,

    refetchOnWindowFocus: true,
  });

  const upload = useMediaUpload();

  // ==========================================
  // UPLOAD IMAGE
  // ==========================================

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate image type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");

      event.target.value = "";

      return;
    }

    // Upload image
    upload.mutate(file, {
      onSuccess: async (response) => {
        const uploadedImage = normalizeMedia(response);

        if (!uploadedImage?.url) {
          toast.error(
            "Image uploaded but image URL was not returned"
          );

          return;
        }

        // Select newly uploaded image
        setPicked(uploadedImage);

        // Refresh gallery
        await media.refetch();

        toast.success("Image uploaded and selected");
      },
    });

    event.target.value = "";
  };

  // ==========================================
  // SELECT IMAGE
  // ==========================================

  const handleSelect = () => {
    if (!picked?.url) {
      toast.error("Please select an image");

      return;
    }

    onSelect({
      url: picked.url,
      alt: picked.alt || picked.filename || "",
    });

    setPicked(null);

    onClose();
  };

  // ==========================================
  // CLOSE DIALOG
  // ==========================================

  const handleClose = () => {
    setPicked(null);

    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          handleClose();
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
            <div className="space-y-3">
              <p className="text-sm text-red-400">
                Unable to load gallery.
              </p>

              <p className="break-all text-xs text-zinc-500">
                {errorMessage(
                  media.error,
                  "Please check your connection and login."
                )}
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {(media.data ?? []).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPicked(item)}
                  className={cn(
                    "group relative aspect-square overflow-hidden border-2 bg-[#101012] transition-colors duration-150",
                    picked?.id === item.id
                      ? "border-gold"
                      : "border-transparent hover:border-gold/40"
                  )}
                  data-testid={`media-picker-item-${item.id}`}
                  aria-label={`Select ${item.filename}`}
                  aria-pressed={picked?.id === item.id}
                >
                  <img
                    src={item.url}
                    alt={item.alt || item.filename}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    onError={(event) => {
                      console.error(
                        "Media image failed:",
                        item.url
                      );

                      event.currentTarget.style.display = "none";
                    }}
                  />

                  {/* SELECTED OVERLAY */}

                  {picked?.id === item.id && (
                    <>
                      <span className="absolute inset-0 border-2 border-gold bg-gold/10" />

                      <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-gold text-ink shadow-lg">
                        <Check className="size-4" />
                      </span>
                    </>
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

  // ==========================================
  // HANDLE IMAGE SELECTION
  // ==========================================

  const handleImageSelect = (image) => {
    if (!image?.url) {
      toast.error("Invalid image selected");

      return;
    }

    onChange(image.url);

    if (image.alt) {
      onAlt?.(image.alt);
    }

    toast.success("Image selected successfully");
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

                console.error(
                  "Image preview failed:",
                  event.currentTarget.src
                );
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
                onClick={() => {
                  onChange("");

                  onAlt?.("");
                }}
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