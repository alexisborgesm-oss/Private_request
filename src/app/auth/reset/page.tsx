"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ResetPasswordPage() {
  const supabase = supabaseBrowser();

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

    setMsg("Password updated. You can sign in now.");
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="text-2xl font-semibold">Reset password</div>
      <p className="mt-2 text-sm text-ink/70">
        Set your new password below.
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-soft">
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
      </div>
    </div>
  );
}
