/**
 * 🛡️ WAF/CDN Protection Configuration
 * This file contains configurations and utilities for Web Application Firewall
 * and Content Delivery Network protection
 */

// WAF Protection Rules
export const WAF_RULES = {
  // IP-based rules
  ipBlacklist: [] as string[], // Add known malicious IPs here

  // Rate limiting rules
  rateLimits: {
    global: { requests: 100, window: 60000 }, // 100 requests per minute globally
    api: { requests: 50, window: 60000 }, // 50 API requests per minute
    auth: { requests: 10, window: 60000 }, // 10 auth requests per minute
    admin: { requests: 5, window: 300000 }, // 5 admin requests per 5 minutes
  },

  // Geographic restrictions
  allowedCountries: [
    "US",
    "CA",
    "GB",
    "AU",
    "DE",
    "FR",
    "JP",
    "KR",
    "SG",
    "VN",
  ],

  // User agent filtering
  blockedUserAgents: [
    "sqlmap",
    "nikto",
    "nmap",
    "masscan",
    "zgrab",
    "curl/7.0", // Old curl versions often used in attacks
  ],

  // Request size limits
  maxRequestSize: 10 * 1024 * 1024, // 10MB
  maxHeaderSize: 8192, // 8KB

  // Suspicious patterns
  suspiciousPatterns: [
    /\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/i,
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /\b(eval|alert|confirm|prompt)\s*\(/gi,
  ],
};

// CDN Configuration
export const CDN_CONFIG = {
  // Caching rules
  cacheRules: {
    static: {
      extensions: [
        ".css",
        ".js",
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".svg",
        ".ico",
        ".woff",
        ".woff2",
      ],
      maxAge: 31536000, // 1 year
    },
    api: {
      paths: ["/api/"],
      maxAge: 0, // No caching for API responses
    },
    pages: {
      maxAge: 3600, // 1 hour for pages
    },
  },

  // Compression settings
  compression: {
    enabled: true,
    types: [
      "text/html",
      "text/css",
      "application/javascript",
      "application/json",
    ],
    minSize: 1024, // Compress files larger than 1KB
  },

  // Security headers
  securityHeaders: {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  },
};

/**
 * 🛡️ WAF Request Analyzer
 */
export function analyzeRequest(request: {
  ip?: string;
  userAgent?: string;
  path: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  country?: string;
}): {
  allowed: boolean;
  reason?: string;
  riskScore: number;
} {
  let riskScore = 0;
  const reasons: string[] = [];

  // Check IP blacklist
  if (request.ip && WAF_RULES.ipBlacklist.includes(request.ip)) {
    return { allowed: false, reason: "IP blacklisted", riskScore: 100 };
  }

  // Check geographic restrictions
  if (
    request.country &&
    !WAF_RULES.allowedCountries.includes(request.country)
  ) {
    riskScore += 30;
    reasons.push("Suspicious geographic location");
  }

  // Check user agent
  if (request.userAgent) {
    const blockedUA = WAF_RULES.blockedUserAgents.some((pattern) =>
      request.userAgent!.toLowerCase().includes(pattern.toLowerCase())
    );
    if (blockedUA) {
      return { allowed: false, reason: "Blocked user agent", riskScore: 90 };
    }
  }

  // Check for suspicious patterns in request
  const requestContent = `${request.path} ${JSON.stringify(request.headers)} ${
    request.body || ""
  }`;
  for (const pattern of WAF_RULES.suspiciousPatterns) {
    if (pattern.test(requestContent)) {
      riskScore += 40;
      reasons.push("Suspicious content pattern detected");
      break;
    }
  }

  // Check request size
  const requestSize = Buffer.byteLength(JSON.stringify(request), "utf8");
  if (requestSize > WAF_RULES.maxRequestSize) {
    return { allowed: false, reason: "Request too large", riskScore: 80 };
  }

  // Check header size
  const headerSize = Buffer.byteLength(JSON.stringify(request.headers), "utf8");
  if (headerSize > WAF_RULES.maxHeaderSize) {
    riskScore += 25;
    reasons.push("Large headers detected");
  }

  // High risk threshold
  if (riskScore >= 70) {
    return { allowed: false, reason: reasons.join(", "), riskScore };
  }

  return { allowed: true, riskScore };
}

/**
 * 🚦 Advanced Rate Limiter with sliding window
 */
export class AdvancedRateLimiter {
  private requests = new Map<string, number[]>();

  checkLimit(
    identifier: string,
    maxRequests: number,
    windowMs: number,
    category: string = "default"
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create request history for this identifier
    const requestHistory = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const validRequests = requestHistory.filter(
      (timestamp) => timestamp > windowStart
    );

    // Check if limit exceeded
    if (validRequests.length >= maxRequests) {
      const oldestRequest = validRequests[0];
      const resetTime = oldestRequest + windowMs;
      return { allowed: false, remaining: 0, resetTime };
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
      // 1% chance
      this.cleanup();
    }

    return {
      allowed: true,
      remaining: maxRequests - validRequests.length,
      resetTime: now + windowMs,
    };
  }

  private cleanup() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter((t) => now - t < maxAge);
      if (validTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimestamps);
      }
    }
  }
}

