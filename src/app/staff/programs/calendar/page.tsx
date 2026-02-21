import { requireLeader } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import CalendarClient from "./CalendarClient";

export default async function Page() {
  await requireLeader();
  const supabase = supabaseServer();
  const { data: events } = await supabase
    .from("private_requests")
    .select(
      "id,status,approved_start_datetime,approved_end_datetime, cls:private_classes(name), location:locations(name)"
    )
    .eq("status", "approved")
    .order("approved_start_datetime", { ascending: true });

  const mapped = (events ?? []).map((e: any) => ({
    id: e.id,
    title: `${e.cls?.name ?? "Private"}${e.location?.name ? ` • ${e.location.name}` : ""}`,
    start: e.approved_start_datetime,
    end: e.approved_end_datetime
  }));

  return (
    <div>
      <div className="text-2xl font-semibold">Calendar</div>
      <div className="mt-1 text-sm text-ink/70">Approved private sessions.</div>
      <Card className="mt-6">
        <CalendarClient events={mapped} />
      </Card>
    </div>
  );
}
