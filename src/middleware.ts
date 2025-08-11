import { NextRequest, NextResponse } from "next/server";

// Minimal middleware for static export compatibility
export function middleware(request: NextRequest) {
  // Skip middleware logic for static export
  return NextResponse.next();
}

// Empty matcher to disable middleware for static export
export const config = {
  matcher: [],
};
