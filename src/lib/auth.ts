import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export type Role = "guest" | "front_desk" | "programs_leader";

export async function requireUser() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/p/login");
  return data.user;
}

export async function getProfile() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle();
  return profile as any;
}

export async function requireStaff() {
  const user = await requireUser();
  const supabase = supabaseServer();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = (profile?.role ?? "guest") as Role;
  if (role !== "front_desk" && role !== "programs_leader") redirect("/p/requests");
  return { user, role };
}

export async function requireLeader() {
  const { user, role } = await requireStaff();
  if (role !== "programs_leader") redirect("/staff/front-desk/requests");
  return { user };
}
