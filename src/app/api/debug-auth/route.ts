import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // En route handler es seguro setear, pero no lo necesitamos para debug
        setAll() {},
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();

  const allCookies = cookieStore.getAll().map((c) => c.name);

  return NextResponse.json({
    hasSbCookie: allCookies.some((n) => n.startsWith("sb-")),
    sbCookies: allCookies.filter((n) => n.startsWith("sb-")),
    user: data?.user ? { id: data.user.id, email: data.user.email } : null,
    error: error ? { name: error.name, message: error.message } : null,
  });
}
