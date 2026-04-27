import Image from "next/image";
import { cn } from "@/lib/utils";
import { avatarSrc } from "@/lib/avatars";

interface UserPicProps {
  photo: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZES: Record<NonNullable<UserPicProps["size"]>, { cls: string; px: number }> = {
  xs: { cls: "w-6 h-6", px: 24 },
  sm: { cls: "w-8 h-8", px: 32 },
  md: { cls: "w-10 h-10", px: 40 },
  lg: { cls: "w-14 h-14", px: 56 },
  xl: { cls: "w-28 h-28", px: 112 },
};

export function UserPic({ photo, name, size = "md", className }: UserPicProps) {
  const { cls, px } = SIZES[size];
  return (
    <Image
      src={avatarSrc(photo)}
      alt={name}
      width={px}
      height={px}
      unoptimized
      className={cn("shrink-0 rounded-full object-cover", cls, className)}
    />
  );
}
