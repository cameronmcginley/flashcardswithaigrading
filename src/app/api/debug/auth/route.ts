import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthCookieInfo, debugCookies } from "@/lib/supabase/cookie-debug";

/**
 * API route for debugging authentication issues
 * This should only be enabled in development mode
 */
export async function GET() {
  // Only allow in development mode
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  try {
    // Debug cookies
    const cookieInfo = await debugCookies();

    // Get auth cookie details
    const authCookies = await getAuthCookieInfo();

    // Check server-side auth
    let authStatus = {};
    let user = null;
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.getUser();
      user = data.user;
      authStatus = {
        authenticated: Boolean(data.user),
        error: error ? { message: error.message, code: error.code } : null,
      };
    } catch (authError) {
      authStatus = {
        authenticated: false,
        error:
          authError instanceof Error
            ? { message: authError.message, name: authError.name }
            : { message: "Unknown error" },
      };
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nextjsVersion: process.env.NEXT_RUNTIME || "unknown",
      cookies: cookieInfo,
      authCookies,
      auth: authStatus,
      user: user
        ? {
            id: user.id,
            email: user.email,
            lastSignInAt: user.last_sign_in_at,
          }
        : null,
    });
  } catch (error) {
    console.error("Auth debug error:", error);

    return NextResponse.json(
      {
        error: "Debug error",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : null,
      },
      { status: 500 }
    );
  }
}
