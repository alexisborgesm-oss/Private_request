import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser, getProfile } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";

function Status({ s }: { s: string }) {
  if (s === "pending") return <Tag tone="teal">Pending</Tag>;
  if (s === "counter_proposed") return <Tag tone="amber">Counter-offer</Tag>;
  if (s === "approved") return <Tag tone="teal">Approved</Tag>;
  if (s === "rejected") return <Tag tone="red">Rejected</Tag>;
  if (s === "declined_by_guest") return <Tag tone="red">Declined</Tag>;
  return <Tag>{s}</Tag>;
}

export default async function Page() {
  await requireUser();
  const profile = await getProfile();
  if (!profile) redirect("/p/profile");

  const supabase = supabaseServer();
  const { data: rows, error } = await supabase
    .from("private_requests")
    .select(
      "id,status,party_size,requested_datetime,final_price,approved_start_datetime,proposed_price,proposed_start_datetime, location:locations(name), instructor:instructors(name), cls:private_classes(name,duration_minutes,base_price)"
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold">My private requests</div>
          <div className="mt-1 text-sm text-ink/70">Edit only while pending. Counter-offers require accept/decline.</div>
        </div>
        <Link href="/p/requests/new"><Button variant="teal">New request</Button></Link>
      </div>

      <div className="mt-6 space-y-4">
        {(rows ?? []).map((r: any) => (
          <Card key={r.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-base font-semibold">{r.cls?.name ?? "Private class"}</div>
                  <Status s={r.status} />
                </div>
                <div className="mt-2 text-sm text-ink/70">
                  Requested: <span className="font-medium">{new Date(r.requested_datetime).toLocaleString()}</span> • Party size: <span className="font-medium">{r.party_size}</span>
                </div>
                {r.status === "counter_proposed" ? (
                  <div className="mt-2 text-sm text-ink/70">
                    Offer: <span className="font-medium">{new Date(r.proposed_start_datetime).toLocaleString()}</span> • Price: <span className="font-medium">${r.proposed_price}</span>
                  </div>
                ) : null}
                {r.status === "approved" ? (
                  <div className="mt-2 text-sm text-ink/70">
                    Confirmed: <span className="font-medium">{new Date(r.approved_start_datetime).toLocaleString()}</span>
                    {r.location?.name ? <> • Location: <span className="font-medium">{r.location.name}</span></> : null}
                    {r.instructor?.name ? <> • Instructor: <span className="font-medium">{r.instructor.name}</span></> : null}
                    {r.final_price ? <> • Price: <span className="font-medium">${r.final_price}</span></> : null}
                  </div>
                ) : null}
              </div>

              {r.status === "pending" ? (
                <Link href={`/p/requests/${r.id}/edit`}><Button>Edit</Button></Link>
              ) : (
                <Link href={`/p/requests/${r.id}`}><Button variant="outline">View</Button></Link>
              )}
            </div>
          </Card>
        ))}
        {(rows ?? []).length === 0 ? <Card><div className="text-sm text-ink/70">No requests yet.</div></Card> : null}
      </div>
    </div>
  );
}
