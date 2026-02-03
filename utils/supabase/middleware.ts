import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip auth check if Supabase is not configured
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

  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/signup"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Protected routes that require authentication
  const isProtectedRoute = pathname.startsWith("/senior") || pathname.startsWith("/buddy");

  // If no user and trying to access protected route -> redirect to login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If user exists and on login/signup (NOT '/') -> redirect to dashboard based on role
  // Let app/page.tsx handle '/' to avoid redirect loops
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();
    url.pathname = profile?.role === "buddy" ? "/buddy/dashboard" : "/senior/dashboard";
    return NextResponse.redirect(url);
  }

  // Role-based route protection
  if (user && isProtectedRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    // Prevent seniors from accessing buddy routes
    if (role === "senior" && pathname.startsWith("/buddy")) {
      const url = request.nextUrl.clone();
      url.pathname = "/senior/dashboard";
      return NextResponse.redirect(url);
    }

    // Prevent buddies from accessing senior routes
    if (role === "buddy" && pathname.startsWith("/senior")) {
      const url = request.nextUrl.clone();
      url.pathname = "/buddy/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Allow all other requests (including "/" for unauthenticated users)
  return supabaseResponse;
}
