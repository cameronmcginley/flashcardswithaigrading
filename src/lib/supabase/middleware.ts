import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  try {
    const requestHeaders = new Headers(request.headers);
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.delete({
              name,
              ...options,
            });
          },
        },
      }
    );

    // Refresh the auth session
    const { error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session refresh error:", sessionError.message);
      return response;
    }

    // Session refresh successful
    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}
