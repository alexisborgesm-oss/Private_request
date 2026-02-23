"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function getHashParam(name: string) {
  const raw = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const params = new URLSearchParams(raw);
  return params.get(name);
}

export default function ResetPasswordPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  useEffect(() => {
    (async () => {
      setMsg(null);

      // Read tokens from URL hash
      const type = getHashParam("type");
      const access_token = getHashParam("access_token");
      const refresh_token = getHashParam("refresh_token");

      if (type !== "recovery") {
        setMsg("This link is not a recovery link. Please request a new reset link.");
        setReady(true);
        return;
      }

      if (!access_token || !refresh_token) {
        setMsg("Recovery link is missing tokens. Please request a new reset link.");
        setReady(true);
        return;
      }

      // Set session BEFORE allowing password update
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });

      if (error) {
        setMsg(error.message);
        setReady(true);
        return;
      }

      // Verify session exists now
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setMsg("Auth session missing. Please request a new reset link.");
        setReady(true);
        return;
      }

      // Optional: clean URL after session set (avoid leaking tokens)
      // history.replaceState(null, "", "/auth/reset");

      setReady(true);
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

    setMsg("Password updated successfully. You can now sign in.");
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
          {msg ? (
              <div className="mt-3 text-sm text-ink/70">
                {msg}
                <div className="mt-3">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => (window.location.href = "/staff/login")}
                  >
                    Go to staff login
                  </Button>
                </div>
              </div>
            ) : null}
         </>
        )}
      </div>
    </div>
  );
}
