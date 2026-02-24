import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export type Role = "guest" | "front_desk" | "programs_leader";

/**
 * Base auth helper with configurable redirect.
 * - Guest area should redirect to /p/login
 * - Staff area should redirect to /staff/login
 */
async function requireAuth(redirectTo: string) {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect(redirectTo);
  return data.user;
}

/** Guest portal guard */
export async function requireUser() {
  return requireAuth("/p/login");
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

/** Staff portal guard (front_desk or programs_leader) */
export async function requireStaff() {
  const user = await requireAuth("/staff/login");

  const supabase = supabaseServer();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role ?? "guest") as Role;

  // If logged in but not staff, kick them out of staff area
  if (role !== "front_desk" && role !== "programs_leader") {
    redirect("/staff/login");
  }

  return { user, role };
}

/** Programs leader guard */
export async function requireLeader() {
  const { user, role } = await requireStaff();
  if (role !== "programs_leader") redirect("/staff/login");
  return { user };
}
