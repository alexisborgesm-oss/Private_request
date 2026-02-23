"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HashCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;

    const params = new URLSearchParams(hash);
    const type = params.get("type");

    if (type === "recovery") {
      // Pass the hash to reset page so it can setSession + update password
      router.replace("/auth/reset" + window.location.hash);
      return;
    }

    router.replace("/p");
  }, [router]);

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="text-xl font-semibold">Signing you in…</div>
      <p className="mt-2 text-sm text-ink/70">Please wait.</p>
    </div>
  );
}
