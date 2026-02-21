import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser, getProfile } from "@/lib/auth/guards";
import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { acceptCounterOffer, declineCounterOffer } from "../actions";

function Status({ s }: { s: string }) {
  if (s === "pending") return <Tag tone="teal">Pending</Tag>;
  if (s === "counter_proposed") return <Tag tone="amber">Counter-offer</Tag>;
  if (s === "approved") return <Tag tone="teal">Approved</Tag>;
  if (s === "rejected") return <Tag tone="red">Rejected</Tag>;
  if (s === "declined_by_guest") return <Tag tone="red">Declined</Tag>;
  return <Tag>{s}</Tag>;
}

type NameObj = { name: any } | null;
type PrivateClassObj =
  | { name: any; duration_minutes: any; base_price: any }
  | null;

function firstOrSelf<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function Page({ params }: { params: { id: string } }) {
  await requireUser();
  const profile = await getProfile();
  if (!profile) redirect("/p/profile");

  const supabase = supabaseServer();

  const { data: r, error } = await supabase
    .from("private_requests")
    .select(
      `
      id,
      status,
      party_size,
      requested_datetime,
      guest_message,
      proposed_start_datetime,
      proposed_end_datetime,
      proposed_price,
      final_price,
      approved_start_datetime,
      approved_end_datetime,
      proposed_location:locations!private_requests_proposed_location_id_fkey(name),
      proposed_instructor:instructors!private_requests_proposed_instructor_id_fkey(name),
      location:locations(name),
      instructor:instructors(name),
      private_class:private_classes(name, duration_minutes, base_price)
    `
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!r) redirect("/p/requests");

  const privateClass = firstOrSelf(r.private_class as any) as PrivateClassObj;
  const proposedLocation = firstOrSelf(r.proposed_location as any) as NameObj;
  const proposedInstructor = firstOrSelf(r.proposed_instructor as any) as NameObj;
  const location = firstOrSelf(r.location as any) as NameObj;
  const instructor = firstOrSelf(r.instructor as any) as NameObj;

  const acceptAction = acceptCounterOffer.bind(null, params.id);
  const declineAction = declineCounterOffer.bind(null, params.id);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold">
            {privateClass?.name ?? "Private request"}
          </div>
          <div className="mt-2">
            <Status s={r.status} />
          </div>
        </div>
        <Link href="/p/requests">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      <Card className="mt-6 space-y-2">
        <div className="text-sm text-ink/70">
          Requested:{" "}
          <span className="font-medium">
            {r.requested_datetime ? new Date(r.requested_datetime).toLocaleString() : "TBD"}
          </span>
        </div>
        <div className="text-sm text-ink/70">
          Party size: <span className="font-medium">{r.party_size ?? "—"}</span>
        </div>
        <div className="text-sm text-ink/70">
          Base price:{" "}
          <span className="font-medium">
            {privateClass?.base_price != null ? `$${privateClass.base_price}` : "—"}
          </span>{" "}
          • Duration:{" "}
          <span className="font-medium">
            {privateClass?.duration_minutes != null ? `${privateClass.duration_minutes} min` : "—"}
          </span>
        </div>
        {r.guest_message ? (
          <div className="pt-2 text-sm text-ink/70">
            <span className="font-medium">Notes:</span> {r.guest_message}
          </div>
        ) : null}
      </Card>

      {r.status === "pending" ? (
        <div className="mt-4">
          <Link href={`/p/requests/${r.id}/edit`}>
            <Button>Edit</Button>
          </Link>
        </div>
      ) : null}

      {r.status === "counter_proposed" ? (
        <Card className="mt-6 space-y-2">
          <div className="text-sm font-semibold">Counter-offer from Programs</div>

          <div className="text-sm text-ink/70">
            Start:{" "}
            <span className="font-medium">
              {r.proposed_start_datetime ? new Date(r.proposed_start_datetime).toLocaleString() : "TBD"}
            </span>
          </div>

          <div className="text-sm text-ink/70">
            End:{" "}
            <span className="font-medium">
              {r.proposed_end_datetime ? new Date(r.proposed_end_datetime).toLocaleString() : "TBD"}
            </span>
          </div>

          <div className="text-sm text-ink/70">
            Location: <span className="font-medium">{proposedLocation?.name ?? "TBD"}</span>
          </div>

          <div className="text-sm text-ink/70">
            Instructor: <span className="font-medium">{proposedInstructor?.name ?? "TBD"}</span>
          </div>

          <div className="text-sm text-ink/70">
            Price: <span className="font-medium">{r.proposed_price != null ? `$${r.proposed_price}` : "TBD"}</span>
          </div>

          <div className="pt-3 flex flex-wrap gap-2">
            <form action={acceptAction}>
              <Button type="submit" variant="teal">Accept offer</Button>
            </form>
            <form action={declineAction}>
              <Button type="submit" variant="outline">Decline</Button>
            </form>
          </div>

          <div className="text-xs text-ink/50">
            If you decline, this request will be closed. You can create a new request anytime.
          </div>
        </Card>
      ) : null}

      {r.status === "approved" ? (
        <Card className="mt-6 space-y-2">
          <div className="text-sm font-semibold">Confirmed</div>

          <div className="text-sm text-ink/70">
            Start:{" "}
            <span className="font-medium">
              {r.approved_start_datetime ? new Date(r.approved_start_datetime).toLocaleString() : "TBD"}
            </span>
          </div>

          <div className="text-sm text-ink/70">
            End:{" "}
            <span className="font-medium">
              {r.approved_end_datetime ? new Date(r.approved_end_datetime).toLocaleString() : "TBD"}
            </span>
          </div>

          <div className="text-sm text-ink/70">
            Location: <span className="font-medium">{location?.name ?? "TBD"}</span>
          </div>

          <div className="text-sm text-ink/70">
            Instructor: <span className="font-medium">{instructor?.name ?? "TBD"}</span>
          </div>

          <div className="text-sm text-ink/70">
            Price: <span className="font-medium">{r.final_price != null ? `$${r.final_price}` : "TBD"}</span>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
