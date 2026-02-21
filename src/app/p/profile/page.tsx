import { requireUser, getProfile } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { upsertProfile } from "./actions";

export default async function Page() {
  const user = await requireUser();
  const profile = await getProfile();
  return (
    <div className="mx-auto max-w-xl">
      <div className="text-2xl font-semibold">Your information</div>
      <p className="mt-2 text-sm text-ink/70">Phone is required for coordination.</p>
      <Card className="mt-6">
        <form action={upsertProfile} className="space-y-4">
          <Input label="Email" defaultValue={user.email ?? ""} disabled />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="First name" name="first_name" required defaultValue={profile?.first_name ?? ""} />
            <Input label="Last name" name="last_name" required defaultValue={profile?.last_name ?? ""} />
          </div>
          <Input label="Phone (required)" name="phone" required defaultValue={profile?.phone ?? ""} placeholder="+1 555 123 4567" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Reservation number (optional)" name="reservation_number" defaultValue={profile?.reservation_number ?? ""} />
            <Input label="Room number (optional)" name="room_number" defaultValue={profile?.room_number ?? ""} />
          </div>
          <Button type="submit" className="w-full" variant="teal">Save</Button>
        </form>
      </Card>
    </div>
  );
}
