"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { isAuthError } from "@/lib/supabase/error";
import { useRouter } from "next/navigation";

interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const router = useRouter();
  const [isAuthIssue, setIsAuthIssue] = useState(false);

  useEffect(() => {
    // Check if this is an authentication error
    if (error && isAuthError(error)) {
      setIsAuthIssue(true);
    }

    // Log the error to help with debugging
    console.error("Application error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause,
    });
  }, [error]);

  const handleSignIn = () => {
    // Navigate to sign-in page
    router.push("/login");
  };

  const handleDebug = async () => {
    // Only available in development
    if (process.env.NODE_ENV !== "production") {
      try {
        const response = await fetch("/api/debug/auth");
        const data = await response.json();
        console.log("Auth Debug Info:", data);
      } catch (debugError) {
        console.error("Error fetching debug info:", debugError);
      }
    }
  };

  if (isAuthIssue) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <div className="max-w-md w-full bg-background border rounded-lg shadow-lg p-6 space-y-4">
          <h2 className="text-xl font-bold tracking-tight">
            Authentication Error
          </h2>
          <p className="text-sm text-muted-foreground">
            Your session may have expired or you&apos;re not authorized to
            access this resource.
          </p>
          <p className="text-xs text-destructive">{error.message}</p>

          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={handleSignIn} variant="default">
              Sign In Again
            </Button>

            <Button onClick={reset} variant="outline">
              Try Again
            </Button>

            {process.env.NODE_ENV !== "production" && (
              <Button onClick={handleDebug} variant="secondary" size="sm">
                Debug Auth
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="max-w-md w-full bg-background border rounded-lg shadow-lg p-6 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground">
          An unexpected error occurred. You can try again or report this issue.
        </p>

        {process.env.NODE_ENV !== "production" && (
          <div className="text-xs text-destructive overflow-auto max-h-32 p-2 bg-slate-100 dark:bg-slate-900 rounded">
            <p className="font-medium">
              {error.name}: {error.message}
            </p>
            <pre className="mt-1">
              {error.stack?.split("\n").slice(0, 3).join("\n")}
            </pre>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={reset} variant="default">
            Try Again
          </Button>

          <Button onClick={() => router.push("/")} variant="outline">
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
