import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1) Skip Next.js internals, static assets, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured, allow request to proceed (dev mode safety)
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedRoute = pathname.startsWith("/senior") || pathname.startsWith("/buddy");
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isRoot = pathname === "/";

  // 2) If no session and protected route -> redirect to login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 3) If session exists, handle role-based redirection
  if (user) {
    const role = user.user_metadata?.role;

    // Redirect to dashboard if on Root or Auth pages (Login/Signup)
    if (isRoot || isAuthRoute) {
      const url = request.nextUrl.clone();
      if (role === "senior") {
        url.pathname = "/senior/dashboard";
        return NextResponse.redirect(url);
      } else if (role === "buddy") {
        url.pathname = "/buddy/dashboard";
        return NextResponse.redirect(url);
      }
    }

    // Role enforcement for protected routes
    if (role === "senior" && pathname.startsWith("/buddy")) {
      const url = request.nextUrl.clone();
      url.pathname = "/senior/dashboard";
      return NextResponse.redirect(url);
    }

    if (role === "buddy" && pathname.startsWith("/senior")) {
      const url = request.nextUrl.clone();
      url.pathname = "/buddy/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
