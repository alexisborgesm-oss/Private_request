"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function HashCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [msg, setMsg] = useState("Signing you in…");

  useEffect(() => {
    const supabase = supabaseBrowser();

    (async () => {
      try {
        const next = searchParams.get("next") ?? "/p";

        // Esto fuerza a Supabase a procesar el code PKCE
        const { error } = await supabase.auth.getUser();
        if (error) throw error;

        router.replace(next);
      } catch (e: any) {
        setMsg(e?.message ?? "Could not complete sign-in. Please request a new link.");
      }
    })();
  }, [router, searchParams]);

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="text-xl font-semibold">{msg}</div>
      <p className="mt-2 text-sm opacity-70">Please wait.</p>
    </div>
  );
}
