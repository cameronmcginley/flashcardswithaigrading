import { NextResponse } from "next/server";
import { User } from "@supabase/supabase-js";

interface AuthError {
  message?: string;
  code?: string;
  status?: number;
  name?: string;
}

// Allow passing either Supabase User or a generic UserDetails object
type UserDetailsParam = User | Record<string, unknown> | null;

/**
 * Standardized authentication error response for API routes
 */
export function createAuthErrorResponse(
  error: AuthError,
  userDetails: UserDetailsParam = null
) {
  console.error("Authentication error:", error);

  return NextResponse.json(
    {
      error: "Unauthorized",
      details: "No valid session found in API route",
      userDetails,
      errorMessage: error?.message || "Unknown authentication error",
      errorCode: error?.code || "UNKNOWN_AUTH_ERROR",
    },
    { status: 401 }
  );
}

/**
 * Helper function to check if an error is due to authentication issues
 */
export function isAuthError(error: AuthError): boolean {
  if (!error) return false;

  // Common Supabase auth error codes
  const authErrorCodes = ["PGRST301", "PGRST302", "42501", "auth/invalid-jwt"];

  // Check for error codes or common error messages
  return (
    authErrorCodes.includes(error.code as string) ||
    (typeof error.message === "string" &&
      (error.message.includes("JWT") ||
        error.message.includes("auth") ||
        error.message.includes("permission") ||
        error.message.includes("unauthorized") ||
        error.message.includes("not logged in")))
  );
}
