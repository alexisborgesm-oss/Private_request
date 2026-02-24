"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function staffPasswordLogin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    // redirige con query para mostrar error simple
    redirect("/staff/login?e=missing");
  }

  const supabase = supabaseServer();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/staff/login?e=invalid");
  }

  // IMPORTANT: si login fue ok, ya hay cookies -> entra al staff
  redirect("/staff");
}
