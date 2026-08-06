import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next.js 16 renamed `middleware` to `proxy` (see node_modules/next/dist/docs
// → file-conventions/proxy.md). Its only job here is refreshing the Supabase
// auth cookies on each request: server components can read cookies but not
// write them, so without this a session would silently expire mid-visit.
//
// Route protection itself lives in the pages (see src/lib/auth.ts), because
// the docs recommend keeping logic out of the proxy where possible.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Touching getUser() is what triggers the refresh. Don't remove it.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Skip static assets and image optimization; run on everything else.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
