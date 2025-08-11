import { z } from "zod";
import DOMPurify from "dompurify";

// 🛡️ Input validation schemas
export const AdminUserSchema = z.object({
  uid: z.string().min(1, "UID is required").max(128, "UID too long"),
  email: z.string().email("Invalid email format"),
  subscription: z.enum(["free", "pro"], {
    errorMap: () => ({ message: "Subscription must be 'free' or 'pro'" }),
  }),
  isActive: z.boolean().optional(),
});

export const ChatMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(4000, "Message too long (max 4000 characters)")
    .refine(
      (msg) => msg.trim().length > 0,
      "Message cannot be only whitespace"
    ),
  sessionId: z.string().min(1, "Session ID required"),
});

export const UserUpdateSchema = z.object({
  uid: z.string().min(1, "UID is required"),
  subscription: z.enum(["free", "pro"]).optional(),
  isActive: z.boolean().optional(),
  email: z.string().email().optional(),
});

// 🧹 Sanitization functions
export function sanitizeHtml(dirty: string): string {
  if (typeof window === "undefined") {
    // Server-side: basic sanitization
    return dirty
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  }

  // Client-side: use DOMPurify
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br"],
    ALLOWED_ATTR: [],
  });
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
    .slice(0, 5000); // Limit length
}

// 🔍 Validation utilities
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return { success: false, error: errorMessage };
    }
    return { success: false, error: "Validation failed" };
  }
}

// 🚫 Rate limiting (simple implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

// 🔐 Security headers
export const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

// 🕵️ SQL Injection prevention (for future database queries)
export function escapeSql(input: string): string {
  return input.replace(/'/g, "''").replace(/;/g, "");
}

// 📧 Email validation (more strict)
export function isValidEmail(email: string): boolean {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
}
