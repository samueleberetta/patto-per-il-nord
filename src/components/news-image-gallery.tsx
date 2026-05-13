"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  images: string[];
  alt: string;
}

export function NewsImageGallery({ images, alt }: Props) {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) return null;

  // Single image: no carousel
  if (images.length === 1) {
    return (
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-muted">
        <Image
          src={images[0]}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1024px"
          priority
          unoptimized
        />
      </div>
    );
  }

  function prev() {
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  }
  function next() {
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-muted group">
        <Image
          src={images[current]}
          alt={`${alt} — immagine ${current + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1024px"
          priority
          unoptimized
        />

        {/* Prev/Next buttons */}
        <button
          type="button"
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100"
          aria-label="Immagine precedente"
        >
          <ChevronLeft className="h-5 w-5 text-[#1B3A6B]" />
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100"
          aria-label="Immagine successiva"
        >
          <ChevronRight className="h-5 w-5 text-[#1B3A6B]" />
        </button>

        {/* Counter */}
        <div className="absolute bottom-3 right-3 rounded-full bg-black/60 text-white text-xs px-3 py-1 font-medium">
          {current + 1} / {images.length}
        </div>

        {/* Dots indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrent(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === current ? "w-6 bg-white" : "w-2 bg-white/60 hover:bg-white/80"
              }`}
              aria-label={`Vai all'immagine ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((url, idx) => (
          <button
            key={url + idx}
            type="button"
            onClick={() => setCurrent(idx)}
            className={`relative shrink-0 h-16 w-24 rounded-lg overflow-hidden border-2 transition-all ${
              idx === current
                ? "border-[#1B3A6B] shadow"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <Image
              src={url}
              alt={`Thumbnail ${idx + 1}`}
              fill
              className="object-cover"
              sizes="96px"
              unoptimized
            />
          </button>
        ))}
      </div>
    </div>
  );
}
