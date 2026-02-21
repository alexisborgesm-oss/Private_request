"use server";
import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function upsertProfile(formData: FormData) {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/p/login");

  const first_name = String(formData.get("first_name") ?? "").trim();
  const last_name = String(formData.get("last_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const reservation_number = String(formData.get("reservation_number") ?? "").trim() || null;
  const room_number = String(formData.get("room_number") ?? "").trim() || null;

  if (!first_name || !last_name || !phone) throw new Error("Missing required fields");

  const { error } = await supabase.from("profiles").upsert(
    {
      id: data.user.id,
      email: data.user.email,
      first_name,
      last_name,
      phone,
      reservation_number,
      room_number
    },
    { onConflict: "id" }
  );
  if (error) throw new Error(error.message);
  redirect("/p/requests");
}
