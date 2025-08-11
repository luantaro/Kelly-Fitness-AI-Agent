import { NextRequest, NextResponse } from "next/server";

// Skip middleware for static export
if (process.env.NODE_ENV === 'production' && process.env.STATIC_EXPORT === 'true') {
  export function middleware(request: NextRequest) {
    return NextResponse.next();
  }
  
  export const config = {
    matcher: []
  };
} else {

// 🛡️ Simple Rate Limiter for Edge Runtime
class EdgeRateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> =
    new Map();

  checkLimit(
    ip: string,
    maxRequests: number,
    windowMs: number
  ): { allowed: boolean; resetTime: number } {
    const now = Date.now();
    const key = ip;
    const existing = this.requests.get(key);

    if (!existing || now > existing.resetTime) {
      this.requests.set(key, { count: 1, resetTime: now + windowMs });
      return { allowed: true, resetTime: now + windowMs };
    }

    if (existing.count >= maxRequests) {
      return { allowed: false, resetTime: existing.resetTime };
    }

    existing.count++;
    return { allowed: true, resetTime: existing.resetTime };
  }
}

// 🚫 Simple IP Blocking for Edge Runtime
class EdgeIPBlocker {
  private blockedIPs: Set<string> = new Set();

  addBlockedIP(ip: string) {
    this.blockedIPs.add(ip);
  }

  isBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }
}

// Global instances
const rateLimiter = new EdgeRateLimiter();
const ipBlocker = new EdgeIPBlocker();

// 🔍 Simple threat detection patterns
const THREAT_PATTERNS = [
  /(\bselect\b|\bunion\b|\binsert\b|\bdelete\b|\bupdate\b|\bdrop\b).+(\bfrom\b|\binto\b|\bwhere\b)/i, // SQL injection
  /<script[\s\S]*?>[\s\S]*?<\/script>/i, // XSS
  /(\.\.\/)|(\.\.\\)/g, // Path traversal
  /\b(eval|exec|system|shell_exec)\s*\(/i, // Code injection
];

function analyzeRequest(request: NextRequest): {
  allowed: boolean;
  reason: string;
  riskScore: number;
} {
  const url = request.url;
  const userAgent = request.headers.get("user-agent") || "";

  let riskScore = 0;
  let reason = "";

  // Check suspicious patterns in URL
  for (const pattern of THREAT_PATTERNS) {
    if (pattern.test(url)) {
      riskScore += 50;
      reason = "Suspicious pattern in URL";
      break;
    }
  }

  // Check suspicious user agents
  if (
    userAgent.toLowerCase().includes("bot") &&
    !userAgent.includes("Googlebot")
  ) {
    riskScore += 30;
    reason = "Suspicious user agent";
  }

  // Block high-risk requests
  if (riskScore >= 50) {
    return { allowed: false, reason, riskScore };
  }

  return { allowed: true, reason: "Request passed security checks", riskScore };
}

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname } = request.nextUrl;

  try {
    // Extract IP address
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // � Check if IP is blocked
    if (ipBlocker.isBlocked(ip)) {
      console.warn(`🚫 Blocked IP attempted access: ${ip}`);
      return new NextResponse("Access Denied", { status: 403 });
    }

    // 🛡️ Security analysis for API and admin routes
    if (pathname.startsWith("/api") || pathname.startsWith("/admin")) {
      const analysis = analyzeRequest(request);

      if (!analysis.allowed) {
        console.warn(
          `🛡️ Security analysis blocked request from ${ip}: ${analysis.reason}`
        );
        // Block the IP for future requests
        ipBlocker.addBlockedIP(ip);
        return new NextResponse("Request blocked by security policy", {
          status: 403,
        });
      }

      // 🚦 Rate limiting
      const isAdminRoute =
        pathname.startsWith("/api/admin") || pathname.startsWith("/admin");
      const isAuthRoute = pathname.startsWith("/api/auth");

      let maxRequests = 100; // Default
      let windowMs = 60000; // 1 minute

      if (isAdminRoute) {
        maxRequests = 30;
        windowMs = 60000;
      } else if (isAuthRoute) {
        maxRequests = 20;
        windowMs = 60000;
      }

      const rateResult = rateLimiter.checkLimit(ip, maxRequests, windowMs);

      if (!rateResult.allowed) {
        console.warn(`🚦 Rate limit exceeded for ${ip}`);

        const response = new NextResponse("Rate limit exceeded", {
          status: 429,
        });
        response.headers.set("X-RateLimit-Limit", maxRequests.toString());
        response.headers.set("X-RateLimit-Remaining", "0");
        response.headers.set(
          "X-RateLimit-Reset",
          rateResult.resetTime.toString()
        );
        response.headers.set(
          "Retry-After",
          Math.ceil((rateResult.resetTime - Date.now()) / 1000).toString()
        );
        return response;
      }
    }

    // Continue processing
    const response = NextResponse.next();

    // Admin-specific headers
    if (pathname.startsWith("/admin")) {
      response.headers.set(
        "Cross-Origin-Opener-Policy",
        "same-origin-allow-popups"
      );
      response.headers.set("Cross-Origin-Embedder-Policy", "unsafe-none");
    }

    // Universal security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    // Response time header
    const responseTime = Date.now() - startTime;
    response.headers.set("X-Response-Time", `${responseTime}ms`);

    return response;
  } catch (error) {
    console.error("🚨 Middleware error:", error);

    // Continue on error to prevent blocking legitimate traffic
    const response = NextResponse.next();

    if (pathname.startsWith("/admin")) {
      response.headers.set(
        "Cross-Origin-Opener-Policy",
        "same-origin-allow-popups"
      );
      response.headers.set("Cross-Origin-Embedder-Policy", "unsafe-none");
    }

    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

} // End of else block
