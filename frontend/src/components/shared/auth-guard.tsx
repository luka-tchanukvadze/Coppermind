"use client";

import { useEffect } from "react";
import { useMe } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";

// Client-side auth backstop for the protected app shell. The Next middleware
// only checks whether the jwt cookie is PRESENT at navigation time, so it
// can't catch a session that ends while you're already inside the app: the
// logout redirect racing the cookie clear, the cookie expiring, or any 401
// coming back from the server. When the ['me'] query reports 401 the session
// is gone, so hard-redirect to the landing page. A full-page nav (not
// router.push) re-runs middleware against the now-absent cookie and tears down
// the socket/presence/cache instead of leaving a half-logged-out shell.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { error } = useMe();
  const unauthed = error instanceof ApiError && error.status === 401;

  useEffect(() => {
    if (unauthed) window.location.replace("/");
  }, [unauthed]);

  // don't paint the authed shell while we're bouncing out
  if (unauthed) return null;

  return <>{children}</>;
}
