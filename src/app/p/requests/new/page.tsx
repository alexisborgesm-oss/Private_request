import { redirect } from "next/navigation";
import { requireUser, getProfile } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { createRequest } from "../actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

export default async function Page({ searchParams }: { searchParams: { classId?: string } }) {
  await requireUser();
  const profile = await getProfile();
  if (!profile) redirect("/p/profile");

  const supabase = supabaseServer();
  const { data: classes, error } = await supabase
    .from("private_classes")
    .select("id,name,duration_minutes,base_price,active")
    .eq("active", true)
    .order("name");
  if (error) throw new Error(error.message);

  return (
    <div className="mx-auto max-w-xl">
      <div className="text-2xl font-semibold">New private request</div>
      <p className="mt-2 text-sm text-ink/70">Staff will send a counter-offer you must accept/decline.</p>
      <Card className="mt-6">
        <form action={createRequest} className="space-y-4">
          <Select label="Private class" name="class_id" required defaultValue={searchParams.classId ?? ""}>
            <option value="" disabled>Select a class</option>
            {(classes ?? []).map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.duration_minutes} min — ${c.base_price} base
              </option>
            ))}
          </Select>
          <Input label="Number of people" name="party_size" type="number" min={1} defaultValue={1} required />
          <Input label="Desired date & time" name="requested_datetime" type="datetime-local" required hint="Phoenix time." />
          <Textarea
            label="Questions / Notes (optional)"
            name="guest_message"
            placeholder="Tell us what you’re looking for (goals, experience level, any injuries, preferences)."
          />
          <Button type="submit" className="w-full" variant="teal">Submit request</Button>
        </form>
      </Card>
    </div>
  );
}
