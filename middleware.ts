import { NextResponse, type NextRequest } from "next/server";
import { DEVICE_ID_COOKIE, isValidDeviceId } from "./lib/deviceAuth";

export function middleware(request: NextRequest) {
  const rawCookie = request.cookies.get(DEVICE_ID_COOKIE)?.value?.trim();
  const rawHeader = request.headers.get("x-device-id")?.trim();
  const existingCookie = isValidDeviceId(rawCookie) ? rawCookie : undefined;
  const existingHeader = isValidDeviceId(rawHeader) ? rawHeader : undefined;

  // If cookie exists, prioritize cookie. Else if explicit header exists, use that. Else generate new.
  const deviceId = existingCookie || existingHeader || `usr_anon_${crypto.randomUUID().replace(/-/g, "")}`;
  const needsCookie = !existingCookie;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-device-id", deviceId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (needsCookie) {
    // Attach persistent 10-year cookie
    response.cookies.set({
      name: DEVICE_ID_COOKIE,
      value: deviceId,
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
      sameSite: "lax",
      httpOnly: false, // readable by client-side fallback & synchronization
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static assets)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - static image/font extensions
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};
