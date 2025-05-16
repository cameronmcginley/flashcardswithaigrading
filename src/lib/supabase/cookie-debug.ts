import { cookies } from "next/headers";

/**
 * Debug utility to check cookie-related issues
 * This can be helpful for diagnosing authentication problems
 */
export async function debugCookies() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    const cookieInfo = {
      count: allCookies.length,
      names: allCookies.map((c) => c.name),
      hasSbCookie: allCookies.some((c) => c.name.includes("sb-")),
      hasAccessToken: allCookies.some((c) => c.name.includes("access_token")),
      hasRefreshToken: allCookies.some((c) => c.name.includes("refresh_token")),
    };

    console.log("Cookie debug info:", cookieInfo);
    return cookieInfo;
  } catch (error) {
    console.error("Error accessing cookies:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown cookie error",
      errorType: error?.constructor?.name,
    };
  }
}

/**
 * Checks if authentication cookies are present
 * Returns true if Supabase auth cookies are found
 */
export async function hasAuthCookies(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    // Look for Supabase authentication cookies (names depend on your setup)
    return allCookies.some(
      (cookie) =>
        cookie.name.startsWith("sb-") ||
        cookie.name.includes("access_token") ||
        cookie.name.includes("refresh_token")
    );
  } catch (error) {
    console.error("Error checking auth cookies:", error);
    return false;
  }
}

/**
 * Gets information about authentication cookies for debugging
 */
export async function getAuthCookieInfo() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    // Filter for auth-related cookies (only get name and value)
    const authCookies = allCookies
      .filter(
        (cookie) =>
          cookie.name.startsWith("sb-") || cookie.name.includes("token")
      )
      .map((cookie) => ({
        name: cookie.name,
        // Not including value for security
        hasValue: Boolean(cookie.value),
      }));

    return {
      found: authCookies.length > 0,
      count: authCookies.length,
      cookies: authCookies,
    };
  } catch (error) {
    console.error("Error getting auth cookie info:", error);
    return {
      found: false,
      error: error instanceof Error ? error.message : "Unknown cookie error",
    };
  }
}
