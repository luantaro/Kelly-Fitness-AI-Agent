/**
 * 🔒 Secure Logger
 * Masks sensitive information in logs
 */

interface LogContext {
  [key: string]: any;
}

const SENSITIVE_PATTERNS = [
  /sk-[a-zA-Z0-9]+/g, // OpenAI API keys
  /-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/g, // Private keys
  /Bearer\s+[a-zA-Z0-9\-._~+/]+=*/g, // Bearer tokens
  /"password"\s*:\s*"[^"]*"/g, // Passwords in JSON
  /"token"\s*:\s*"[^"]*"/g, // Tokens in JSON
  /firebase-adminsdk-[a-zA-Z0-9\-]+@[a-zA-Z0-9\-]+\.iam\.gserviceaccount\.com/g, // Service emails
];

function maskSensitiveData(data: any): any {
  if (typeof data === "string") {
    let masked = data;
    SENSITIVE_PATTERNS.forEach((pattern) => {
      masked = masked.replace(pattern, "[REDACTED]");
    });
    return masked;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item));
  }

  if (data && typeof data === "object") {
    const masked: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Mask sensitive keys
      if (
        ["password", "token", "secret", "key", "private", "apiKey"].some(
          (sensitive) => key.toLowerCase().includes(sensitive)
        )
      ) {
        masked[key] = "[REDACTED]";
      } else {
        masked[key] = maskSensitiveData(value);
      }
    }
    return masked;
  }

  return data;
}

export class SecureLogger {
  private static isDev = process.env.NODE_ENV === "development";

  static info(message: string, context?: LogContext) {
    const maskedContext = context ? maskSensitiveData(context) : undefined;
    console.log(
      `ℹ️  ${message}`,
      maskedContext ? JSON.stringify(maskedContext, null, 2) : ""
    );
  }

  static error(message: string, error?: any, context?: LogContext) {
    const maskedContext = context ? maskSensitiveData(context) : undefined;
    const maskedError = error ? maskSensitiveData(error) : undefined;

    console.error(`❌ ${message}`, {
      error: maskedError,
      context: maskedContext,
      stack: this.isDev ? error?.stack : "[HIDDEN IN PRODUCTION]",
    });
  }

  static warn(message: string, context?: LogContext) {
    const maskedContext = context ? maskSensitiveData(context) : undefined;
    console.warn(
      `⚠️  ${message}`,
      maskedContext ? JSON.stringify(maskedContext, null, 2) : ""
    );
  }

  static debug(message: string, context?: LogContext) {
    if (!this.isDev) return; // Only log debug in development

    const maskedContext = context ? maskSensitiveData(context) : undefined;
    console.debug(
      `🐛 ${message}`,
      maskedContext ? JSON.stringify(maskedContext, null, 2) : ""
    );
  }

  // Safe token logging - only shows length and partial info
  static logTokenInfo(token: string, prefix: string = "Token") {
    if (!token) {
      this.warn(`${prefix}: No token provided`);
      return;
    }

    const length = token.length;
    const preview =
      token.length > 10
        ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}`
        : "[SHORT_TOKEN]";

    this.debug(`${prefix} info`, {
      length,
      preview,
      type: token.startsWith("sk-")
        ? "OpenAI"
        : token.startsWith("eyJ")
        ? "JWT"
        : "Unknown",
    });
  }
}

// Export singleton
export const logger = SecureLogger;
