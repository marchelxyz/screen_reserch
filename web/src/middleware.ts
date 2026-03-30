import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SCREENING_MAX_STEP_COOKIE } from "@/lib/screeningProgressCookie";

function _requiredStepForPath(pathname: string): number | null {
  if (pathname === "/step-2" || pathname.startsWith("/step-2/")) {
    return 2;
  }
  if (pathname === "/step-3" || pathname.startsWith("/step-3/")) {
    return 3;
  }
  if (pathname === "/step-4" || pathname.startsWith("/step-4/")) {
    return 4;
  }
  return null;
}

export function middleware(request: NextRequest): NextResponse {
  const required = _requiredStepForPath(request.nextUrl.pathname);
  if (required === null) {
    return NextResponse.next();
  }

  const raw = request.cookies.get(SCREENING_MAX_STEP_COOKIE)?.value;
  const unlocked = raw ? Number.parseInt(raw, 10) : 0;
  if (Number.isNaN(unlocked) || unlocked < required) {
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        scope: "screening",
        phase: "middleware",
        message: "step_gated_redirect",
        path: request.nextUrl.pathname,
        requiredStep: required,
        maxStepCookie: unlocked,
      })
    );
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/step-2", "/step-3", "/step-4"],
};
