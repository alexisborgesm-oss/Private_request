"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function PostAuth() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        router.replace("/");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role,first_name,last_name,phone")
        .eq("id", u.user.id)
        .maybeSingle();

      const role = profile?.role ?? "guest";

      if (role === "programs_leader") {
        router.replace("/staff/programs/requests");
        return;
      }
      if (role === "front_desk") {
        router.replace("/staff"); // o tu ruta real de front desk
        return;
      }

      // guest
      const needsProfile =
        !profile?.first_name || !profile?.last_name || !profile?.phone;

      router.replace(needsProfile ? "/p/profile" : "/p/requests");
    })();
  }, [router, supabase]);

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="text-xl font-semibold">Loading…</div>
      <p className="mt-2 text-sm text-ink/70">Redirecting you to the right portal.</p>
    </div>
  );
}
