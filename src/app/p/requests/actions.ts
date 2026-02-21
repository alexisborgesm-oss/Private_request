"use server";
import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { sendEmailIfConfigured, sendSmsIfConfigured } from "@/lib/notify";

export async function createRequest(formData: FormData) {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/p/login");

  const class_id = String(formData.get("class_id") ?? "");
  const party_size = Number(formData.get("party_size") ?? 1);
  const requested_datetime = String(formData.get("requested_datetime") ?? "");
  const guest_message = String(formData.get("guest_message") ?? "").trim() || null;

  if (!class_id || !requested_datetime || !party_size) throw new Error("Missing fields");

  const { error } = await supabase.from("private_requests").insert({
    guest_id: data.user.id,
    class_id,
    party_size,
    requested_datetime,
    guest_message,
    status: "pending"
  });
  if (error) throw new Error(error.message);

  redirect("/p/requests");
}

export async function updatePendingRequest(requestId: string, formData: FormData) {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/p/login");

  const class_id = String(formData.get("class_id") ?? "");
  const party_size = Number(formData.get("party_size") ?? 1);
  const requested_datetime = String(formData.get("requested_datetime") ?? "");
  const guest_message = String(formData.get("guest_message") ?? "").trim() || null;

  const { data: existing, error: e0 } = await supabase
    .from("private_requests")
    .select("id,status,guest_id")
    .eq("id", requestId)
    .maybeSingle();
  if (e0) throw new Error(e0.message);
  if (!existing) throw new Error("Request not found");
  if (existing.guest_id !== data.user.id) throw new Error("Unauthorized");
  if (existing.status !== "pending") throw new Error("Only pending requests can be edited");

  const { error } = await supabase
    .from("private_requests")
    .update({ class_id, party_size, requested_datetime, guest_message })
    .eq("id", requestId);
  if (error) throw new Error(error.message);

  redirect("/p/requests");
}

export async function acceptCounterOffer(requestId: string) {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/p/login");

  const { error } = await supabase.rpc("guest_accept_counter_offer", { p_request_id: requestId });
  if (error) throw new Error(error.message);

  const { data: r } = await supabase
    .from("private_requests")
    .select(
      "id,approved_start_datetime,final_price, guest:profiles(first_name,last_name,email,phone), cls:private_classes(name), instructor:instructors(name), location:locations(name)"
    )
    .eq("id", requestId)
    .maybeSingle();

  if (r) {
    const guestName = `${r.guest.first_name} ${r.guest.last_name}`;
    const when = new Date(r.approved_start_datetime).toLocaleString();
    const html = `<div style="font-family:ui-sans-serif,system-ui;line-height:1.5"><h2>Private session confirmed</h2><p>Hi ${guestName},</p><p>Your private session is confirmed:</p><ul><li><b>Class:</b> ${r.cls.name}</li><li><b>Time:</b> ${when}</li><li><b>Location:</b> ${r.location?.name ?? "TBD"}</li><li><b>Instructor:</b> ${r.instructor?.name ?? "TBD"}</li><li><b>Price:</b> $${r.final_price}</li></ul></div>`;
    await sendEmailIfConfigured(r.guest.email, "Your private session is confirmed", html);
    await sendSmsIfConfigured(r.guest.phone, `Civana: Your private ${r.cls.name} is confirmed for ${when}. Check your email/portal.`);
  }

  redirect("/p/requests");
}

export async function declineCounterOffer(requestId: string) {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/p/login");

  const { error } = await supabase.rpc("guest_decline_counter_offer", { p_request_id: requestId });
  if (error) throw new Error(error.message);

  redirect("/p/requests");
}
