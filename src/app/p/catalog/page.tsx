import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser, getProfile } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default async function Page() {
  await requireUser();
  const profile = await getProfile();
  if (!profile) redirect("/p/profile");

  const supabase = supabaseServer();
  const { data: classes, error } = await supabase
    .from("private_classes")
    .select("id,name,description,duration_minutes,base_price,active")
    .eq("active", true)
    .order("name");
  if (error) throw new Error(error.message);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold">Private class catalog</div>
          <div className="mt-1 text-sm text-ink/70">Choose a class to request a private session.</div>
        </div>
        <Link href="/p/requests/new"><Button variant="teal">New request</Button></Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        {(classes ?? []).map((c: any) => (
          <Card key={c.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-lg font-semibold">{c.name}</div>
                {c.description ? <div className="mt-1 text-sm text-ink/70">{c.description}</div> : null}
                <div className="mt-3 text-sm text-ink/70">
                  <span className="font-medium">{c.duration_minutes} min</span> • <span className="font-medium">${c.base_price}</span> base price
                </div>
              </div>
              <Link href={`/p/requests/new?classId=${c.id}`}><Button>Request</Button></Link>
            </div>
          </Card>
        ))}
        {(classes ?? []).length === 0 ? <Card><div className="text-sm text-ink/70">No private classes are active yet.</div></Card> : null}
      </div>
    </div>
  );
}
