"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Supabase recovery links can return tokens in the URL hash (#...)
 * Hash is only accessible in the browser, not in route handlers.
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Parse hash params: #access_token=...&type=recovery...
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;

    const params = new URLSearchParams(hash);
    const type = params.get("type");

    // If it's a recovery link, go to reset screen
    if (type === "recovery") {
      router.replace("/auth/reset" + window.location.hash);
      return;
    }

    // If not recovery, default to guest portal
    router.replace("/p");
  }, [router]);

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="text-xl font-semibold">Signing you in…</div>
      <p className="mt-2 text-sm text-ink/70">Please wait.</p>
    </div>
  );
}
