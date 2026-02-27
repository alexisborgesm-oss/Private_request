import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
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
  // ✅ retorna el user autenticado
  const user = await requireUser();

  const supabase = supabaseServer();

  // ✅ lee SOLO el role para decidir si es staff o guest
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (pErr) throw new Error(pErr.message);

  // ✅ si es staff, que nunca caiga en guest portal
  if (profile?.role === "front_desk" || profile?.role === "programs_leader") {
    redirect("/staff");
  }

  // ✅ si no existe profile todavía, onboarding guest
  if (!profile) {
    redirect("/p/profile");
  }

  // ✅ IMPORTANTE: filtra por guest_id (si no, intentas leer requests de todos)
  const { data: rows, error } = await supabase
  .from("private_requests")
  .select(
    "id,status,party_size,requested_datetime,final_price,approved_start_datetime,proposed_price,proposed_start_datetime, location:locations!private_requests_location_id_fkey(name), proposed_location:locations!private_requests_proposed_location_id_fkey(name), instructor:instructors!private_requests_instructor_id_fkey(name), proposed_instructor:instructors!private_requests_proposed_instructor_id_fkey(name), cls:private_classes(name,duration_minutes,base_price)"
  )
  .eq("guest_id", user.id)
  .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold">My private requests</div>
          <div className="mt-1 text-sm text-ink/70">
            Edit only while pending. Counter-offers require accept/decline.
          </div>
        </div>
        <Link href="/p/requests/new">
          <Button variant="teal">New request</Button>
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        {(rows ?? []).map((r: any) => {
          const cls = Array.isArray(r.cls) ? r.cls[0] : r.cls;
          const proposedLocation = Array.isArray(r.proposed_location) ? r.proposed_location[0] : r.proposed_location;
          const proposedInstructor = Array.isArray(r.proposed_instructor) ? r.proposed_instructor[0] : r.proposed_instructor;
          return (
            <Card key={r.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-base font-semibold">{cls?.name ?? "Private class"}</div>
                    <Status s={r.status} />
                  </div>

                  <div className="mt-2 text-sm text-ink/70">
                    Requested:{" "}
                    <span className="font-medium">
                      {new Date(r.requested_datetime).toLocaleString()}
                    </span>{" "}
                    • Party size: <span className="font-medium">{r.party_size}</span>
                  </div>

                  {r.status === "counter_proposed" ? (
                    <div className="mt-2 text-sm text-ink/70">
                      Offer:{" "}
                      <span className="font-medium">
                        {new Date(r.proposed_start_datetime).toLocaleString()}
                      </span>{" "}
                      • Price: <span className="font-medium">${r.proposed_price}</span>
                    </div>
                  ) : null}

                  {r.status === "approved" ? (
                    <div className="mt-2 text-sm text-ink/70">
                      Confirmed:{" "}
                      <span className="font-medium">
                        {new Date(r.approved_start_datetime).toLocaleString()}
                      </span>
                      {proposedLocation?.name ? (
                        <>
                          {" "}
                          • Location: <span className="font-medium">{proposedLocation.name}</span>
                        </>
                      ) : null}
                      {proposedInstructor?.name ? (
                        <>
                          {" "}
                          • Instructor: <span className="font-medium">{proposedInstructor.name}</span>
                        </>
                      ) : null}
                      {r.final_price ? (
                        <>
                          {" "}
                          • Price: <span className="font-medium">${r.final_price}</span>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {r.status === "pending" ? (
                  <Link href={`/p/requests/${r.id}/edit`}>
                    <Button>Edit</Button>
                  </Link>
                ) : (
                  <Link href={`/p/requests/${r.id}`}>
                    <Button variant="outline">View</Button>
                  </Link>
                )}
              </div>
            </Card>
          );
        })}

        {(rows ?? []).length === 0 ? (
          <Card>
            <div className="text-sm text-ink/70">No requests yet.</div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
