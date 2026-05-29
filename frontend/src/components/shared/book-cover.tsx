"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Book.coverImage can be a hex (#xxxxxx) for mock covers or a URL/path for real
// images. Bad input or a runtime load error falls back to a default-coloured mock.

interface BookCoverProps {
  coverImage: string;
  title: string;
  author?: string;
  className?: string;
  showTitle?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZES = {
  sm: { width: "w-13", w: 52, text: "text-[9px]", sizes: "192px" },
  md: { width: "w-24", w: 96, text: "text-[11px]", sizes: "288px" },
  lg: { width: "w-40", w: 160, text: "text-xs", sizes: "480px" },
  xl: {
    width: "w-56",
    w: 224,
    text: "text-sm",
    sizes: "(max-width: 768px) 640px, 960px",
  },
} as const;

const FALLBACK_COLOR = "#7a8a99";

const isHexColor = (s: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s);
const isImageSrc = (s: string) => s.startsWith("/") || /^https?:\/\//.test(s);

export function BookCover({
  coverImage,
  title,
  author,
  className,
  showTitle = true,
  size = "md",
}: BookCoverProps) {
  const [imgError, setImgError] = useState(false);

  const isColor = isHexColor(coverImage);
  const isValidSrc = isImageSrc(coverImage);
  // colour mode covers three cases: real hex, invalid src, or image failed to load
  const useColorMode = isColor || !isValidSrc || imgError;
  const sz = SIZES[size];

  if (useColorMode) {
    const bgColor = isColor ? coverImage : FALLBACK_COLOR;
    return (
      <div
        className={cn(
          "relative aspect-2/3 shrink-0 overflow-hidden rounded-sm shadow-sm",
          sz.width,
          sz.text,
          className,
        )}
        style={{ background: bgColor }}
      >
        {/* Diagonal gradient fakes light hitting the cover. */}
        <div
          className="absolute inset-0 opacity-20"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.25) 100%)",
          }}
        />
        {/* Thin dark line near the spine - sells the "physical book" feel. */}
        <div
          className="absolute inset-y-0 left-1 w-0.5 bg-black/25"
          aria-hidden="true"
        />
        {showTitle && (
          <div className="relative flex h-full flex-col justify-between p-2">
            <div className="line-clamp-4 wrap-break-word font-serif font-semibold leading-tight text-[#f2ebd5]">
              {title}
            </div>
            {author && size !== "sm" && (
              <div className="line-clamp-2 wrap-break-word text-[0.72em] italic text-[#f2ebd5]/70">
                {author}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-2/3 shrink-0 overflow-hidden rounded-sm shadow-sm",
        sz.width,
        className,
      )}
    >
      <Image
        src={coverImage}
        alt={title}
        fill
        sizes={sz.sizes}
        quality={90}
        className="object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  );
}
