import { requireLeader } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tag } from "@/components/ui/Tag";
import Link from "next/link";

function Status({ s }: { s: string }) {
  if (s === "pending") return <Tag tone="teal">Pending</Tag>;
  if (s === "counter_proposed") return <Tag tone="amber">Awaiting guest</Tag>;
  if (s === "approved") return <Tag tone="teal">Approved</Tag>;
  if (s === "rejected") return <Tag tone="red">Rejected</Tag>;
  if (s === "declined_by_guest") return <Tag tone="red">Declined</Tag>;
  return <Tag>{s}</Tag>;
}

export default async function Page({ params }: { params: { id: string } }) {
  await requireLeader();
  const supabase = supabaseServer();

  const { data: r, error } = await supabase
    .from("private_requests")
    .select(
      "id,status,party_size,requested_datetime, guest_message, guest:profiles(first_name,last_name,email,phone,reservation_number,room_number), cls:private_classes(id,name,duration_minutes,base_price), proposed_price, proposed_start_datetime, proposed_end_datetime, proposed_location_id, proposed_instructor_id, proposed_location:locations!private_requests_proposed_location_id_fkey(id,name), proposed_instructor:instructors!private_requests_proposed_instructor_id_fkey(id,name), location:locations(name), instructor:instructors(name), final_price, approved_start_datetime, approved_end_datetime"
    )
    .eq("id", params.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!r) return <div>Not found.</div>;

  const { data: locations } = await supabase.from("locations").select("id,name,active").eq("active", true).order("name");
  const { data: instructors } = await supabase.from("instructors").select("id,name,active").eq("active", true).order("name");

  const canPropose = r.status === "pending";

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold">{r.cls?.name ?? "Request"}</div>
          <div className="mt-2"><Status s={r.status} /></div>
        </div>
        <Link href="/staff/programs/requests"><Button variant="outline">Back</Button></Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card>
          <div className="text-sm font-semibold">Guest</div>
          <div className="mt-2 text-sm text-ink/70">
            <div><span className="font-medium">{r.guest?.first_name} {r.guest?.last_name}</span> • {r.guest?.email}</div>
            <div>Phone: <span className="font-medium">{r.guest?.phone}</span></div>
            <div>Reservation: <span className="font-medium">{r.guest?.reservation_number ?? "—"}</span> • Room: <span className="font-medium">{r.guest?.room_number ?? "—"}</span></div>
          </div>
          {r.guest_message ? <div className="mt-3 text-sm text-ink/70"><span className="font-medium">Notes:</span> {r.guest_message}</div> : null}
        </Card>

        <Card>
          <div className="text-sm font-semibold">Request</div>
          <div className="mt-2 text-sm text-ink/70">
            Requested: <span className="font-medium">{new Date(r.requested_datetime).toLocaleString()}</span>
          </div>
          <div className="mt-1 text-sm text-ink/70">
            Party size: <span className="font-medium">{r.party_size}</span> • Duration: <span className="font-medium">{r.cls?.duration_minutes} min</span> • Base: <span className="font-medium">${r.cls?.base_price}</span>
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold">Counter-offer (Handshake required)</div>
          <div className="mt-2 text-xs text-ink/60">
            Create a counter-offer. Guest must accept or decline. If declined, status becomes <b>declined_by_guest</b> (final).
          </div>

          {canPropose ? (
            <form
              className="mt-4 space-y-4"
              action={async (formData) => {
                "use server";
                const supabase = supabaseServer();
                const { error } = await supabase.rpc("leader_propose_counter_offer", {
                  p_request_id: params.id,
                  p_start: String(formData.get("start")),
                  p_end: String(formData.get("end")),
                  p_price: Number(formData.get("price")),
                  p_location_id: String(formData.get("location_id")),
                  p_instructor_id: String(formData.get("instructor_id"))
                });
                if (error) throw new Error(error.message);
              }}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input label="Start" name="start" type="datetime-local" required />
                <Input label="End" name="end" type="datetime-local" required />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input label="Price (final)" name="price" type="number" min={0} step={1} required />
                <div />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Select label="Location" name="location_id" required>
                  <option value="" disabled>Select</option>
                  {(locations ?? []).map((l: any) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </Select>
                <Select label="Instructor" name="instructor_id" required>
                  <option value="" disabled>Select</option>
                  {(instructors ?? []).map((i: any) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </Select>
              </div>
              <Button type="submit" variant="teal">Send counter-offer</Button>
            </form>
          ) : (
            <div className="mt-4 space-y-2 text-sm text-ink/70">
              {r.proposed_start_datetime ? (
                <>
                  <div>Proposed start: <span className="font-medium">{new Date(r.proposed_start_datetime).toLocaleString()}</span></div>
                  <div>Proposed end: <span className="font-medium">{new Date(r.proposed_end_datetime).toLocaleString()}</span></div>
                  <div>Proposed location: <span className="font-medium">{r.proposed_location?.name ?? "—"}</span></div>
                  <div>Proposed instructor: <span className="font-medium">{r.proposed_instructor?.name ?? "—"}</span></div>
                  <div>Proposed price: <span className="font-medium">${r.proposed_price}</span></div>
                </>
              ) : (
                <div>No counter-offer yet.</div>
              )}
            </div>
          )}

          {r.status === "approved" ? (
            <div className="mt-6 rounded-xl border border-border p-4">
              <div className="text-sm font-semibold">Confirmed</div>
              <div className="mt-2 text-sm text-ink/70">Start: <span className="font-medium">{new Date(r.approved_start_datetime).toLocaleString()}</span></div>
              <div className="mt-1 text-sm text-ink/70">End: <span className="font-medium">{new Date(r.approved_end_datetime).toLocaleString()}</span></div>
              <div className="mt-1 text-sm text-ink/70">Instructor: <span className="font-medium">{r.instructor?.name ?? "TBD"}</span></div>
              <div className="mt-1 text-sm text-ink/70">Location: <span className="font-medium">{r.location?.name ?? "TBD"}</span></div>
              <div className="mt-1 text-sm text-ink/70">Price: <span className="font-medium">${r.final_price}</span></div>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
