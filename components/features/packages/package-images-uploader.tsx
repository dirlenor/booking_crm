"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Image as ImageIcon, Upload, X, Loader2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  value: string[];
  action: (next: string[]) => void;
  maxImages?: number;
  storagePathPrefix: string;
  bucket?: string;
  className?: string;
};

const DEFAULT_BUCKET = "package-images";

const safeExt = (file: File) => {
  const name = file.name.toLowerCase();
  const match = name.match(/\.([a-z0-9]+)$/);
  if (match?.[1]) return match[1];
  return "webp";
};

const makeId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

async function compressImage(file: File): Promise<File> {
  // Visually-lossless compression: downscale only if huge, encode as webp high quality.
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file);
  const maxDim = 2200;
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const targetW = Math.max(1, Math.round(bitmap.width * scale));
  const targetH = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);

  const outType = "image/webp";
  const quality = 0.95;
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) reject(new Error("Compression failed"));
        else resolve(b);
      },
      outType,
      quality
    );
  });

  const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], name, { type: outType });
}

export function PackageImagesUploader({
  label = "Images",
  value,
  action,
  maxImages = 6,
  storagePathPrefix,
  bucket = DEFAULT_BUCKET,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragFromIndexRef = useRef<number | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [objectUrls, setObjectUrls] = useState<string[]>([]);
  const [uploadedPathsByUrl, setUploadedPathsByUrl] = useState<Record<string, string>>({});

  const totalCount = value.length + objectUrls.length;
  const canAddMore = totalCount < maxImages;

  const allPreviews = useMemo(() => {
    return [...value, ...objectUrls];
  }, [value, objectUrls]);

  const applyOrder = (nextAll: string[]) => {
    const nextPersisted = nextAll.filter((u) => !u.startsWith("blob:"));
    const nextLocal = nextAll.filter((u) => u.startsWith("blob:"));
    setObjectUrls(nextLocal);
    action(nextPersisted.slice(0, maxImages));
  };

  const move = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || toIndex < 0) return;
    if (fromIndex >= allPreviews.length || toIndex >= allPreviews.length) return;

    const next = [...allPreviews];
    const [item] = next.splice(fromIndex, 1);
    if (!item) return;
    next.splice(toIndex, 0, item);
    applyOrder(next);
  };

  useEffect(() => {
    return () => {
      objectUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [objectUrls]);

  const removeAt = async (index: number) => {
    setError(null);

    const current = [...allPreviews];
    const targetUrl = current[index];
    if (!targetUrl) return;

    // If it was a local object URL, just drop it.
    if (targetUrl.startsWith("blob:")) {
      URL.revokeObjectURL(targetUrl);
      setObjectUrls((prev) => prev.filter((u) => u !== targetUrl));
      return;
    }

    // Otherwise it's a persisted URL.
    const next = value.filter((u) => u !== targetUrl);
    action(next);

    const uploadedPath = uploadedPathsByUrl[targetUrl];
    if (uploadedPath) {
      const { error: removeError } = await supabase.storage.from(bucket).remove([uploadedPath]);
      if (removeError) console.warn(removeError.message);
      setUploadedPathsByUrl((prev) => {
        const copy = { ...prev };
        delete copy[targetUrl];
        return copy;
      });
    }
  };

  const handleFiles = async (files: FileList) => {
    setError(null);
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) {
      setError("Please select image files.");
      return;
    }

    const remaining = maxImages - (value.length + objectUrls.length);
    const toProcess = fileArray.slice(0, Math.max(0, remaining));
    if (toProcess.length === 0) {
      setError(`Max ${maxImages} images.`);
      return;
    }

    const localUrls = toProcess.map((f) => URL.createObjectURL(f));
    setObjectUrls((prev) => [...prev, ...localUrls]);

    setUploadingCount((c) => c + toProcess.length);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) throw new Error("Please sign in to upload images.");

      const uploadedUrls: string[] = [];
      const pathMap: Record<string, string> = {};

      for (let i = 0; i < toProcess.length; i += 1) {
        const original = toProcess[i];
        if (!original) continue;
        const localUrl = localUrls[i];

        if (original.size > 10 * 1024 * 1024) {
          throw new Error("Image is too large (max 10MB). ");
        }

        const compressed = await compressImage(original);
        const ext = safeExt(compressed);
        const id = makeId();
        const path = `${storagePathPrefix}/${id}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, compressed, { upsert: true, contentType: compressed.type });
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        if (!data.publicUrl) throw new Error("Unable to create public URL.");

        uploadedUrls.push(data.publicUrl);
        pathMap[data.publicUrl] = path;

        if (localUrl) {
          URL.revokeObjectURL(localUrl);
          setObjectUrls((prev) => prev.filter((u) => u !== localUrl));
        }
      }

      action([...value, ...uploadedUrls].slice(0, maxImages));
      setUploadedPathsByUrl((prev) => ({ ...prev, ...pathMap }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingCount((c) => Math.max(0, c - toProcess.length));
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("grid gap-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">
          {Math.min(totalCount, maxImages)}/{maxImages}
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {allPreviews.map((url, idx) => (
          <div
            key={`${url}-${idx}`}
            className={cn(
              "group relative aspect-square rounded-xl border border-input bg-muted/20 overflow-hidden",
              idx === 0 && "ring-2 ring-accent ring-offset-2 ring-offset-background"
            )}
            draggable
            onDragStart={() => {
              dragFromIndexRef.current = idx;
            }}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={() => {
              const from = dragFromIndexRef.current;
              if (typeof from === "number") move(from, idx);
              dragFromIndexRef.current = null;
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Package image" className="w-full h-full object-cover" />

            <div className="absolute left-1.5 bottom-1.5 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-3 h-3" />
              Drag
            </div>

            {url.startsWith("blob:") ? (
              <div className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                Not uploaded
              </div>
            ) : null}

            {idx === 0 ? (
              <div className="absolute left-1.5 top-1.5 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-white">
                Cover
              </div>
            ) : null}

            <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                aria-label="Move left"
                onClick={() => move(idx, idx - 1)}
                disabled={idx === 0}
                className={cn(
                  "w-7 h-7 rounded-full bg-white/95 shadow border border-gray-200 flex items-center justify-center hover:bg-white",
                  idx === 0 && "opacity-50 cursor-not-allowed"
                )}
              >
                <ArrowLeft className="w-4 h-4 text-gray-700" />
              </button>
              <button
                type="button"
                aria-label="Move right"
                onClick={() => move(idx, idx + 1)}
                disabled={idx === allPreviews.length - 1}
                className={cn(
                  "w-7 h-7 rounded-full bg-white/95 shadow border border-gray-200 flex items-center justify-center hover:bg-white",
                  idx === allPreviews.length - 1 && "opacity-50 cursor-not-allowed"
                )}
              >
                <ArrowRight className="w-4 h-4 text-gray-700" />
              </button>
            </div>

            <button
              type="button"
              aria-label="Remove image"
              onClick={() => void removeAt(idx)}
              className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/95 shadow border border-gray-200 flex items-center justify-center hover:bg-white"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        ))}

        {canAddMore ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "aspect-square rounded-xl border border-dashed border-input bg-background hover:bg-accent/40 transition-colors flex flex-col items-center justify-center gap-2",
              uploadingCount > 0 && "opacity-70 cursor-wait"
            )}
            disabled={uploadingCount > 0}
          >
            {uploadingCount > 0 ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            )}
            <div className="text-xs text-muted-foreground">
              {uploadingCount > 0 ? `Uploading (${uploadingCount})` : "Add"}
            </div>
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = e.target.files;
            if (files) void handleFiles(files);
          }}
        />

        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => inputRef.current?.click()}
          disabled={!canAddMore || uploadingCount > 0}
        >
          <Upload className="w-4 h-4" />
          Upload
        </Button>
        <div className="text-xs text-muted-foreground">Auto-compress (webp, high quality). Max 10MB/file.</div>
      </div>

      {error ? (
        <div className="text-sm text-destructive bg-destructive/5 px-3 py-2 rounded-md border border-destructive/20">
          {error}
        </div>
      ) : null}
    </div>
  );
}
