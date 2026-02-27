"use client";
export const dynamic = "force-dynamic";
export const revalidate = 0;
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

function parseHashTokens(hash: string) {
  // hash viene como "#access_token=...&refresh_token=...&type=magiclink"
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(raw);
  const access_token = params.get("access_token") ?? undefined;
  const refresh_token = params.get("refresh_token") ?? undefined;
  return { access_token, refresh_token };
}

export default function HashCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [msg, setMsg] = useState("Signing you in…");

  useEffect(() => {
    (async () => {
      try {
        const next = searchParams.get("next") ?? "/p";

        // 1) PKCE flow (?code=...)
        const code = searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          router.replace(next);
          return;
        }

        // 2) Implicit flow (#access_token=...&refresh_token=...)
        const { access_token, refresh_token } = parseHashTokens(window.location.hash);

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) throw error;

          // Limpia el hash para que no quede el token en la URL
          window.history.replaceState(null, "", window.location.pathname + window.location.search);

          router.replace(next);
          return;
        }

        setMsg("Session missing. Please request a new link.");
      } catch (e: any) {
        setMsg(e?.message ?? "Could not complete sign-in. Please request a new link.");
      }
    })();
  }, [router, searchParams, supabase]);

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="text-xl font-semibold">{msg}</div>
      <p className="mt-2 text-sm opacity-70">Please wait.</p>
    </div>
  );
}