// Global rate limiter instance
export const globalRateLimiter = new AdvancedRateLimiter();

/**
 * 🔒 Security Middleware Factory
 */
export function createSecurityMiddleware(
  options: {
    enableWAF?: boolean;
    enableRateLimit?: boolean;
    customRules?: Partial<typeof WAF_RULES>;
  } = {}
) {
  const {
    enableWAF = true,
    enableRateLimit = true,
    customRules = {},
  } = options;
  const rules = { ...WAF_RULES, ...customRules };

  return async function securityMiddleware(
    request: any,
    response: any,
    next: () => void
  ) {
    try {
      // Extract request information
      const requestInfo = {
        ip: request.ip || request.connection?.remoteAddress,
        userAgent: request.headers["user-agent"],
        path: request.path || request.url,
        method: request.method,
        headers: request.headers,
        body: request.body,
        country:
          request.headers["cf-ipcountry"] || request.headers["x-country"], // Cloudflare/CDN headers
      };

      // WAF Analysis
      if (enableWAF) {
        const analysis = analyzeRequest(requestInfo);
        if (!analysis.allowed) {
          console.warn(
            `🚫 WAF blocked request: ${analysis.reason} (Risk: ${analysis.riskScore})`
          );
          return response.status(403).json({
            error: "Request blocked by security policy",
            code: "WAF_BLOCKED",
          });
        }

        // Log high-risk requests
        if (analysis.riskScore >= 50) {
          console.warn(
            `⚠️ High-risk request detected: Risk ${analysis.riskScore}, IP: ${requestInfo.ip}`
          );
        }
      }

      // Rate Limiting
      if (enableRateLimit) {
        const identifier = requestInfo.ip || "unknown";
        const category = requestInfo.path.startsWith("/api/admin")
          ? "admin"
          : requestInfo.path.startsWith("/api/auth")
          ? "auth"
          : requestInfo.path.startsWith("/api")
          ? "api"
          : "global";

        const limit =
          rules.rateLimits[category as keyof typeof rules.rateLimits] ||
          rules.rateLimits.global;
        const result = globalRateLimiter.checkLimit(
          identifier,
          limit.requests,
          limit.window,
          category
        );

        if (!result.allowed) {
          console.warn(
            `🚦 Rate limit exceeded for ${identifier} in ${category} category`
          );
          return response.status(429).json({
            error: "Rate limit exceeded",
            resetTime: result.resetTime,
            code: "RATE_LIMITED",
          });
        }

        // Add rate limit headers
        response.setHeader("X-RateLimit-Limit", limit.requests);
        response.setHeader("X-RateLimit-Remaining", result.remaining);
        response.setHeader("X-RateLimit-Reset", result.resetTime);
      }

      next();
    } catch (error) {
      console.error("Security middleware error:", error);
      next();
    }
  };
}
