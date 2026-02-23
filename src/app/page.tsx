"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Supabase recovery link is coming as URL hash on the root page:
    // /#access_token=...&refresh_token=...&type=recovery
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;

    if (!hash) return;

    const params = new URLSearchParams(hash);
    if (params.get("type") === "recovery") {
      // Send to reset page and keep hash so /auth/reset can setSession
      router.replace("/auth/reset" + window.location.hash);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="text-3xl font-semibold">Civana Privates</div>
        <p className="mt-2 text-sm text-ink/70">
          Guest QR portal + staff portal. Handshake required: leaders send counter-offer, guests accept/decline.
        </p>
        <div className="mt-6 flex gap-3 flex-wrap">
          <Link className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white" href="/p">
            Guest portal
          </Link>
          <Link className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium" href="/staff">
            Staff portal
          </Link>
        </div>
      </div>
    </div>
  );
}
