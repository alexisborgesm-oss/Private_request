import { redirect } from "next/navigation";
import { requireUser, getProfile } from "@/lib/auth";

export default async function Page() {
  await requireUser();
  const profile = await getProfile();
  if (!profile) redirect("/p/profile");
  redirect("/p/requests");
}
