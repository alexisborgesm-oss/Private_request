import { requireLeader } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default async function Page() {
  await requireLeader();
  const supabase = supabaseServer();
  const { data: rows } = await supabase.from("instructors").select("*").order("name");

  async function create(formData: FormData) {
    "use server";
    const supabase = supabaseServer();
    const name = String(formData.get("name") ?? "").trim();
    if (!name) throw new Error("Name required");
    const { error } = await supabase.from("instructors").insert({ name, active: true });
    if (error) throw new Error(error.message);
  }

  async function toggle(id: string, active: boolean) {
    "use server";
    const supabase = supabaseServer();
    const { error } = await supabase.from("instructors").update({ active }).eq("id", id);
    if (error) throw new Error(error.message);
  }

  return (
    <div className="max-w-4xl">
      <div className="text-2xl font-semibold">Admin — Instructors</div>
      <Card className="mt-6">
        <form action={create} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[260px]"><Input name="name" label="Name" required /></div>
          <Button type="submit" variant="teal">Add</Button>
        </form>
      </Card>
      <div className="mt-6 space-y-3">
        {(rows ?? []).map((r: any) => (
          <Card key={r.id}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold">{r.name}</div>
                <div className="text-sm text-ink/70">{r.active ? "Active" : "Inactive"}</div>
              </div>
              <form action={toggle.bind(null, r.id, !r.active)}>
                <Button variant="outline" type="submit">{r.active ? "Deactivate" : "Activate"}</Button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
