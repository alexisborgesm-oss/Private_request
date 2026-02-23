import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // Supabase recovery links usually include type=recovery
  const type = url.searchParams.get("type");

  // Your app uses ?next=... for normal login redirects
  const next = url.searchParams.get("next") ?? "/p";

  const cookieStore = cookies();

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    await supabase.auth.exchangeCodeForSession(code);
  }

  // ✅ If it's a password recovery flow, send user to the reset page
  if (type === "recovery") {
    return NextResponse.redirect(new URL("/auth/reset", url.origin));
  }

  // Normal login flow
  return NextResponse.redirect(new URL(next, url.origin));
}
