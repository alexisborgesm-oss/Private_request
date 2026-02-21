import { requireLeader } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default async function Page() {
  await requireLeader();
  const supabase = supabaseServer();
  const { data: rows } = await supabase.from("private_classes").select("*").order("name");

  async function create(formData: FormData) {
    "use server";
    const supabase = supabaseServer();
    const name = String(formData.get("name") ?? "").trim();
    const duration_minutes = Number(formData.get("duration_minutes") ?? 60);
    const base_price = Number(formData.get("base_price") ?? 0);
    const description = String(formData.get("description") ?? "").trim() || null;
    if (!name) throw new Error("Name required");
    const { error } = await supabase.from("private_classes").insert({ name, duration_minutes, base_price, description, active: true });
    if (error) throw new Error(error.message);
  }

  async function toggle(id: string, active: boolean) {
    "use server";
    const supabase = supabaseServer();
    const { error } = await supabase.from("private_classes").update({ active }).eq("id", id);
    if (error) throw new Error(error.message);
  }

  return (
    <div className="max-w-4xl">
      <div className="text-2xl font-semibold">Admin — Private classes</div>
      <Card className="mt-6">
        <form action={create} className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Input name="name" label="Name" required />
          <Input name="duration_minutes" label="Minutes" type="number" min={1} defaultValue={60} />
          <Input name="base_price" label="Base price" type="number" min={0} defaultValue={150} />
          <div className="flex items-end"><Button type="submit" variant="teal" className="w-full">Add</Button></div>
          <div className="md:col-span-4">
            <Input name="description" label="Description (optional)" />
          </div>
        </form>
      </Card>

      <div className="mt-6 space-y-3">
        {(rows ?? []).map((r: any) => (
          <Card key={r.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold">{r.name}</div>
                <div className="mt-1 text-sm text-ink/70">{r.duration_minutes} min • ${r.base_price} base • {r.active ? "Active" : "Inactive"}</div>
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
