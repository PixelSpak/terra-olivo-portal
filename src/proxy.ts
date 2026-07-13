import { NextResponse, type NextRequest } from "next/server";

const internalPaths = ["/match", "/review", "/review-logos"];
const internalApiPaths = [
  "/api/apply-suggestion",
  "/api/delete-image",
  "/api/delete-logo",
  "/api/get-suggestions",
  "/api/recent-images",
  "/api/recent-logos",
  "/api/reject-suggestion",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    process.env.NODE_ENV === "production" &&
    (internalPaths.includes(pathname) ||
      internalApiPaths.some((path) => pathname.startsWith(path)))
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/match",
    "/review",
    "/review-logos",
    "/api/apply-suggestion",
    "/api/delete-image",
    "/api/delete-logo",
    "/api/get-suggestions",
    "/api/recent-images",
    "/api/recent-logos",
    "/api/reject-suggestion",
  ],
};
