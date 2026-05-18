import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// anyone (authed or not) can visit these
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

function isPublic(path: string): boolean {
  return PUBLIC_ROUTES.some((p) => path === p || path.startsWith(p + "/"));
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get("jwt");
  const isAuthed = !!token?.value;
  const path = req.nextUrl.pathname;

  // unauthed trying to access a protected route => bounce to / with returnUrl
  if (!isAuthed && !isPublic(path)) {
    const url = new URL("/", req.url);
    url.searchParams.set("returnUrl", path + req.nextUrl.search);

    return NextResponse.redirect(url);
  }

  // authed visiting /, /login, or /signup => go to feed (or returnUrl if present)
  if (isAuthed && (path === "/" || path === "/login" || path === "/signup")) {
    const returnUrl = req.nextUrl.searchParams.get("returnUrl");
    // security: only honor returnURl if it's an internal relative path
    const safe = returnUrl?.startsWith("/") && !returnUrl.startsWith("//");
    return NextResponse.redirect(new URL(safe ? returnUrl! : "/feed", req.url));
  }

  return NextResponse.next();
}

// run middleware on all paths except next internals, api proxy, static files
export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\.).*)"],
};
