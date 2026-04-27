import Link from "next/link";
import { Pencil } from "lucide-react";
import { UserPic } from "@/components/shared/user-pic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/schema";

export function ProfileBanner({ user, isMe }: { user: User; isMe: boolean }) {
  return (
    <>
      {/* Banner breaks out of the (main) layout padding so it goes edge-to-edge.
          Negative margins must match the layout's responsive padding exactly. */}
      <div className="-mx-4 -mt-6 h-35 bg-accent sm:-mx-6 sm:-mt-8 md:-mx-8 md:-mt-10 md:h-45" />

      {/* Negative top margin pulls the avatar up so it overlaps the banner edge. */}
      <div className="-mt-12 flex flex-wrap items-end justify-between gap-4 sm:-mt-16">
        <div className="flex items-end gap-4 sm:gap-5">
          {/* Background-colored ring around the avatar makes the overlap look intentional. */}
          <div className="rounded-full border-4 border-background bg-background">
            <UserPic photo={user.photo} name={user.name} size="xl" />
          </div>
          <div className="min-w-0 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="wrap-break-word font-serif text-2xl font-medium leading-tight text-ink sm:text-3xl">
                {user.name}
              </h1>
              {user.role !== "user" && (
                <Badge variant="gold" className="capitalize">
                  {user.role}
                </Badge>
              )}
            </div>
            <p className="mt-1 truncate text-sm text-muted">{user.email}</p>
          </div>
        </div>
        {isMe && (
          <Button asChild variant="outline">
            <Link href="/settings">
              <Pencil className="h-4 w-4" /> Edit profile
            </Link>
          </Button>
        )}
      </div>
    </>
  );
}
