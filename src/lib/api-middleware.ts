import { NextRequest, NextResponse } from "next/server";
import { adminAuth, verifyIdToken } from "@/lib/firebase-admin";

/**
 * 🔒 Unified Admin Authentication Middleware
 * Centralizes admin auth logic to reduce code duplication
 * This replaces duplicate functions in admin-secure.ts, admin-claims.ts, and adminFeatures.ts
 */

export interface AuthResult {
  success: boolean;
  decodedToken?: any;
  error?: string;
  status?: number;
}

export interface AdminAuthOptions {
  requireAdmin?: boolean;
  allowSuperAdmin?: boolean;
  debugLogs?: boolean;
}

/**
 * 🔒 UNIFIED: Verify admin token with consistent error handling
 * Replaces all duplicate verifyAdminToken functions
 */
export async function verifyAdminToken(
  authHeader: string | null,
  options: AdminAuthOptions = {}
): Promise<AuthResult> {
  const { requireAdmin = true, debugLogs = false } = options;

  try {
    if (debugLogs) {
      console.log("📋 Auth header:", authHeader ? "Present" : "Missing");
    }

    if (!authHeader?.startsWith("Bearer ")) {
      return {
        success: false,
        error: "Authentication required",
        status: 401,
      };
    }

    const token = authHeader.split("Bearer ")[1];
    if (debugLogs) {
      console.log("🔑 Token length:", token?.length || 0);
    }

    const decodedToken = await verifyIdToken(token);
    if (debugLogs) {
      console.log("👤 User:", decodedToken.email, decodedToken.uid);
    }

    // Check admin permissions if required
    if (requireAdmin && !decodedToken.admin) {
      if (debugLogs) {
        console.log("❌ User is not admin:", decodedToken.email);
      }
      return {
        success: false,
        error: "Admin access required",
        status: 403,
      };
    }

    if (debugLogs) {
      console.log("✅ Authentication successful");
    }

    return {
      success: true,
      decodedToken,
    };
  } catch (error) {
    console.error("❌ Token verification error:", error);
    return {
      success: false,
      error: "Invalid token",
      status: 401,
    };
  }
}

/**
 * Middleware wrapper for API routes requiring admin authentication
 */
export function withAdminAuth(
  handler: (request: NextRequest, decodedToken: any) => Promise<NextResponse>,
  options: AdminAuthOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authHeader = request.headers.get("authorization");
    const authResult = await verifyAdminToken(authHeader, options);

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    return handler(request, authResult.decodedToken);
  };
}

/**
 * Middleware wrapper for API routes requiring user authentication (not necessarily admin)
 */
export function withUserAuth(
  handler: (request: NextRequest, decodedToken: any) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authHeader = request.headers.get("authorization");
    const authResult = await verifyAdminToken(authHeader, {
      requireAdmin: false,
    });

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    return handler(request, authResult.decodedToken);
  };
}

/**
 * Extract and validate request body with error handling
 */
export async function validateRequestBody(
  request: NextRequest,
  requiredFields: string[] = []
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const body = await request.json();

    // Check for required fields
    for (const field of requiredFields) {
      if (!body[field]) {
        return {
          success: false,
          error: `Missing required field: ${field}`,
        };
      }
    }

    return {
      success: true,
      data: body,
    };
  } catch (error) {
    return {
      success: false,
      error: "Invalid JSON body",
    };
  }
}

/**
 * Standard error response formatter
 */
export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Standard success response formatter
 */
export function successResponse(data: any, message?: string) {
  return NextResponse.json({
    ...data,
    ...(message && { message }),
  });
}
