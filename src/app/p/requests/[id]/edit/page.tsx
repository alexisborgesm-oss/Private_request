import { redirect } from "next/navigation";
import { requireUser, getProfile } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { updatePendingRequest } from "../../actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

export default async function Page({ params }: { params: { id: string } }) {
  await requireUser();
  const profile = await getProfile();
  if (!profile) redirect("/p/profile");

  const supabase = supabaseServer();
  const { data: req, error: e0 } = await supabase
    .from("private_requests")
    .select("id,status,class_id,party_size,requested_datetime,guest_message")
    .eq("id", params.id)
    .maybeSingle();
  if (e0) throw new Error(e0.message);
  if (!req) redirect("/p/requests");
  if (req.status !== "pending") redirect(`/p/requests/${params.id}`);

  const { data: classes, error } = await supabase
    .from("private_classes")
    .select("id,name,duration_minutes,base_price,active")
    .eq("active", true)
    .order("name");
  if (error) throw new Error(error.message);

  const action = updatePendingRequest.bind(null, params.id);
  const dtLocal = new Date(req.requested_datetime).toISOString().slice(0, 16);

  return (
    <div className="mx-auto max-w-xl">
      <div className="text-2xl font-semibold">Edit request</div>
      <p className="mt-2 text-sm text-ink/70">Editable only while pending.</p>
      <Card className="mt-6">
        <form action={action} className="space-y-4">
          <Select label="Private class" name="class_id" required defaultValue={req.class_id}>
            {(classes ?? []).map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.duration_minutes} min — ${c.base_price} base
              </option>
            ))}
          </Select>
          <Input label="Number of people" name="party_size" type="number" min={1} defaultValue={req.party_size} required />
          <Input label="Desired date & time" name="requested_datetime" type="datetime-local" required defaultValue={dtLocal} />
          <Textarea
            label="Questions / Notes (optional)"
            name="guest_message"
            defaultValue={req.guest_message ?? ""}
            placeholder="Tell us what you’re looking for (goals, experience level, any injuries, preferences)."
          />
          <Button type="submit" className="w-full" variant="teal">Save changes</Button>
        </form>
      </Card>
    </div>
  );
}
