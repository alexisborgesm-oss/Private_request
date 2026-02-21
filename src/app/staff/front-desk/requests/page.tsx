import { requireStaff } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";

function Status({ s }: { s: string }) {
  if (s === "pending") return <Tag tone="teal">Pending</Tag>;
  if (s === "counter_proposed") return <Tag tone="amber">Counter</Tag>;
  if (s === "approved") return <Tag tone="teal">Approved</Tag>;
  if (s === "rejected") return <Tag tone="red">Rejected</Tag>;
  if (s === "declined_by_guest") return <Tag tone="red">Declined</Tag>;
  return <Tag>{s}</Tag>;
}

export default async function Page() {
  await requireStaff();
  const supabase = supabaseServer();
  const { data: rows, error } = await supabase
    .from("private_requests")
    .select(
      "id,status,party_size,requested_datetime, created_at, guest:profiles(first_name,last_name,email,phone,reservation_number,room_number), cls:private_classes(name)"
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (
    <div>
      <div className="text-2xl font-semibold">Front desk — Requests</div>
      <div className="mt-1 text-sm text-ink/70">Read-only view.</div>

      <div className="mt-6 space-y-4">
        {(rows ?? []).map((r: any) => (
          <Card key={r.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-base font-semibold">{r.cls?.name ?? "Private"}</div>
                  <Status s={r.status} />
                </div>
                <div className="mt-2 text-sm text-ink/70">
                  Guest: <span className="font-medium">{r.guest?.first_name} {r.guest?.last_name}</span> • {r.guest?.email}
                </div>
                <div className="mt-1 text-sm text-ink/70">Phone: <span className="font-medium">{r.guest?.phone}</span></div>
                <div className="mt-1 text-sm text-ink/70">
                  Reservation: <span className="font-medium">{r.guest?.reservation_number ?? "—"}</span> • Room: <span className="font-medium">{r.guest?.room_number ?? "—"}</span>
                </div>
                <div className="mt-2 text-sm text-ink/70">
                  Requested: <span className="font-medium">{new Date(r.requested_datetime).toLocaleString()}</span> • Party size: <span className="font-medium">{r.party_size}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {(rows ?? []).length === 0 ? <Card><div className="text-sm text-ink/70">No requests.</div></Card> : null}
      </div>
    </div>
  );
}
