import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The login page itself, and the auth endpoint it posts to (which is how
  // a session gets created/cleared in the first place), must stay reachable
  // without an existing session. /api/admin/upload is similar for a less
  // obvious reason: Vercel Blob calls it a second time, server-to-server
  // with no cookie, to confirm each upload finished — that callback is
  // authenticated separately (a signed x-vercel-signature header, verified
  // inside handleUpload against BLOB_READ_WRITE_TOKEN), and the route itself
  // still requires a session for the token-issuing half of the flow that
  // actually starts an upload. Blocking it here at the middleware layer
  // bounced that completion callback before the route ever saw it, which is
  // what stalled every upload at ~90% with the form never getting a file URL.
  if (pathname === "/admin/login" || pathname === "/api/admin/auth" || pathname === "/api/admin/upload") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
