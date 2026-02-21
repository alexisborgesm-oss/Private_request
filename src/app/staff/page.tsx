import { requireStaff } from "@/lib/auth";
import { Card } from "@/components/ui/Card";

export default async function Page() {
  const { role } = await requireStaff();
  return (
    <div className="max-w-3xl">
      <div className="text-2xl font-semibold">Staff Home</div>
      <div className="mt-1 text-sm text-ink/70">Signed in as <span className="font-medium">{role}</span>.</div>
      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card>
          <div className="text-sm font-semibold">Operational notes</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-ink/70 space-y-1">
            <li>Guests can edit requests only while <b>pending</b>.</li>
            <li>Programs Leader must send a <b>counter-offer</b> (time/place/instructor/price).</li>
            <li>Handshake required: guest must <b>Accept</b> or <b>Decline</b>. If declined → <b>declined_by_guest</b> final.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
