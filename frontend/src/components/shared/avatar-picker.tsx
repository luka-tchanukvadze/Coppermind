"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AVATAR_OPTIONS, avatarSrc } from "@/lib/avatars";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AvatarPickerProps {
  defaultValue?: string;
  onChange?: (filename: string) => void;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function AvatarPicker({ defaultValue = "windrunners.svg", onChange, size = "md", label }: AvatarPickerProps) {
  const [selected, setSelected] = useState<string>(defaultValue);
  const tileSize = size === "sm" ? { cls: "w-10 h-10", px: 40 } : size === "lg" ? { cls: "w-16 h-16", px: 64 } : { cls: "w-12 h-12", px: 48 };

  return (
    <div className="space-y-3">
      {label && <div className="text-sm font-medium text-ink">{label}</div>}
      <div className="grid grid-cols-5 gap-2">
        {AVATAR_OPTIONS.map((opt) => {
          const isSelected = selected === opt.filename;
          return (
            <Tooltip key={opt.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(opt.filename);
                    onChange?.(opt.filename);
                  }}
                  className={cn(
                    "group relative overflow-hidden rounded-full transition-all",
                    tileSize.cls,
                    isSelected
                      ? "ring-2 ring-accent ring-offset-2 ring-offset-surface"
                      : "opacity-75 hover:opacity-100 hover:ring-1 hover:ring-border-strong hover:ring-offset-2 hover:ring-offset-surface",
                  )}
                  aria-label={opt.name}
                  aria-pressed={isSelected}
                >
                  <Image
                    src={avatarSrc(opt.filename)}
                    alt={opt.name}
                    width={tileSize.px}
                    height={tileSize.px}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-center">
                <div className="font-medium">{opt.name}</div>
                <div className="text-[10px] opacity-70">{opt.attributes}</div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
