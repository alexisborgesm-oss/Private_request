import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = supabaseServer();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData?.user ?? null;

  let profile = null;
  let profileError = null;

  if (user) {
    const res = await supabase
      .from("profiles")
      .select("id,email,role")
      .eq("id", user.id)
      .maybeSingle();

    profile = res.data ?? null;
    profileError = res.error
      ? { code: res.error.code, message: res.error.message }
      : null;
  }

  return NextResponse.json({
    user: user ? { id: user.id, email: user.email } : null,
    userError: userError ? { message: userError.message } : null,
    profile,
    profileError,
  });
}
