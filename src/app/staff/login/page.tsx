"use client";

import { useRef, useState, useTransition } from "react";
import { staffPasswordLogin } from "./action";

export default function Page() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const fd = new FormData(formRef.current ?? undefined);

    startTransition(async () => {
      const res = await staffPasswordLogin(fd);

      if (!res.ok) {
        setErr(res.error === "missing" ? "Email and password are required." : "Invalid credentials.");
        return;
      }

      // ✅ Hard navigation: garantiza SSR con cookies ya aplicadas
      window.location.assign("/staff");
    });
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="text-2xl font-semibold">Staff sign-in</div>
      <p className="mt-2 text-sm text-ink/70">
        Sign in with email + password (no emails, no rate limits).
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-soft">
        <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              placeholder="you@company.com"
              disabled={isPending}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              placeholder="••••••••"
              disabled={isPending}
            />
          </div>

          <button
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            disabled={isPending}
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>

          {err ? <div className="text-sm text-red-600">{err}</div> : null}
        </form>
      </div>
    </div>
  );
}
