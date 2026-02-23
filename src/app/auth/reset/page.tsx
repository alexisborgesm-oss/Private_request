"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ResetPasswordPage() {
  const supabase = supabaseBrowser();

  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase put tokens in hash
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;

    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const type = params.get("type");

    if (type !== "recovery") {
      setMsg("This link is not a password recovery link.");
      setReady(true);
      return;
    }

    if (!access_token || !refresh_token) {
      setMsg("Recovery tokens not found in URL. Please request a new reset link.");
      setReady(true);
      return;
    }

    (async () => {
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) setMsg(error.message);
      setReady(true);

      // Optional: clean hash from URL after session set
      // history.replaceState(null, "", "/auth/reset");
    })();
  }, [supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (password.length < 8) {
      setMsg("Password must be at least 8 characters.");
      return;
    }
    if (password !== password2) {
      setMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg("Password updated. You can now sign in with email + password.");
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="text-2xl font-semibold">Reset password</div>
      <p className="mt-2 text-sm text-ink/70">Choose a new password.</p>

      <div className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-soft">
        {!ready ? (
          <div className="text-sm text-ink/70">Preparing reset…</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <Input
              label="New password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
            />

            <Input
              label="Confirm new password"
              name="password2"
              type="password"
              autoComplete="new-password"
              required
              value={password2}
              onChange={(e: any) => setPassword2(e.target.value)}
            />

            <Button type="submit" variant="teal" disabled={loading}>
              {loading ? "Updating..." : "Update password"}
            </Button>

            {msg ? <div className="text-sm text-ink/70">{msg}</div> : null}
          </form>
        )}
      </div>
    </div>
  );
}
