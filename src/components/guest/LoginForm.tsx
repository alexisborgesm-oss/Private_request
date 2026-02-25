"use client";
import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${appUrl}/auth/hash-callback?next=/p` }
    });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <form onSubmit={onSend} className="space-y-4">
      <Input
        label="Email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <Button type="submit" className="w-full" disabled={!email}>
        Send sign-in link
      </Button>
      {sent ? <div className="text-sm text-ink/70">Check your email for the sign-in link.</div> : null}
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
    </form>
  );
}
