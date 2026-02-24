"use server";

import { supabaseServer } from "@/lib/supabase/server";

export async function staffPasswordLogin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, error: "missing" as const };
  }

  const supabase = supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, error: "invalid" as const };
  }

  // 👇 NO redirect aquí
  return { ok: true as const };
}
