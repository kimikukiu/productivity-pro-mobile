import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "@@/lib/auth-context";

/**
 * Component that redirects to login if user is not authenticated.
 * Place this inside AuthProvider but before the main app content.
 */
export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Don't redirect if already on login page or oauth callback
    const currentPath = `/${segments.join('/')}`;
    const publicPaths = ["/login", "/oauth/callback"];
    if (publicPaths.includes(currentPath) || segments[0] === "login") {
      return;
    }

    // Only redirect if we're not authenticated
    if (!isAuthenticated && role === "none") {
      // Use setTimeout to avoid navigation during render
      const timer = setTimeout(() => {
        router.replace("/login");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, role, router, segments]);

  return <>{children}</>;
}
