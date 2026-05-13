"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, ImagePlus, GripVertical } from "lucide-react";

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  bucket?: string;
  maxImages?: number;
  helperText?: string;
}

export function ImageUploader({
  value,
  onChange,
  bucket = "news-images",
  maxImages = 10,
  helperText,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createSupabaseBrowser();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError("");

    const remaining = maxImages - value.length;
    if (remaining <= 0) {
      setError(`Massimo ${maxImages} immagini.`);
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];
      for (const file of toUpload) {
        if (!file.type.startsWith("image/")) {
          setError(`"${file.name}" non è un'immagine.`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError(`"${file.name}" supera i 5MB.`);
          continue;
        }

        const ext = file.name.split(".").pop() || "jpg";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, file, { upsert: false });

        if (uploadError) {
          setError(`Upload fallito: ${uploadError.message}`);
          continue;
        }

        const { data: publicUrl } = supabase.storage
          .from(bucket)
          .getPublicUrl(path);
        uploadedUrls.push(publicUrl.publicUrl);
      }

      if (uploadedUrls.length > 0) {
        onChange([...value, ...uploadedUrls]);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {/* Existing images preview */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {value.map((url, idx) => (
            <div
              key={url + idx}
              className="group relative aspect-square rounded-lg overflow-hidden border bg-muted"
            >
              <Image
                src={url}
                alt={`Immagine ${idx + 1}`}
                fill
                className="object-cover"
                sizes="120px"
                unoptimized
              />
              {/* Position badge */}
              <span className="absolute top-1 left-1 rounded-full bg-black/60 text-white text-[10px] px-1.5 py-0.5 font-medium">
                {idx + 1}
              </span>
              {/* Controls overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(idx, idx - 1)}
                    className="h-7 w-7 rounded-full bg-white text-foreground hover:bg-white/90 flex items-center justify-center"
                    title="Sposta a sinistra"
                  >
                    <GripVertical className="h-3.5 w-3.5 rotate-90" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="h-7 w-7 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center"
                  title="Rimuovi"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {value.length < maxImages && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-dashed h-auto py-3 flex flex-col gap-1.5"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">Caricamento in corso...</span>
              </>
            ) : value.length === 0 ? (
              <>
                <ImagePlus className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs">Carica una o più immagini</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span className="text-xs">
                  Aggiungi altre ({value.length}/{maxImages})
                </span>
              </>
            )}
          </Button>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {helperText && !error && (
        <p className="text-[10px] text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
