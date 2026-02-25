"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function HashCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [msg, setMsg] = useState<string>("Signing you in…");

  useEffect(() => {
    (async () => {
      try {
        const next = searchParams.get("next") ?? "/p";

        // 1) Si viene PKCE (?code=...), hacemos exchange
        const code = searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          router.replace(next);
          return;
        }

        // 2) Si viene implicit (#access_token=...), leemos el hash y creamos sesión
        const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
        if (error) throw error;

        if (!data.session) {
          setMsg("Session missing. Please request a new link.");
          return;
        }

        router.replace(next);
      } catch (e: any) {
        setMsg(e?.message ?? "Could not complete sign-in. Please request a new link.");
      }
    })();
  }, [router, searchParams, supabase]);

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="text-xl font-semibold">{msg}</div>
      <p className="mt-2 text-sm text-ink/70">Please wait.</p>
    </div>
  );
}
