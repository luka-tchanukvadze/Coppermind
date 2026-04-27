import Image from "next/image";
import { cn } from "@/lib/utils";

// Book.coverImage in the schema is a string. Our dummy stores a hex color;
// real data would be a URL. Either way the cover keeps a 2:3 aspect ratio.

interface BookCoverProps {
  coverImage: string;
  title: string;
  author?: string;
  className?: string;
  showTitle?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZES = {
  sm: { width: "w-13", w: 52, text: "text-[9px]" },
  md: { width: "w-24", w: 96, text: "text-[11px]" },
  lg: { width: "w-40", w: 160, text: "text-xs" },
  xl: { width: "w-56", w: 224, text: "text-sm" },
} as const;

export function BookCover({
  coverImage,
  title,
  author,
  className,
  showTitle = true,
  size = "md",
}: BookCoverProps) {
  // Detect storage type by prefix: "#xxx" = hex color (dummy), anything else = URL.
  // Lets us fake real covers in mocks without a build step.
  const isColor = coverImage.startsWith("#");
  const sz = SIZES[size];

  if (isColor) {
    return (
      <div
        className={cn(
          "relative aspect-2/3 shrink-0 overflow-hidden rounded-sm shadow-sm",
          sz.width,
          sz.text,
          className,
        )}
        style={{ background: coverImage }}
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
        <div className="absolute inset-y-0 left-1 w-0.5 bg-black/25" aria-hidden="true" />
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
    <div className={cn("relative aspect-2/3 shrink-0 overflow-hidden rounded-sm shadow-sm", sz.width, className)}>
      <Image src={coverImage} alt={title} fill sizes="(max-width: 768px) 33vw, 200px" className="object-cover" />
    </div>
  );
}
